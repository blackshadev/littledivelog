using System;
using System.Collections;
using System.Runtime.InteropServices;

using LibDiveComputer;

namespace LibDiveComputer {

	public class Parser : IDisposable {

		internal IntPtr m_parser;

		[StructLayout(LayoutKind.Sequential)]
		public struct dc_datetime_t {
			public int year;
			public int month;
			public int day;
			public int hour;
			public int minute;
			public int second;
		};

        [StructLayout(LayoutKind.Sequential)]
        public struct dc_tank_t
        {
            public uint gasmix;  /* Gas mix index, or DC_GASMIX_UNKNOWN */
            public dc_tankvolume_t type; /* Tank type */
            public double volume;        /* Volume (liter) */
            public double workpressure;  /* Work pressure (bar) */
            public double beginpressure; /* Begin pressure (bar) */
            public double endpressure;   /* End pressure (bar) */
        }

        
        public enum dc_tankvolume_t
        {
            DC_TANKVOLUME_NONE,
            DC_TANKVOLUME_METRIC,
            DC_TANKVOLUME_IMPERIAL
        }

        public enum dc_sample_type_t {
			DC_SAMPLE_TIME,
			DC_SAMPLE_DEPTH,
			DC_SAMPLE_PRESSURE,
			DC_SAMPLE_TEMPERATURE,
			DC_SAMPLE_EVENT,
			DC_SAMPLE_RBT,
			DC_SAMPLE_HEARTBEAT,
			DC_SAMPLE_BEARING,
			DC_SAMPLE_VENDOR
		};
        
		public enum dc_field_type_t {
            DC_FIELD_DIVETIME,
            DC_FIELD_MAXDEPTH,
            DC_FIELD_AVGDEPTH,
            DC_FIELD_GASMIX_COUNT,
            DC_FIELD_GASMIX,
            DC_FIELD_SALINITY,
            DC_FIELD_ATMOSPHERIC,
            DC_FIELD_TEMPERATURE_SURFACE,
            DC_FIELD_TEMPERATURE_MINIMUM,
            DC_FIELD_TEMPERATURE_MAXIMUM,
            DC_FIELD_TANK_COUNT,
            DC_FIELD_TANK,
            DC_FIELD_DIVEMODE
        };

		public enum parser_sample_event_t {
			SAMPLE_EVENT_NONE,
			SAMPLE_EVENT_DECOSTOP,
			SAMPLE_EVENT_RBT,
			SAMPLE_EVENT_ASCENT,
			SAMPLE_EVENT_CEILING,
			SAMPLE_EVENT_WORKLOAD,
			SAMPLE_EVENT_TRANSMITTER,
			SAMPLE_EVENT_VIOLATION,
			SAMPLE_EVENT_BOOKMARK,
			SAMPLE_EVENT_SURFACE,
			SAMPLE_EVENT_SAFETYSTOP,
			SAMPLE_EVENT_GASCHANGE,
			SAMPLE_EVENT_SAFETYSTOP_VOLUNTARY,
			SAMPLE_EVENT_SAFETYSTOP_MANDATORY,
			SAMPLE_EVENT_DEEPSTOP,
			SAMPLE_EVENT_CEILING_SAFETYSTOP,
			SAMPLE_EVENT_UNKNOWN,
			SAMPLE_EVENT_DIVETIME,
			SAMPLE_EVENT_MAXDEPTH,
			SAMPLE_EVENT_OLF,
			SAMPLE_EVENT_PO2,
			SAMPLE_EVENT_AIRTIME,
			SAMPLE_EVENT_RGBM,
			SAMPLE_EVENT_HEADING,
			SAMPLE_EVENT_TISSUELEVEL
		};

		public enum parser_sample_flags_t {
			SAMPLE_FLAGS_NONE = 0,
			SAMPLE_FLAGS_BEGIN = (1 << 0),
			SAMPLE_FLAGS_END = (1 << 1)
		};

		public enum parser_sample_vendor_t {
			SAMPLE_VENDOR_NONE,
			SAMPLE_VENDOR_UWATEC_ALADIN,
			SAMPLE_VENDOR_UWATEC_SMART,
			SAMPLE_VENDOR_OCEANIC_VTPRO,
			SAMPLE_VENDOR_OCEANIC_VEO250,
			SAMPLE_VENDOR_OCEANIC_ATOM2
		};

		public enum dc_water_t {
			DC_WATER_FRESH,
			DC_WATER_SALT
		};

		[StructLayout(LayoutKind.Sequential)]
		public struct dc_salinity_t {
			dc_water_t type;
			double density;
		};

		[StructLayout(LayoutKind.Sequential)]
		public struct dc_gasmix_t {
			public double helium;
            public double oxygen;
            public double nitrogen;
		};

		[StructLayout(LayoutKind.Sequential)]
		public struct dc_pressure_t {
			public uint tank;
			public double value;
		};

		[StructLayout(LayoutKind.Sequential)]
		public struct dc_event_t {
			public uint type;
			public uint time;
			public uint flags;
			public uint value;
		};

		[StructLayout(LayoutKind.Sequential)]
		public struct dc_vendor_t {
			public uint type;
			public uint size;
			public IntPtr data;
		};

		[StructLayout(LayoutKind.Explicit, Size=16)]
		//[StructLayout(LayoutKind.Explicit)]
		public struct dc_sample_value_t {
			[FieldOffset(0)]
			public uint time;
			[FieldOffset(0)]
			public double depth;
/*			[FieldOffset(0)]
			public dc_pressure_t pressure;*/
			[FieldOffset(0)]
			public uint pressure_tank;
			[FieldOffset(8)]
			public double pressure_value;
			[FieldOffset(0)]
			public double temperature;
/*			[FieldOffset(0)]
			public dc_event_t xevent;*/
			[FieldOffset(0)]
			public uint event_type;
			[FieldOffset(4)]
			public uint event_time;
			[FieldOffset(8)]
			public uint event_flags;
			[FieldOffset(12)]
			public uint event_value;
			[FieldOffset(0)]
			public uint rbt;
			[FieldOffset(0)]
			public uint heartbeat;
			[FieldOffset(0)]
			public uint bearing;
			/*[FieldOffset(0)]
			public dc_vendor_t vendor;*/
			[FieldOffset(0)]
			public uint vendor_type;
			[FieldOffset(4)]
			public uint vendor_size;
			[FieldOffset(8)]
			public IntPtr vendor_data;
		};

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
		public delegate void dc_sample_callback_t (dc_sample_type_t type, dc_sample_value_t value, IntPtr userdata);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_new (ref IntPtr parser, IntPtr device);

        [DllImport(Constants.LibPath, CallingConvention = CallingConvention.Cdecl)]
        static extern dc_status_t dc_parser_new2(ref IntPtr parser, IntPtr context, IntPtr descriptor, uint devtime, long systime);
        
        [DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_set_data (IntPtr parser, byte[] data, uint size);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_get_datetime (IntPtr parser, ref dc_datetime_t datetime);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_get_field (IntPtr parser, dc_field_type_t type, uint flags, IntPtr value);

        [DllImport(Constants.LibPath, EntryPoint = "dc_parser_get_field", CallingConvention = CallingConvention.Cdecl)]
        static extern dc_status_t dc_parser_get_field_object(IntPtr parser, dc_field_type_t type, uint flags, ref object value);

        [DllImport(Constants.LibPath, EntryPoint = "dc_parser_get_field", CallingConvention = CallingConvention.Cdecl)]
        static extern dc_status_t dc_parser_get_field_tank(IntPtr parser, dc_field_type_t type, uint flags, ref dc_tank_t value);

        [DllImport(Constants.LibPath, EntryPoint = "dc_parser_get_field", CallingConvention = CallingConvention.Cdecl)]
        static extern dc_status_t dc_parser_get_field_gasmix(IntPtr parser, dc_field_type_t type, uint flags, ref dc_gasmix_t value);


        [DllImport(Constants.LibPath, EntryPoint="dc_parser_get_field", CallingConvention = CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_get_field_double (IntPtr parser, dc_field_type_t type, uint flags, ref double value);

        [DllImport(Constants.LibPath, EntryPoint = "dc_parser_get_field", CallingConvention = CallingConvention.Cdecl)]
        static extern dc_status_t dc_parser_get_field_uint(IntPtr parser, dc_field_type_t type, uint flags, ref uint value);


        [DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_samples_foreach (IntPtr parser, dc_sample_callback_t callback, IntPtr userdata);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_destroy(IntPtr parser);

        
        /// <summary>
        /// Delegate instances set as property to prevent the garbage collector from collecting it
        /// </summary>
        private dc_sample_callback_t SampleCallback;

        protected Parser()
        {
            SampleCallback = new dc_sample_callback_t(HandleSampleData);
        }

        public Parser (Device device) : this()
		{
			dc_status_t rc = dc_parser_new (ref m_parser, device.m_device);
			if (rc != dc_status_t.DC_STATUS_SUCCESS) {
				// TODO: Throw exception.
				throw new Exception(rc.ToString());
			}
		}

        public Parser(Context ctx, Descriptor descr, uint devtime, long systime) : this()
        {
            dc_status_t rc = dc_parser_new2(ref m_parser, ctx.m_context, descr.m_descriptor, devtime, systime);
            if (rc != dc_status_t.DC_STATUS_SUCCESS) {
                // TODO: Throw exception.
                throw new Exception(rc.ToString());
            }
        }

        protected void HandleSampleData(Parser.dc_sample_type_t type, Parser.dc_sample_value_t value, IntPtr userdata)
        {
            
        }

        /// <summary>
        /// Sets dive data in the parser
        /// </summary>
        /// <param name="data">Dive data</param>
		public void SetData (byte[] data)
		{
			var st = dc_parser_set_data (m_parser, data, (uint) data.Length);
            if (st != dc_status_t.DC_STATUS_SUCCESS)
                throw new Exception("Failed to set data: " + st);
		}

        /// <summary>
        /// Starts reading samples
        /// </summary>
        public void Start()
        {
            var rc = Foreach(SampleCallback, IntPtr.Zero);
            if (rc != dc_status_t.DC_STATUS_SUCCESS)
                throw new Exception("Failed to read samples: " + rc);
        }

		public DateTime GetDatetime ()
		{
            var dt = new dc_datetime_t();
            var st = dc_parser_get_datetime (m_parser, ref dt);
            if (st != dc_status_t.DC_STATUS_SUCCESS)
                throw new Exception("Failed to get datetime: " + st);
            return new DateTime(dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second);
        }

		public T GetField<T>(dc_field_type_t type, uint flags = 0)
		{
            object value = null;
            dc_status_t rc = dc_status_t.DC_STATUS_UNSUPPORTED;
            switch(type) {
                case dc_field_type_t.DC_FIELD_TEMPERATURE_MINIMUM:
                case dc_field_type_t.DC_FIELD_MAXDEPTH:
                    double _double_value = 0;
                    rc = dc_parser_get_field_double(m_parser, type, flags, ref _double_value);
                    value = _double_value;
                    break;
                case dc_field_type_t.DC_FIELD_GASMIX_COUNT:
                case dc_field_type_t.DC_FIELD_TANK_COUNT:
                case dc_field_type_t.DC_FIELD_DIVETIME:
                    uint _uint_value = 0;
                    rc = dc_parser_get_field_uint(m_parser, type, flags, ref _uint_value);
                    value = _uint_value;
                    break;
                case dc_field_type_t.DC_FIELD_TANK:
                    var _tank_value = new dc_tank_t { };
                    rc = dc_parser_get_field_tank(m_parser, type, flags, ref _tank_value);
                    value = _tank_value;
                    break;
                case dc_field_type_t.DC_FIELD_GASMIX:
                    var _mix_value = new dc_gasmix_t { };
                    rc = dc_parser_get_field_gasmix(m_parser, type, flags, ref _mix_value);
                    value = _mix_value;
                    break;
            }

            if (rc != dc_status_t.DC_STATUS_SUCCESS && rc != dc_status_t.DC_STATUS_UNSUPPORTED)
                throw new Exception($"Error while getting field {type}, got {rc}");
            if (rc == dc_status_t.DC_STATUS_UNSUPPORTED)
                return default(T);

            var t = typeof(T);
            var u = Nullable.GetUnderlyingType(t);

            if (u != null)
            {
                return (T)Convert.ChangeType(value, u);
            }
            else
            {
                return (T)Convert.ChangeType(value, t);
            }

            
		}

		private dc_status_t Foreach (dc_sample_callback_t callback, IntPtr userdata)
		{
			return dc_parser_samples_foreach (m_parser, callback, userdata);
		}

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                dc_parser_destroy(m_parser);
                this.m_parser = IntPtr.Zero;
                if (disposing)
                {
                    // managed objects
                }

                disposedValue = true;
            }
        }

        
        ~Parser()
        {
            Dispose(false);
        }
        
        public void Dispose()
        {
        
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        #endregion

    };

};
