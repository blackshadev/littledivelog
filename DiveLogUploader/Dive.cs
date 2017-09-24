using LibDiveComputer;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace DiveLogUploader {

    /// <summary>
    /// Holds dive computer information
    /// </summary>
    public class Computer {

        [JsonProperty("name")]
        public string Name { get; protected set; }

        [JsonProperty("vendor")]
        public string Vendor { get; protected set; }

        [JsonProperty("model")]
        public uint Model { get; protected set; }

        [JsonProperty("type")]
        public uint Type { get; protected set; }

        [JsonProperty("serial")]
        public uint? Serial { get; protected set; }

        public Computer(Descriptor descr) {
            Name = descr.product;
            Vendor = descr.vendor;
            Model = descr.model;
            Type = descr.type;
        }

        public Computer(Device dev) : this(dev.Descriptor) {
            Serial = dev.Serial;
            Model = dev.Model;
        }
    }

    /// <summary>
    /// Holds information about a single dive
    /// </summary>
    public class Dive {

        /// <summary>
        /// Base64 encoded fingerprint
        /// </summary>
        [JsonProperty("fingerprint")]
        public string Fingerprint { get; protected set; }

        [JsonProperty("date")]
        public DateTime Date { get; protected set; }

        [JsonProperty("divetime")]
        public TimeSpan? DiveTime { get; protected set; }

        [JsonProperty("max_depth")]
        public double? MaxDepth { get; protected set; }

        [JsonProperty("max_temperature")]
        public double? MaxTemperature { get; protected set; }

        [JsonProperty("min_temperature")]
        public double? MinTemperature { get; protected set; }

        [JsonProperty("surface_temperature")]
        public double? SurfaceTemperature { get; protected set; }

        [JsonProperty("atmospheric_pressure")]
        public double? AtmosphericPressure { get; protected set; }

        [JsonProperty("tank")]
        public Parser.dc_tank_t? Tank { get; protected set; }

        [JsonProperty("gasmix")]
        public Parser.dc_gasmix_t? Gasmix { get; protected set; }

        [JsonProperty("salinity")]
        public Parser.dc_salinity_t? Salinity { get; protected set; }

        [JsonProperty("samples")]
        public List<Sample> Samples { get; protected set; }

        protected Dive() {
            Samples = new List<Sample>();
        }

        /// <summary>
        /// Parses all dives from a device
        /// </summary>
        /// <param name="dev">Device to parse as</param>
        /// <param name="data">Dive data to parse</param>
        /// <param name="fingerprint">Fingerprint of given device</param>
        /// <returns>Filled instance of Dive</returns>
        public static Dive Parse(Device dev, byte[] data, byte[] fingerprint = null) {
            var parser = new Parser(dev);

            var dive = Parse(parser, data);
            if (dive != null)
                dive.Fingerprint = Convert.ToBase64String(fingerprint);

            parser.Dispose();

            return dive;
        }

        /// <summary>
        /// Parses dive data with given parser
        /// </summary>
        /// <param name="parser">Parser to use </param>
        /// <param name="data">Data to parse</param>
        /// <returns>Filled instance of Dive</returns>
        private static Dive Parse(Parser parser, byte[] data) {
            var dive = new Dive();
            parser.SetData(data);

            dive.Date = parser.GetDatetime();
            var t = parser.GetField<uint?>(Parser.dc_field_type_t.DC_FIELD_DIVETIME);
            if (t.HasValue) dive.DiveTime = new TimeSpan(0, (int)t.Value / 60, (int)t.Value % 60);

            dive.MaxDepth = parser.GetField<double?>(Parser.dc_field_type_t.DC_FIELD_MAXDEPTH);
            dive.Tank = parser.GetField<Parser.dc_tank_t?>(Parser.dc_field_type_t.DC_FIELD_TANK);
            dive.Gasmix = parser.GetField<Parser.dc_gasmix_t?>(Parser.dc_field_type_t.DC_FIELD_GASMIX);
            dive.Salinity = parser.GetField<Parser.dc_salinity_t?>(Parser.dc_field_type_t.DC_FIELD_SALINITY);
            dive.MaxTemperature = parser.GetField<double?>(Parser.dc_field_type_t.DC_FIELD_TEMPERATURE_MAXIMUM);
            dive.MinTemperature = parser.GetField<double?>(Parser.dc_field_type_t.DC_FIELD_TEMPERATURE_MINIMUM);
            dive.SurfaceTemperature = parser.GetField<double?>(Parser.dc_field_type_t.DC_FIELD_TEMPERATURE_SURFACE);
            dive.AtmosphericPressure = parser.GetField<double?>(Parser.dc_field_type_t.DC_FIELD_ATMOSPHERIC);

            Sample current = null;
            parser.OnSampleEvent += delegate (Parser.dc_sample_type_t type, Parser.dc_sample_value_t value, IntPtr userdata) {
                if (type == Parser.dc_sample_type_t.DC_SAMPLE_TIME) {
                    if (current != null) dive.Samples.Add(current);
                    current = new Sample();
                }
                current.ProcessSampleEvent(type, value);
            };

            parser.Start();
            if (current != null) dive.Samples.Add(current);

            return dive;
        }
    }

    public struct TankPressure {
        public uint Tank;
        public double Value;
    }

    public struct Event {
        public string Name;
        public Parser.parser_sample_event_t Type;
        public Parser.parser_sample_flags_t Flags;
        public uint Time;
        public uint Value;
    }

    /// <summary>
    /// Holds information about a sample within a dive
    /// </summary>
    public class Sample {
        public uint Time;
        public double? Depth;
        public uint? Bearing;
        public double? Temperature;
        public uint? Heartbeat;
        public uint? RBT;
        public double? PPO2;
        public double? CNS;

        public TankPressure? Pressure;
        public List<Event> Events;

        public Sample() {
            Events = new List<Event>();
        }

        public void ProcessSampleEvent(Parser.dc_sample_type_t t, Parser.dc_sample_value_t value) {
            switch (t) {
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

                case Parser.dc_sample_type_t.DC_SAMPLE_RBT:
                    RBT = value.rbt;
                    break;

                case Parser.dc_sample_type_t.DC_SAMPLE_PRESSURE:
                    Pressure = new TankPressure {
                        Tank = value.pressure_tank,
                        Value = value.pressure_value
                    };
                    break;

                case Parser.dc_sample_type_t.DC_SAMPLE_EVENT:
                    Events.Add(new Event {
                        Name = Parser.dc_sample_event_type_names[(int)value.event_type],
                        Type = value.event_type,
                        Flags = value.event_flags,
                        Time = value.event_time,
                        Value = value.event_value
                    });
                    break;

                case Parser.dc_sample_type_t.DC_SAMPLE_PPO2:
                    PPO2 = value.ppo2;
                    break;

                case Parser.dc_sample_type_t.DC_SAMPLE_CNS:
                    CNS = value.cns;
                    break;
            }
        }
    }
}