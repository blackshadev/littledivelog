using DiveLogUploader;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Configuration;

namespace LibDiveComputer {

    public enum TargetType {
        None = 0,
        File,
        DiveLog,
    }

    public class SessionStore {
        public string SerialPort;
        public string Computer;
        public string Destination;
        public TargetType Target;

        [JsonIgnore]
        public WebApplicationSession WebAppSession { get; private set; }

        public string AppToken { get { return WebAppSession.Token; } }
        protected Configuration config;
        protected bool isAcceptingChanges = false;

        public SessionStore() {
            config = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
            WebAppSession = new WebApplicationSession();
            WebAppSession.OnTokenChanged += (sender, args) => {
                Save();
            };
        }

        public void TrackChanges() {
            isAcceptingChanges = true;
        }

        public void Save() {
            if (!isAcceptingChanges) return;

            if (config.AppSettings.Settings["last_session"] == null)
                config.AppSettings.Settings.Add("last_session", "{}");
            config.AppSettings.Settings["last_session"].Value = JsonConvert.SerializeObject(this);
            config.Save();
        }

        public void Load() {
            try {
                var sData = config.AppSettings.Settings["last_session"].Value;

                if (sData == null || sData == "") return;

                var sess = JObject.Parse(sData);
                WebAppSession.SetToken(sess["AppToken"].ToString());
                SerialPort = sess["SerialPort"].ToString();
                Computer = sess["Computer"].ToString();
                Destination = sess["Destination"].ToString();
                Target = sess["Target"].ToObject<TargetType>();
            } catch (Exception) { }
        }
    }
}