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

    public struct TankPressure
    {
        public uint Tank;
        public double Value;
    }

    public struct Event
    {
        public string Name;
        public uint Type;
        public uint Time;
        public uint Flags;
        public uint Value;
    }

    public class Sample
    {
        public uint Time;
        public double? Depth;
        public uint? Bearing;
        public double? Temperature;
        public uint? Heartbeat;
        public TankPressure? Pressure;
        public List<Event> Events;

        public Sample()
        {
            Events = new List<Event>();
        }

        public void ProcessSampleEvent(Parser.dc_sample_type_t t, Parser.dc_sample_value_t value) {
            switch(t)
            {
                case Parser.dc_sample_type_t.DC_SAMPLE_TIME:
                    Time = value.time;
                    break;
                case Parser.dc_sample_type_t.DC_SAMPLE_DEPTH:
                    Depth = value.depth;
                    break;
                case Parser.dc_sample_type_t.DC_SAMPLE_BEARING:
                    Bearing = value.bearing;
                    break;
                case Parser.dc_sample_type_t.DC_SAMPLE_TEMPERATURE:
                    Temperature = value.temperature;
                    break;
                case Parser.dc_sample_type_t.DC_SAMPLE_HEARTBEAT:
                    Heartbeat = value.heartbeat;
                    break;
                case Parser.dc_sample_type_t.DC_SAMPLE_PRESSURE:
                    Pressure = new TankPressure
                    {
                        Tank = value.pressure_tank,
                        Value = value.pressure_value
                    };
                    break;
                case Parser.dc_sample_type_t.DC_SAMPLE_EVENT:
                    this.Events.Add(new Event
                    {
                        Name = Parser.EventNames[value.event_type],
                        Type = value.event_type,
                        Time = value.event_time,
                        Flags = value.event_flags,
                        Value = value.event_value
                    });
                    break;
            }

        }
        
    }
}
