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

namespace divecomputer_test {
    public partial class Form1 : Form {
        public Form1() {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e) {
            var descriptors = Descriptor.Descriptors();

            var l = new List<string>();
            foreach(var descriptor in descriptors) {
                l.Add(String.Format("{0} {1}", descriptor.vendor, descriptor.product));
            }
            l.Sort();

            ComputerSelector.Items.AddRange(l.ToArray<string>());

            LabelVersion.Text = "libdivelog v" + LibDiveComputer.Version.AsString;

        }
    }
}
