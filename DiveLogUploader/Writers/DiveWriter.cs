using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DiveLogUploader.Writers {
    public delegate void OnCompleteHandler(object sender);
    public  interface IDiveWriter {
        event OnCompleteHandler OnComplete;
        void SetDevice();
        void AddDive(Dive dive);
        void Done();

    }
}
