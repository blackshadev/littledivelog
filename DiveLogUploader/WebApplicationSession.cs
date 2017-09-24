using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Security.Authentication;
using System.Threading.Tasks;

namespace DiveLogUploader {

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

    public class GetImportResponseData {

        [JsonProperty("user")]
        public UserData user;

        [JsonProperty("computers")]
        public Computer[] computers;
    }

    public class DataEventArgs : EventArgs {
        public GetImportResponseData Data;
    }

    public class LoginResponseData {
        public string jwt;
    }

    public class LoginRequestData {
        public string email;
        public string password;
    }
    /*
    public class ImportResponseUserData {
        public int user_id;
        public string email;
        public string name;
        public int dive_count;
    }

    public class ImportResponseComputerData {
        public int computer_id;
        public uint serial;
        public string vendor;
        public uint model;
        public uint type;
        public string name;
        public DateTime last_read;
        public string last_fingerprint;
        public int dive_count;
    }

    public class ImportResponseData {
        public List<ImportResponseComputerData> computers;
        public ImportResponseUserData user;
    }
    */

    public class WebApplicationSession {

        public delegate void EventHandler(object sender, EventArgs e);

        public delegate void ErrorEventHandler(object sender, ErrorEventArgs e);

        public delegate void DataEventHandler(object sender, DataEventArgs e);

        public event EventHandler OnTokenChanged;

        public event DataEventHandler OnData;

        public event ErrorEventHandler OnError;

        private static readonly string BASE_URL = "https://dive.littledev.nl/api/";

        private string _token;

        public string Token {
            get { return _token; }
            private set {
                _token = value;
                OnTokenChanged?.Invoke(this, new EventArgs { });
            }
        }

        private GetImportResponseData Data;

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

        public async Task Login(string email, string password) {
            var d = JToken.FromObject(new {
                email = email,
                password = password,
            });

            try {
                LoginResponseData dat;
                dat = await Request.JsonAsync<LoginRequestData, LoginResponseData>(
                    BASE_URL + "auth/",
                    HttpVerb.POST,
                    new LoginRequestData {
                        email = email,
                        password = password
                    },
                    new Dictionary<string, string>() {
                        { "Authorization", "Bearer " + Token }
                    }
                );
                if (dat == null) {
                    Token = null;
                    return;
                }
                Token = dat.jwt;
                await GetData();

            } catch(WebserviceError err) {
                HandleError(err);
                return;
            }
            
        }

        private async Task GetData() {
            try {
                var result = await Request.JsonAsync<GetImportResponseData>(
                    BASE_URL + "import",
                    HttpVerb.GET,
                    new Dictionary<string, string>() {
                        { "Authorization", "Bearer " + Token }
                    }
                );

                if (result == null || result.user == null || result.computers == null) {
                    throw new Exception("Invalid response from server");
                }

                OnData?.Invoke(this, new DataEventArgs { Data = result });
            } catch(WebserviceError err) {
                HandleError(err);
            }
        }

        private void HandleError(Exception e) {
            OnError?.Invoke(this, new ErrorEventArgs(e));
        }
    }
}