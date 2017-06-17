using DiveLogUploader;
using LibDiveComputer;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.IO.Ports;
using System.Configuration;
using System.Linq;
using System.Windows.Forms;
using static LibDiveComputer.Context;
using System.Security.Authentication;
using Newtonsoft.Json.Linq;

namespace divecomputer_test {

    public partial class Form1 : Form {

        private class Session {
            public string serialPort;
            public string computer;
            public string destination;

            [JsonIgnore]
            public WebApplicationSession WebAppSession { get; private set; }

            public string appToken { get { return WebAppSession.Token; } }
            protected Configuration config;

            public Session() {
                config = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
                WebAppSession = new WebApplicationSession();
                WebAppSession.OnTokenChanged += (sender, args) => {
                    Save();
                };
            }

            public void Save() {
                
                if (config.AppSettings.Settings["last_session"] == null)
                    config.AppSettings.Settings.Add("last_session", "{}");
                config.AppSettings.Settings["last_session"].Value = JsonConvert.SerializeObject(this);
                config.Save();
            }

            public void Load() {
                string sData = null;
                try {
                    sData = config.AppSettings.Settings["last_session"].Value;
                } catch (Exception) { }
                
                if (sData == null || sData == "") return;
                var sess = JObject.Parse(sData);
                WebAppSession.SetToken(sess["appToken"].ToString());
                serialPort = sess["serialPort"].ToString();
                computer = sess["computer"].ToString();
                destination = sess["destination"].ToString();
            }
        }

        private class TargetObject {
            public dc_loglevel_t logLevel;
            public Context ctx;
            public Device device;
            public Descriptor descriptor;
            public string serialPort;
            public Bundle bundle;
            public string fingerprint;
        }

        private Session session = new Session();

        public Form1() {
            InitializeComponent();
            session.WebAppSession.OnData += (sender, args) => {
                SetAccountDetails(args.Data);
            };
        } 



        private Context CreateContext(dc_loglevel_t logLevel) {
            var ctx = new Context();
            ctx.logfunc = (IntPtr context, dc_loglevel_t loglevel, string file, uint line, string function, string message, IntPtr userdata) => {
                Log(message);
            };
            ctx.loglevel = logLevel;
            return ctx;
        }

        private void Form1_Load(object sender, EventArgs e) {
            VersionLabel.Text = "libdivelog v" + LibDiveComputer.Version.AsString;

            session.Load();

            LoadSerialPorts();
            LoadComputerSelector();
            LoadLogLevelList();
            SaveFileText.Text = session.destination ?? "";
        }

        private void LoadSerialPorts() {
            PortSelector.Items.Clear();
            PortSelector.DisplayMember = "Value";
            PortSelector.ValueMember = "Key";

            var ports = SerialPort.GetPortNames();
            // Use KeyValuePairs just in case the portName is not the same as the address to use it
            var kvps = ports.Select((s) => new KeyValuePair<string, string>(s, s));


            foreach (var kvp in kvps) {
                PortSelector.Items.Add(kvp);
                if (session.serialPort == kvp.Value) PortSelector.SelectedItem = kvp;
            }
        }

        private void LoadComputerSelector() {
            ComputerSelector.DisplayMember = "Value";
            ComputerSelector.ValueMember = "Key";

            var descriptors = Descriptor.Descriptors();
            var list = (
                from s in descriptors
                orderby s.vendor, s.product
                select new KeyValuePair<Descriptor, string>(s, s.vendor + " " + s.product)
            );

            foreach (var kvp in list) {
                ComputerSelector.Items.Add(kvp);
                if (session.computer == kvp.Value) ComputerSelector.SelectedItem = kvp;
            }
        }

        private void LoadLogLevelList() {
            LogLevelSelector.DisplayMember = "Value";
            LogLevelSelector.ValueMember = "Key";

            LogLevelSelector.Items.Add(new KeyValuePair<dc_loglevel_t, string>(dc_loglevel_t.DC_LOGLEVEL_NONE, "None"));
            LogLevelSelector.Items.Add(new KeyValuePair<dc_loglevel_t, string>(dc_loglevel_t.DC_LOGLEVEL_ERROR, "Error"));
            LogLevelSelector.Items.Add(new KeyValuePair<dc_loglevel_t, string>(dc_loglevel_t.DC_LOGLEVEL_WARNING, "Warning"));
            LogLevelSelector.Items.Add(new KeyValuePair<dc_loglevel_t, string>(dc_loglevel_t.DC_LOGLEVEL_INFO, "Info"));
            LogLevelSelector.Items.Add(new KeyValuePair<dc_loglevel_t, string>(dc_loglevel_t.DC_LOGLEVEL_DEBUG, "Debug"));
            LogLevelSelector.Items.Add(new KeyValuePair<dc_loglevel_t, string>(dc_loglevel_t.DC_LOGLEVEL_ALL, "All"));

            LogLevelSelector.SelectedIndex = 0;
        }
        
        public void SetAccountDetails(WebApplicationData data) {
            AccountPanel.Visible = true;
            LoginPanel.Visible = false;
            LabelAccountEmail.Text = data.email;
            LabelAccountName.Text = data.name;
            LabelAccountDiveCount.Text = data.TotalDiveCount.ToString();
            LabelAccountLastUpload.Text = data.LastUsed.ToShortDateString();
        }

        private void LogLevelSelector_SelectedValueChanged(object sender, EventArgs e) {
            if (LogLevelSelector.SelectedItem == null) return;
            var item = (KeyValuePair<dc_loglevel_t, string>)LogLevelSelector.SelectedItem;
        }

        private void StartButton_Click(object sender, EventArgs e) {
            if (PortSelector.SelectedItem == null) {
                StateLabel.Text = "No serial port selected";
                StateLabel.ForeColor = Color.Red;
                return;
            }

            if (ComputerSelector.SelectedItem == null) {
                StateLabel.Text = "No computer selected";
                StateLabel.ForeColor = Color.Red;
                return;
            }
            if (SaveFileText.Text == null || SaveFileText.Text == "") {
                StateLabel.Text = "No save path selected";
                StateLabel.ForeColor = Color.Red;
                return;
            }


            StateLabel.ForeColor = Color.Black;

            var kvpComputer = (KeyValuePair<Descriptor, string>)ComputerSelector.SelectedItem;
            var kvpPort = (KeyValuePair<string, string>)PortSelector.SelectedItem;
            var kvpLogLevel = (KeyValuePair<dc_loglevel_t, string>)LogLevelSelector.SelectedItem;

            currentTask = new TargetObject {
                descriptor = kvpComputer.Key,
                serialPort = kvpPort.Key,
                logLevel = kvpLogLevel.Key
            };

            StartButton.Enabled = false;
            DivecomputerWorker.RunWorkerAsync();
        }


        private TargetObject currentTask;

        private void RefreshPortButton_Click(object sender, EventArgs e) {
            LoadSerialPorts();
        }

        private void StartReading(Descriptor descriptor, string port) {
            DivecomputerWorker.RunWorkerAsync();
        }

        /// <summary>
        /// Retrieves then fingerprint of the computer from the app.config
        /// </summary>
        private void GetFingerprint() {
            try {
                var val = ConfigurationManager.AppSettings[$"{currentTask.bundle.Computer.Serial}"];
                if (val != null) {
                    currentTask.fingerprint = val;
                }
            } catch (Exception) { }

        }

        private void SetFignerprint(byte[] fingerprint) {
            var comp = currentTask.bundle.Computer.Serial;

            ConfigurationManager.AppSettings.Set(comp.ToString(), currentTask.fingerprint);
        }

        private void DivecomputerWorker_DoWork(object sender, DoWorkEventArgs e) {
            var args = currentTask;
            args.ctx = CreateContext(args.logLevel);

            try {
                args.device = new Device(args.ctx, args.descriptor, args.serialPort);

                args.device.OnWaiting += () => { SetState("Waiting..."); };
                args.device.OnProgess += (prog) => { SetProgress((int)((float)prog.current / prog.maximum * 100)); };
                args.device.OnDeviceInfo += (devInfo) => {
                    SetState(String.Format("Device: {0}, firmware {1}", devInfo.serial, devInfo.firmware));
                    args.bundle = new Bundle(args.device);
                    var old = args.fingerprint;
                    GetFingerprint();
                    //if (args.fingerprint != old) {

                    //args.device.Cancel();
                    //args.device.Start();
                    //}
                };
                args.device.OnClock += (clock) => {
                    Console.WriteLine(String.Format("systime: {0}, devtime: {1}", clock.systime, clock.devtime));
                };
                args.device.OnDive += (data, size, fingerprint, fsize, udata) => {
                    args.bundle.Add(
                        Dive.Parse(args.device, data, fingerprint)
                    );
                };

                args.device.Start();
                args.fingerprint = args.bundle.Dives[args.bundle.Dives.Count - 1].Fingerprint;


                var txt = JsonConvert.SerializeObject(
                    args.bundle,
                    Formatting.Indented,
                    new JsonSerializerSettings {
                        NullValueHandling = NullValueHandling.Ignore
                    }
                );

                File.WriteAllText(SaveFileText.Text, txt);
                SetState("Saved to file");
            } catch (Exception err) {
                SetState("Error while opening device: " + err.Message, Color.Red);
            }

            if (args.fingerprint != null)
                SetFignerprint(Convert.FromBase64String(args.fingerprint));
            SetProgress(0, false);
        }

        private void DivecomputerWorker_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e) {
            Invoke(new Action(() => {
                if (currentTask.ctx != null) currentTask.ctx.Dispose();
                if (currentTask.device != null) currentTask.device.Dispose();
                currentTask.bundle = null;
                currentTask = null;
                StartButton.Enabled = true;
                Progress.Visible = false;
            }));
        }

        private void SetState(string text, Color? color = null) {
            Color c = color == null ? Color.Black : (Color)color;
            if (InvokeRequired) {
                Invoke(new Action(() => { SetState(text, c); }));
            } else {
                StateLabel.Text = text;
                StateLabel.ForeColor = c;
            }
        }

        private void SetProgress(int progress, bool visible = true) {
            if (InvokeRequired) {
                Invoke(new Action(() => { SetProgress(progress); }));
            } else {
                Progress.Visible = visible;
                Progress.Value = progress;
            }
        }

        private void Log(string txt) {
            if (InvokeRequired) {
                Invoke(new Action(() => { Log(txt); }));
            } else {
                LogTextBox.AppendText(String.Format("[{0}]: {1}\n", DateTime.Now, txt));
                LogTextBox.SelectionStart = LogTextBox.Text.Length;
                LogTextBox.ScrollToCaret();
            }
        }

        private void BrowseButton_Click(object sender, EventArgs e) {
            SaveFileDialog.FileName = SaveFileText.Text;
            if (SaveFileDialog.ShowDialog() == DialogResult.OK) {
                SaveFileText.Text = SaveFileDialog.FileName;
            }
        }

        private void PortSelector_Changed(object sender, EventArgs e) {
            session.serialPort = PortSelector.SelectedItem == null ? null : ((KeyValuePair<string, string>)PortSelector.SelectedItem).Key;
            session.Save();
        }

        private void ComputerSelector_Changed(object sender, EventArgs e) {
            if (ComputerSelector.SelectedItem == null) session.computer = null;
            else {
                var comp = (KeyValuePair<Descriptor, string>)ComputerSelector.SelectedItem;
                session.computer = comp.Value;
            }

            session.Save();
        }

        private void SaveFileText_Changed(object sender, EventArgs e) {
            session.destination = SaveFileText.Text;
            session.Save();
        }

        private async void loginButton_Click(object sender, EventArgs e) {
            AuthErrLabel.Text = "";
            loginButton.Enabled = false;
            
            try {
                await session.WebAppSession.Login(UsernameIput.Text, passwordInput.Text);
            } catch(AggregateException err) {
                AuthErrLabel.Text = err.InnerException.Message;
            }
            loginButton.Enabled = true;

        }
    }
}