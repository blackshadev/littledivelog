using System;
using System.Collections;
using System.Runtime.InteropServices;

using libdivecomputer;

namespace libdivecomputer {

	public class Parser {

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
			DC_FIELD_ATMOSPHERIC
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
			double helium;
			double oxygen;
			double nitrogen;
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
/*
		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_family_t dc_parser_get_type (IntPtr parser);
*/
		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_set_data (IntPtr parser, byte[] data, uint size);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_get_datetime (IntPtr parser, ref dc_datetime_t datetime);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_get_field (IntPtr parser, dc_field_type_t type, uint flags, IntPtr value);

		[DllImport(Constants.LibPath, EntryPoint="dc_parser_get_field")]
		static extern dc_status_t dc_parser_get_field2 (IntPtr parser, dc_field_type_t type, uint flags, [Out, MarshalAs(UnmanagedType.AsAny)] object value);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_samples_foreach (IntPtr parser, dc_sample_callback_t callback, IntPtr userdata);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_parser_free (IntPtr parser);

		public Parser (Device device)
		{
			dc_status_t rc = dc_parser_new (ref m_parser, device.m_device);
			if (rc != dc_status_t.DC_STATUS_SUCCESS) {
				// TODO: Throw exception.
				Console.WriteLine (rc.ToString());
			}
		}

		~Parser()
		{
			dc_parser_free (m_parser);
		}

		public dc_status_t SetData (byte[] data)
		{
			return dc_parser_set_data (m_parser, data, (uint) data.Length);
		}

		public dc_status_t GetDatetime (ref dc_datetime_t datetime)
		{
			return dc_parser_get_datetime (m_parser, ref datetime);
		}

		public dc_status_t GetField (dc_field_type_t type, uint flags, [In,Out] object value)
		{
			object o = value;
			dc_status_t rc = dc_parser_get_field2 (m_parser, type, flags, value);
			Console.WriteLine(o.GetType());
			Console.WriteLine(Convert.ToDouble(o));
			Console.WriteLine(value);
			return rc;
			//return dc_parser_get_field2 (m_parser, type, flags, value);
		}

		public dc_status_t Foreach (dc_sample_callback_t callback, IntPtr userdata)
		{
			return dc_parser_samples_foreach (m_parser, callback, userdata);
		}

	};

};
