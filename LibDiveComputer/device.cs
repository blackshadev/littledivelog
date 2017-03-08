using System;
using System.Collections;
using System.Runtime.InteropServices;

using LibDiveComputer;
using System.IO;

namespace LibDiveComputer {

	public class Device : IDisposable {

        public long systime {  get; protected set; }
        public uint devtime { get; protected set; }

        internal IntPtr m_device;

        [Flags]
		public enum dc_event_type_t {
			DC_EVENT_WAITING = (1 << 0),
			DC_EVENT_PROGRESS = (1 << 1),
			DC_EVENT_DEVINFO = (1 << 2),
			DC_EVENT_CLOCK = (1 << 3),
            ALL = DC_EVENT_WAITING|DC_EVENT_CLOCK|DC_EVENT_DEVINFO|DC_EVENT_PROGRESS
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

        public delegate void DeviceInfoEventHandler(dc_event_devinfo_t info);
        public event DeviceInfoEventHandler OnDeviceInfo;

        public delegate void ProgressEventHandler(dc_event_progress_t info);
        public event ProgressEventHandler OnProgess;

        public delegate void ClockEventHandler(dc_event_clock_t info);
        public event ClockEventHandler OnClock;

        public delegate void WaitingEventHandler();
        public event WaitingEventHandler OnWaiting;


        private dc_event_callback_t _eventCallback;
        private dc_dive_callback_t _diveCallback;


        protected Descriptor descriptor;
        protected Context context;
        protected string name;



        public Device (Context context, Descriptor descriptor, string name)
		{
            this.context = context;
            this.descriptor = descriptor;
            this.name = name;

			dc_status_t rc = dc_device_open (ref m_device, context.m_context, descriptor.m_descriptor, name);
			if (rc != dc_status_t.DC_STATUS_SUCCESS) {
				// TODO: Throw exception.
				throw new Exception(rc.ToString());
			}

            _eventCallback = new dc_event_callback_t(HandleEvent);
            _diveCallback = new dc_dive_callback_t(HandleDive);
            
        }

        public void Start()
        {
            this.SetEvents(dc_event_type_t.ALL, _eventCallback, IntPtr.Zero);
            dc_device_foreach(m_device, _diveCallback, IntPtr.Zero);
        }
        

        
        private void HandleEvent(IntPtr device, dc_event_type_t type, IntPtr data, IntPtr userdata)
        {
            switch(type)
            {
                case dc_event_type_t.DC_EVENT_WAITING:
                    if (OnWaiting == null) return;
                    OnWaiting();
                    break;
                case dc_event_type_t.DC_EVENT_DEVINFO:
                    if (OnDeviceInfo == null) return;
                    var devinfo = (Device.dc_event_devinfo_t)Marshal.PtrToStructure(data, typeof(Device.dc_event_devinfo_t));
                    OnDeviceInfo(devinfo);
                    break;
                case dc_event_type_t.DC_EVENT_PROGRESS:
                    if (OnProgess == null) return;
                    var progress = (Device.dc_event_progress_t)Marshal.PtrToStructure(data, typeof(Device.dc_event_progress_t));
                    OnProgess(progress);
                    break;
                case dc_event_type_t.DC_EVENT_CLOCK:
                    var clock = (Device.dc_event_clock_t)Marshal.PtrToStructure(data, typeof(Device.dc_event_clock_t));
                    systime = clock.systime;
                    devtime = clock.devtime;

                    if (OnClock== null) return;
                    OnClock(clock);
                    break;
                default:
                    throw new Exception("Unknown event: " + type);


            }
        }

        public int iX = 0;
        private int HandleDive(
            byte[] data, uint size,
            byte[] fingerprint, uint fsize,
            IntPtr userdata
        )
        {

            //var wrtr = new BinaryWriter(File.Open("current_" + (iX++)  + ".bin", FileMode.Create));
            //wrtr.Write(this.systime);
            //wrtr.Write(this.devtime);
            //wrtr.Write(data);
            //wrtr.Dispose();

            var parser = new Parser(this);
            parser.SetData(data);
            
            var datetime = parser.GetDatetime();
            Console.WriteLine("datetime={0}", datetime);

            object maxdepth = new double();
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_MAXDEPTH, 0, ref maxdepth);
            Console.WriteLine("maxdepth={0}", maxdepth);

            object divetime = new uint();
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_DIVETIME, 0, ref divetime);
            var _divetime = (uint)divetime;
            Console.WriteLine("divetime={0}:{1}", (uint)_divetime / 60, (uint)_divetime % 60);
            
            object tank = new Parser.dc_tank_t {  };
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_TANK, 0, ref tank);
            var _tank = (Parser.dc_tank_t)tank;
            Console.WriteLine($"Tank={_tank.beginpressure} bar; {_tank.endpressure}");

            object mintemp = new double();
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_TEMPERATURE_MINIMUM, 0, ref tank);
            Console.WriteLine($"mintemp={mintemp}");


            Console.WriteLine("");
            return 1;
        }

		private dc_status_t SetEvents (dc_event_type_t events, dc_event_callback_t callback, IntPtr userdata)
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

		private dc_status_t Foreach (dc_dive_callback_t callback, IntPtr userdata)
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

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {

                dc_device_close(m_device);
                context = null;
                name = null;
                _eventCallback = null;
                _diveCallback = null;

                if (disposing)
                {
                    // Dispose managed objects
                }

                disposedValue = true;
            }
        }

        
        ~Device()
        {
            Dispose(false);
        }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            Dispose(true);
            
            GC.SuppressFinalize(this);
        }
        #endregion

    };

};
