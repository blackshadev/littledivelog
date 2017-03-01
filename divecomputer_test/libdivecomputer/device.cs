using System;
using System.Collections;
using System.Runtime.InteropServices;

using libdivecomputer;

namespace libdivecomputer {

	public class Device {

		internal IntPtr m_device;

		public enum dc_event_type_t {
			DC_EVENT_WAITING = (1 << 0),
			DC_EVENT_PROGRESS = (1 << 1),
			DC_EVENT_DEVINFO = (1 << 2),
			DC_EVENT_CLOCK = (1 << 3)
		};

		[StructLayout(LayoutKind.Sequential)]
		public struct dc_event_progress_t {
			public uint current;
			public uint maximum;
		};

		[StructLayout(LayoutKind.Sequential)]
		public struct dc_event_devinfo_t {
			public uint model;
			public uint firmware;
			public uint serial;
		};

		[StructLayout(LayoutKind.Sequential)]
		public struct dc_event_clock_t {
			public uint devtime;
			public long systime;
		};

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
		public delegate int dc_cancel_callback_t (IntPtr userdata);

        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
		public delegate void dc_event_callback_t (IntPtr device, dc_event_type_t type, IntPtr data, IntPtr userdata);

		[UnmanagedFunctionPointer (CallingConvention.Cdecl)]
		public delegate int dc_dive_callback_t (
			[In][MarshalAs(UnmanagedType.LPArray, SizeParamIndex = 1)] byte[] data, uint size, 
			[In][MarshalAs(UnmanagedType.LPArray, SizeParamIndex = 3)] byte[] fingerprint, uint fsize,
			IntPtr userdata);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_device_open (ref IntPtr device, IntPtr context, IntPtr descriptor, string name);
/*
		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_family_t dc_device_get_type (IntPtr device);
*/
		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_device_set_cancel (IntPtr device, dc_cancel_callback_t callback, IntPtr userdata);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_device_set_events (IntPtr device, dc_event_type_t events, dc_event_callback_t callback, IntPtr userdata);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_device_set_fingerprint (IntPtr device, byte[] data, uint size);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_device_read (IntPtr device, uint address, [In, Out] byte[] data, uint size);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_device_write (IntPtr device, uint address, byte[] data, uint size);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_device_dump (IntPtr device, IntPtr buffer);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_device_foreach (IntPtr device, dc_dive_callback_t callback, IntPtr userdata);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_device_close (IntPtr device);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern IntPtr dc_buffer_new (UIntPtr capacity);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern void dc_buffer_free (IntPtr buffer);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern UIntPtr dc_buffer_get_size (IntPtr buffer);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern IntPtr dc_buffer_get_data (IntPtr buffer);

		public Device (Context context, Descriptor descriptor, string name)
		{
			dc_status_t rc = dc_device_open (ref m_device, context.m_context, descriptor.m_descriptor, name);
			if (rc != dc_status_t.DC_STATUS_SUCCESS) {
				// TODO: Throw exception.
				Console.WriteLine (rc.ToString());
			}
		}

		~Device()
		{
			dc_device_close (m_device);	
		}

		public dc_status_t SetEvents (dc_event_type_t events, dc_event_callback_t callback, IntPtr userdata)
		{
			return dc_device_set_events (m_device, events, callback, userdata);
		}

		public dc_status_t Read (uint address, byte[] data, uint size)
		{
			return dc_device_read (m_device, address, data, size);
		}

		public dc_status_t Write (uint address, byte[] data, uint size)
		{
			return dc_device_read (m_device, address, data, size);
		}

		public dc_status_t Foreach (dc_dive_callback_t callback, IntPtr userdata)
		{
			return dc_device_foreach (m_device, callback, userdata);
		}

		public dc_status_t Dump (ref byte[] result)
		{
			byte[] array = null;

			IntPtr buffer = dc_buffer_new (UIntPtr.Zero);

			dc_status_t rc = dc_device_dump (m_device, buffer);
			if (rc == dc_status_t.DC_STATUS_SUCCESS) {
				IntPtr data = dc_buffer_get_data (buffer);
				UIntPtr size = dc_buffer_get_size (buffer);
				array = new byte[(int)size];
		        Marshal.Copy (data, array, 0, (int) size);
            }

			dc_buffer_free (buffer);

			result = array;

			return rc;
		}

	};

};
