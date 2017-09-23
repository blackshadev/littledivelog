using LibDiveComputer;
using System.Net;

namespace DiveLogUploader.Writers {

    public class LittleLogDiveWriter : AsyncDiveWriter {
        
        public override void SetDevice(Device d) {
            base.SetDevice(d);
            
        }

        protected override void ProcessDive(Dive dive) {
        }
    }
}