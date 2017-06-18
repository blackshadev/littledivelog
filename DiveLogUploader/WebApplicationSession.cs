using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Authentication;
using System.Text;
using System.Threading.Tasks;

namespace DiveLogUploader
{

    public class UserData {
        [JsonProperty("user_id")]
        public int UserId;
        [JsonProperty("email")]
        public string Email;
        [JsonProperty("name")]
        public string Name;
        [JsonProperty("dive_count")]
        public int DiveCount;

    }

    public class WebApplicationData {

        [JsonProperty]
        public UserData user;

        [JsonProperty]
        public Computer[] computers;
    }

    public class DataEventArgs : EventArgs {
        public WebApplicationData Data;
    }

    public class WebApplicationSession
    {
        public delegate void EventHandler(object sender, EventArgs e);
        public delegate void ErrorEventHandler(object sender, ErrorEventArgs e);
        public delegate void DataEventHandler(object sender, DataEventArgs e);

        public event EventHandler OnTokenChanged;
        public event DataEventHandler OnData;
        public event ErrorEventHandler OnError;
        
        private static readonly string BASE_URL = "https://dive.littledev.nl/api/";
        public async static Task<JObject> RequestWebApp(string method, string path, JToken data = null, string token = null) {
            JObject result = null;
            try {
                var req = HttpWebRequest.Create(BASE_URL + path) as HttpWebRequest;
                req.Date = DateTime.Now;
                req.Method = method;
                var client = new HttpClient();

                if (token != null) {
                    req.Headers.Add("Authorization", "Bearer " + token);
                }
                if (data != null) {
                    req.ContentType = "application/json";

                    var reqStrm = await req.GetRequestStreamAsync().ConfigureAwait(false); ;
                    using (var writer = new StreamWriter(reqStrm)) {
                        var strData = JsonConvert.SerializeObject(data);
                        await writer.WriteAsync(strData).ConfigureAwait(false);
                        await writer.FlushAsync().ConfigureAwait(false);
                        writer.Close();
                    }
                }

                var httpResponse = await req.GetResponseAsync().ConfigureAwait(false);

                using (var rdr = new StreamReader(httpResponse.GetResponseStream())) {
                    result = JObject.Parse(await rdr.ReadToEndAsync().ConfigureAwait(false));
                }
            } catch (WebException e) {
                var httpResponse = e.Response;
                using (var rdr = new StreamReader(httpResponse.GetResponseStream())) {
                    result = JObject.Parse(await rdr.ReadToEndAsync().ConfigureAwait(false));
                }
            } catch (Exception e) {
                Console.Write(e);
            }
            
            return result;
        }

        private string _token;
        public string Token {
            get { return _token; }
            private set {
                _token = value;
                OnTokenChanged?.Invoke(this, new EventArgs { });
            }
        }
        private WebApplicationData Data;

        public bool IsLoggedIn {
            get { return Token != null && Data != null; }
        }

        public WebApplicationSession() {
            Token = null;
            Data = null;
        }

        public async void SetToken(string token) {
            Token = token;
            await GetData();
        }

        public async Task Login(string email, string password)
        {
            var d = JToken.FromObject(new {
                email = email,
                password = password,
            });
            var dat = await RequestWebApp("POST", "auth/", d, null);
            if(dat == null) {
                Token = null;
                return;
            }
            if (dat["error"] != null) {
                Token = null;
                HandleError(
                    new AuthenticationException(dat["error"].ToString())
                );
            }

            Token = dat["jwt"].ToString();
            await GetData();
        }

        private async Task GetData() {
            var dat = await RequestWebApp("GET", "import/", null, Token);
            if(dat["error"] != null) {
                Token = null;
                HandleError(
                    new AuthenticationException(dat["error"].ToString())
                );
            }
            var result = dat.ToObject<WebApplicationData>();
            if(result == null || result.user == null || result.computers == null) {
                throw new Exception("Invalid response from server");
            } 

            OnData?.Invoke(this, new DataEventArgs { Data = result });
        }

        private void HandleError(Exception e) {
            OnError?.Invoke(this, new ErrorEventArgs(e));
            throw e;
        }
    }
}
