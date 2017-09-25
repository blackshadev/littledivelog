using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Runtime.Serialization;
using System.Threading.Tasks;

namespace DiveLogUploader {
    
    public class WebserviceError: Exception, ISerializable {
        
        public string error;

        public override string Message {
            get { return error; }
        }

        public string GetMessage() {
            return error;
        }

        public WebserviceError(SerializationInfo info, StreamingContext context) : base() {
            error = info.GetString("error");
        }

        public override string ToString() {
            return "WebserviceError: " + error;
        }
    }

    public enum HttpVerb {
        GET = 0,
        DELETE = 1,
        POST = 2,
        PUT = 3
    }

    public class Request {

        public static TOUT Json<TIN, TOUT>(string url, HttpVerb verb, TIN data, Dictionary<string, string> headers = null) {
            var serializer = new JsonSerializer();
            var request = CreateRequest(url, verb, "application/json", headers);
            
            using (var streamWriter = new StreamWriter(request.GetRequestStream())) {
                using (var jsonWriter = new JsonTextWriter(streamWriter)) {
                    serializer.Serialize(jsonWriter, data);
                }
            }
            
            return ParseRequestResponse<TOUT>(request, serializer);
        }

        public static TOUT Json<TOUT>(string url, HttpVerb verb, Dictionary<string, string> headers = null) {
            var serializer = new JsonSerializer();
            var request = CreateRequest(url, verb, "application/json", headers);
            
            return ParseRequestResponse<TOUT>(request, serializer);
        }

        public static async Task<TOUT> JsonAsync<TIN, TOUT>(string url, HttpVerb verb, TIN data = default(TIN), Dictionary<string, string> headers = null) {
            var serializer = new JsonSerializer();
            var request = CreateRequest(url, verb, "application/json", headers);

            if (!Equals(data, default(TIN))) {
                using (var streamWriter = new StreamWriter(await request.GetRequestStreamAsync())) {
                    using (var jsonWriter = new JsonTextWriter(streamWriter)) {
                        serializer.Serialize(jsonWriter, data);
                    }
                }
            }
            
            return await ParseRequestResponseAsync<TOUT>(request, serializer);
        }

        public static async Task<TOUT> JsonAsync<TOUT>(string url, HttpVerb verb, Dictionary<string, string> headers = null) {
            var serializer = new JsonSerializer();
            var request = CreateRequest(url, verb, "application/json", headers);
            
            return await ParseRequestResponseAsync<TOUT>(request, serializer);
        }


        private static HttpWebRequest CreateRequest(string url, HttpVerb verb, string contentType, Dictionary<string, string> headers = null) {
            var request = (HttpWebRequest)WebRequest.Create(url);
            var serializer = new JsonSerializer();
            request.Method = verb.ToString();

            if (headers != null) {
                foreach (var h in headers) {
                    request.Headers.Add(h.Key, h.Value);
                }
            }

            if(verb > HttpVerb.DELETE) {
                request.ContentType = contentType;
            }

            return request;
        }

        private static TOUT ParseRequestResponse<TOUT>(HttpWebRequest req, JsonSerializer serializer) {
            try {
                var resp = (HttpWebResponse)req.GetResponse();
                return ParseResponse<TOUT>(resp, serializer);
            } catch(WebException ex) {
                var data = ParseResponse<WebserviceError>((HttpWebResponse)ex.Response, serializer);
                throw data;
            }
        }
        private static async Task<TOUT> ParseRequestResponseAsync<TOUT>(HttpWebRequest req, JsonSerializer serializer) {
            try {
                var resp = (HttpWebResponse)await req.GetResponseAsync();
                return ParseResponse<TOUT>(resp, serializer);
            } catch (WebException ex) {
                var data = ParseResponse<WebserviceError>((HttpWebResponse)ex.Response, serializer);
                throw data;
            }
        }

        private static TOUT ParseResponse<TOUT>(HttpWebResponse response, JsonSerializer serializer) {
            TOUT obj;
            using (var streamReader = new StreamReader(response.GetResponseStream())) {
                using (var jsonReader = new JsonTextReader(streamReader)) {
                    if (response.StatusCode != HttpStatusCode.OK) {
                         throw serializer.Deserialize<WebserviceError>(jsonReader);
                    }
                    obj = serializer.Deserialize<TOUT>(jsonReader);
                }
            }
            return obj;
            
        }

    }
}
