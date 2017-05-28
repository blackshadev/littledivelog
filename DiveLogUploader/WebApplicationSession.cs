using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Authentication;
using System.Text;
using System.Threading.Tasks;

namespace DiveLogUploader
{
    internal class WebApplicationData {
        [JsonProperty("import_id")]
        public int ImportId;

        [JsonProperty("import_dive_count")]
        public int DiveCount;

        [JsonProperty("username")]
        public int Username;

        [JsonProperty("user_id")]
        public int UserId;

        [JsonProperty("total_dive_count")]
        public int TotalDiveCount;

    }

    public class WebApplicationSession
    {
        public delegate void EventHandler(object sender, EventArgs e);
        public delegate void ErrorEventHandler(object sender, ErrorEventArgs e);


        public event EventHandler OnData;
        public event EventHandler OnTokenChanged;
        public event ErrorEventHandler OnError;
        
        private static readonly string BASE_URL = "https://divelog.littledev.nl/api/";
        public async static Task<JObject> RequestWebApp(string method, string path, JToken data = null, string token = null) {
            var req = WebRequest.Create(BASE_URL + path);
            req.Method = method;

            if (token != null) {
                req.Headers.Add("Authorization", "Bearer " + token);
            }
            if(data != null) {
                req.ContentType = "application/json";

                using (var writer = new StreamWriter(await req.GetRequestStreamAsync())) {
                    var strData = JsonConvert.SerializeObject(data);
                    await writer.WriteAsync(strData);
                    await writer.FlushAsync();
                    writer.Close();
                }
            }

            var httpResponse = (HttpWebResponse) await req.GetResponseAsync();

            JObject result;
            using (var rdr = new StreamReader(httpResponse.GetResponseStream())) {
                result = JObject.Parse(await rdr.ReadToEndAsync());
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

        public async Task Login(string username, string password)
        {
            var d = JToken.FromObject(new {
                username = username,
                password = password,
            });
            var dat = await RequestWebApp("POST", "import", d, null);
            if (dat["error"] != null) {
                Token = null;
                HandleError(
                    new AuthenticationException(dat["error"].ToString())
                );
            }

            Token = dat["data"].ToString();
            await GetData();
        }

        private async Task GetData() {
            var dat = await RequestWebApp("GET", "import", null, Token);
            if(dat["error"] != null) {
                Token = null;
                HandleError(
                    new AuthenticationException(dat["error"].ToString())
                );
            }
            OnData?.Invoke(this, new EventArgs { });
        }

        private void HandleError(Exception e) {
            OnError?.Invoke(this, new ErrorEventArgs(e));
            throw e;
        }
    }
}
