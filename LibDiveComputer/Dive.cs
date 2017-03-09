using LibDiveComputer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibDiveComputer
{
    public class Computer
    {
        public string Name { get; protected set; }
        public string Vendor { get; protected set; }
        public uint Model { get; protected set; }
        public uint Type { get; protected set; }
        public uint? Serial { get; protected set; }

        public Computer(Descriptor descr)
        {
            Name = descr.product;
            Vendor = descr.vendor;
            Model = descr.model;
            Type = descr.type;
        }

        public Computer(Device dev) : this(dev.Descriptor)
        {
            Serial = dev.Serial;
            Model = dev.Model.HasValue ? dev.Model.Value : Model;
        }
    }

    public class Dive
    {
        /// <summary>
        /// Base64 encoded fingerprint
        /// </summary>
        public string Fingerprint { get; protected set; }
        public DateTime Date { get; protected set; }
        public TimeSpan? DiveTime { get; protected set; }
        public double? MaxDepth { get; protected set; }
        public List<Sample> Samples { get; protected set; }

        protected Dive()
        {
            Samples = new List<Sample>();
        }

        

        static Dive Parse(Device dev, byte[] fingerprint, byte[] data)
        {
            var parser = new Parser(dev);

            var dive = Parse(parser, data);
            dive.Fingerprint = Convert.ToBase64String(fingerprint);

            parser.Dispose();

            return dive;
        }

        static Dive Parse(Parser parser, byte[] data)
        {
            var dive = new Dive();
            parser.SetData(data);

            dive.Date = parser.GetDatetime();
            var t = parser.GetField<uint?>(Parser.dc_field_type_t.DC_FIELD_DIVETIME);
            if(t.HasValue) dive.DiveTime = new TimeSpan(0, (int)t.Value / 60, (int)t.Value % 60);
            dive.MaxDepth = parser.GetField<double?>(Parser.dc_field_type_t.DC_FIELD_MAXDEPTH);

            parser.ReadSamples();

            return dive;
        }
        

    }

    public class Sample
    {
        public bool Done { get; protected set; }
        public uint Time;


        public void ProcessSampleEvent(Parser.dc_sample_type_t t) { }
        
    }
}
