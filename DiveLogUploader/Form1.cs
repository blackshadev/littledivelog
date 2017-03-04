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
        public Form1() {
            InitializeComponent();
            LibContext = new Context();
            LibContext.logfunc = (IntPtr context, dc_loglevel_t loglevel, string file, uint line, string function, string message, IntPtr userdata) =>
            {
                LogTextBox.AppendText(String.Format("[{0}]: {1}", DateTime.Now, message));
            };
            LibContext.loglevel = dc_loglevel_t.DC_LOGLEVEL_ALL;
        }
        
        protected Context LibContext;

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

            LogLevelSelector.SelectedIndex = 5;

        }

        private void LogLevelSelector_SelectedValueChanged(object sender, EventArgs e)
        {
            if (LogLevelSelector.SelectedItem == null) return;
            var item = (KeyValuePair < dc_loglevel_t, string>)LogLevelSelector.SelectedItem;

            LibContext.loglevel = item.Key;
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
            
            try
            {
                StartReading(kvpComputer.Key, kvpPort.Key);
            } catch (Exception err)
            {
                StateLabel.ForeColor = Color.Red;
                StateLabel.Text = "Error while opening device: " + err.Message;
            }
            

        }

        private void StartReading(Descriptor descriptor, string port)
        {
            var dev = new Device(LibContext, descriptor, port);
            dev.OnWaiting += () => { StateLabel.Text = "Waiting..."; };
            dev.OnProgess += (prog) => { Progress.Value = (int)(prog.current / prog.maximum * 100); };
            dev.OnDeviceInfo += (devInfo) => { StateLabel.Text = String.Format("Device: {0}, firmware {1}", devInfo.serial, devInfo.firmware); };
            
        }

        private void RefreshPortButton_Click(object sender, EventArgs e)
        {
            LoadSerialPorts();
        }
    }
}
