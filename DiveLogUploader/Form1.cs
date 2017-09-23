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
using DiveLogUploader.Writers;

namespace divecomputer_test {

    public partial class Form1 : Form {
        
        private class TargetObject {
            public dc_loglevel_t logLevel;
            public Context ctx;
            public Device device;
            public Descriptor descriptor;
            public string serialPort;
            public DiveBundle bundle;
            public string fingerprint;
        }

        private SessionStore Session = new SessionStore();

        public Form1() {
            InitializeComponent();
            Session.WebAppSession.OnData += (sender, args) => {
                SetAccountDetails(args.Data);
            };

            Session.WebAppSession.OnError += (sender, err) => {
                AuthErrLabel.Text = err.GetException().Message;
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

            Session.Load();

            LoadSerialPorts();
            LoadComputerSelector();
            LoadLogLevelList();
            SaveFileText.Text = Session.Destination ?? "";

            if (Session.Target == TargetType.File) {
                FileRadio.Checked = true;
            } else if(Session.Target == TargetType.DiveLog) {
                LogRadio.Checked = true;
            }
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
                if (Session.SerialPort == kvp.Value) PortSelector.SelectedItem = kvp;
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
                if (Session.Computer == kvp.Value) ComputerSelector.SelectedItem = kvp;
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
            LabelAccountEmail.Text = data.user.Email;
            LabelAccountName.Text = data.user.Name;
            LabelAccountDiveCount.Text = data.user.DiveCount.ToString();
            LabelAccountComputerCount.Text = data.computers.Length.ToString();

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

        private void SetFignerprint(uint comp, byte[] fingerprint) {
            ConfigurationManager.AppSettings.Set(comp.ToString(), currentTask.fingerprint);
        }

        private void DivecomputerWorker_DoWork(object sender, DoWorkEventArgs e) {
            SetReadProgress(0, true);
            SetWriteProgress(0, true);

            var args = currentTask;
            args.ctx = CreateContext(args.logLevel);
            var writer = new FileDiveWriter(SaveFileText.Text);
            writer.OnProgres += (_, total, processed) => {
                SetWriteProgress((int)((float)processed / total * 100), true);
            };
            writer.OnComplete += (_) => {
                SetWriteProgress(100, true);
            };

            try {
                args.device = new Device(args.ctx, args.descriptor, args.serialPort);
                writer.SetDevice(args.device);

                args.device.OnWaiting += () => { SetState("Waiting..."); };
                args.device.OnProgess += (prog) => { SetReadProgress((int)((float)prog.current / prog.maximum * 100)); };
                args.device.OnDeviceInfo += (devInfo) => {
                    SetState(String.Format("Device: {0}, firmware {1}", devInfo.serial, devInfo.firmware));
                    var old = args.fingerprint;
                    GetFingerprint();
                    writer.Start();
                };
                args.device.OnClock += (clock) => {
                    Console.WriteLine(String.Format("systime: {0}, devtime: {1}", clock.systime, clock.devtime));
                };

                Dive lastDive = null;
                args.device.OnDive += (data, size, fingerprint, fsize, udata) => {
                    lastDive = Dive.Parse(args.device, data, fingerprint);
                    writer.AddDive(lastDive);
                };

                args.device.Start();
                SetReadProgress(100, true);

                writer.End();
                if (lastDive != null) {
                    args.fingerprint = lastDive.Fingerprint;
                }

                SetState("Saved to file");
            } catch (Exception err) {
                SetState("Error while opening device: " + err.Message, Color.Red);
            }

            if (args.fingerprint != null)
                SetFignerprint(args.device.Serial.Value, Convert.FromBase64String(args.fingerprint));

            SetReadProgress(100, false);
            SetWriteProgress(100, false);
        }

        private void DivecomputerWorker_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e) {
            Invoke(new Action(() => {
                if (currentTask.ctx != null) currentTask.ctx.Dispose();
                if (currentTask.device != null) currentTask.device.Dispose();
                currentTask.bundle = null;
                currentTask = null;
                StartButton.Enabled = true;
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

        private void SetReadProgress(int readProgress, bool enabled = true) {
            if (InvokeRequired) {
                Invoke(new Action(() => { SetReadProgress(readProgress, enabled); }));
            } else {
                ReadProgress.Enabled = enabled;
                ReadProgress.Value = readProgress;
            }
        }

        private void SetWriteProgress(int writeProgress, bool enabled = true) {
            if (InvokeRequired) {
                Invoke(new Action(() => { SetWriteProgress(writeProgress, enabled); }));
            } else {
                WriteProgress.Enabled = enabled;
                WriteProgress.Value = writeProgress;
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
            Session.SerialPort = PortSelector.SelectedItem == null ? null : ((KeyValuePair<string, string>)PortSelector.SelectedItem).Key;
            Session.Save();
        }

        private void ComputerSelector_Changed(object sender, EventArgs e) {
            if (ComputerSelector.SelectedItem == null) Session.Computer = null;
            else {
                var comp = (KeyValuePair<Descriptor, string>)ComputerSelector.SelectedItem;
                Session.Computer = comp.Value;
            }

            Session.Save();
        }

        private void SaveFileText_Changed(object sender, EventArgs e) {
            Session.Destination = SaveFileText.Text;
            Session.Save();
        }

        private async void loginButton_Click(object sender, EventArgs e) {
            AuthErrLabel.Text = "";
            loginButton.Enabled = false;
            
            await Session.WebAppSession.Login(UsernameIput.Text, passwordInput.Text);
            
            loginButton.Enabled = true;

        }

        private void LogRadio_CheckedChanged(object sender, EventArgs e) {
            if (LogRadio.Checked && !Session.WebAppSession.IsLoggedIn) {
                LogRadio.Checked = false;
                FormTabs.SelectedTab = FormTabs.TabPages["DiversLogTab"];
                AuthErrLabel.Text = "Please login in order to upload dives";
            } else {
                TargetRadio_CheckedChanged(sender, e);
            }
        }

        private void TargetRadio_CheckedChanged(object sender, EventArgs e) {
            if (LogRadio.Checked) {
                Session.Target = TargetType.DiveLog;
            } else if(FileRadio.Checked) {
                Session.Target = TargetType.File;
            } else {
                Session.Target = TargetType.None;
            }
            Session.Save();
        }
    }
}