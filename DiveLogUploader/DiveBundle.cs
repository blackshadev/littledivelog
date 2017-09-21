using LibDiveComputer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DiveLogUploader {

    /// <summary>
    /// Holds computer and dives data
    /// </summary>
    public class DiveBundle {
        public Computer Computer { get; protected set; }
        public List<Dive> Dives { get; protected set; }
        public DateTime ReadTime { get; protected set; }


        protected DiveBundle() {
            ReadTime = DateTime.Now;
            Dives = new List<Dive>();
        }

        public DiveBundle(Device device) : this() {
            Computer = new Computer(device);
        }

        public DiveBundle(Descriptor descr) : this() {
            Computer = new Computer(descr);
        }

        public void Add(Dive d) {
            Dives.Add(d);
        }
    }

}
