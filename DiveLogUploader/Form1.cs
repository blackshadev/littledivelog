using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using LibDiveComputer;
using static LibDiveComputer.Context;
using System.Runtime.InteropServices;
using System.IO.Ports;

namespace divecomputer_test {

    public partial class Form1 : Form {

        class TargetObject
        {
            public dc_loglevel_t logLevel;
            public Context ctx;
            public Device device;
            public Descriptor descriptor;
            public string serialPort;
        }

        public Form1() {
            InitializeComponent();
            
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
            LoadSerialPorts();
            LoadComputerSelector();
            LoadLogLevelList();
        }

        private void LoadSerialPorts()
        {
            PortSelector.Items.Clear();
            PortSelector.DisplayMember = "Value";
            PortSelector.ValueMember = "Key";

            var ports = SerialPort.GetPortNames();
            // Use KeyValuePairs just in case the portName is not the same as the address to use it
            var kvps = ports.Select((s) => new KeyValuePair<string,string>(s,s));

            foreach(var kvp in kvps)
            {
                PortSelector.Items.Add(kvp);
            }
        }

        private void LoadComputerSelector()
        {

            ComputerSelector.DisplayMember = "Value";
            ComputerSelector.ValueMember = "Key";

            var descriptors = Descriptor.Descriptors();

            foreach (var descriptor in descriptors)
            {
                ComputerSelector.Items.Add(
                    new KeyValuePair<Descriptor, string>(
                        descriptor,
                        String.Format("{0} {1}", descriptor.vendor, descriptor.product)
                    )
                );
            }

            VersionLabel.Text = "libdivelog v" + LibDiveComputer.Version.AsString;
        }

        private void LoadLogLevelList()
        {
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

        private void LogLevelSelector_SelectedValueChanged(object sender, EventArgs e)
        {
            if (LogLevelSelector.SelectedItem == null) return;
            var item = (KeyValuePair < dc_loglevel_t, string>)LogLevelSelector.SelectedItem;

            
        }

        private void StartButton_Click(object sender, EventArgs e)
        {

            if (PortSelector.SelectedItem == null)
            {
                StateLabel.Text = "No serial port selected";
                StateLabel.ForeColor = Color.Red;
                return;
            }

            if (ComputerSelector.SelectedItem == null)
            {
                StateLabel.Text = "No computer selected";
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

        private void RefreshPortButton_Click(object sender, EventArgs e)
        {
            LoadSerialPorts();
        }

        private void StartReading(Descriptor descriptor, string port)
        {
            DivecomputerWorker.RunWorkerAsync();
        }


        private void DivecomputerWorker_DoWork(object sender, DoWorkEventArgs e) 
        {
            var args = currentTask;
            args.ctx = CreateContext(args.logLevel);
            try {
                args.device = new Device(args.ctx, args.descriptor, args.serialPort);
                args.device.OnWaiting += () => { SetState("Waiting..."); };
                args.device.OnProgess += (prog) => { SetProgress((int)((float)prog.current / (float)prog.maximum * 100)); };
                args.device.OnDeviceInfo += (devInfo) => { SetState(String.Format("Device: {0}, firmware {1}", devInfo.serial, devInfo.firmware)); };
                args.device.OnClock += (clock) => {
                    Console.WriteLine(String.Format("systime: {0}, devtime: {1}", clock.systime, clock.devtime));
                };
                args.device.Start();
            } catch (Exception err) {
                SetState("Error while opening device: " + err.Message, Color.Red);
            }
        }

        private void SetState(string text, Color? color = null) 
        {
            Color c = color == null ? Color.Black : (Color)color;
            if(InvokeRequired) {
                Invoke(new Action(() => { SetState(text, c); }));
            } else {
                StateLabel.Text = text;
                StateLabel.ForeColor = c;
            }
        }

        private void SetProgress(int progress)
        {
            if (InvokeRequired) {
                Invoke(new Action(() => { SetProgress(progress); }));
            } else {
                Progress.Visible = true;
                Progress.Value = progress;
            }
        }

        private void Log(string txt)
        {
            if (InvokeRequired) {
                Invoke(new Action(() => { Log(txt); }));
            } else {
                LogTextBox.AppendText(String.Format("[{0}]: {1}\n", DateTime.Now, txt));
                LogTextBox.SelectionStart = LogTextBox.Text.Length;
                LogTextBox.ScrollToCaret();

            }
        }

        private void DivecomputerWorker_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {
            Invoke(new Action(() => { StartButton.Enabled = true; }));
        }
    }
}
