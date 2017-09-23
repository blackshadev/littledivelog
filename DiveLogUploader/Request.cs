using Newtonsoft.Json;
using System.IO;
using System.Net;

namespace DiveLogUploader {
    public enum HttpVerb {
        GET,
        POST,
        PUT,
        DELETE
    }

    public class Request {

        public static TOUT JSON<TIN, TOUT>(string url, HttpVerb verb, TIN data) {
            var request = (HttpWebRequest)WebRequest.Create(url);
            var serializer = new JsonSerializer();
            request.ContentType = "application/json";
            request.Method = verb.ToString();

            using (var streamWriter = new StreamWriter(request.GetRequestStream())) {
                using (var jsonWriter = new JsonTextWriter(streamWriter)) {
                    serializer.Serialize(jsonWriter, data);
                }
            }

            var response = (HttpWebResponse)request.GetResponse();
            using (var streamReader = new StreamReader(response.GetResponseStream())) {
                // TODO: JSON read
            }
            
            return default(TOUT);
        }

    }
}
