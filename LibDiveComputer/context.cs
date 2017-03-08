using System;
using System.Collections;
using System.Runtime.InteropServices;

using LibDiveComputer;

namespace LibDiveComputer {

	public class Context : IDisposable {

		internal IntPtr m_context;

		public enum dc_loglevel_t
		{
			DC_LOGLEVEL_NONE,
			DC_LOGLEVEL_ERROR,
			DC_LOGLEVEL_WARNING,
			DC_LOGLEVEL_INFO,
			DC_LOGLEVEL_DEBUG,
			DC_LOGLEVEL_ALL
		};

		
        [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
		public delegate void dc_logfunc_t (IntPtr context, dc_loglevel_t loglevel, string file, uint line, string function, string message, IntPtr userdata);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_context_new (ref IntPtr context);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_context_free (IntPtr context);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_context_set_loglevel (IntPtr context, dc_loglevel_t loglevel);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_context_set_logfunc (IntPtr context, dc_logfunc_t logfunc, IntPtr userdata);

		public Context ()
		{
			dc_status_t rc = dc_context_new (ref m_context);
			if (rc != dc_status_t.DC_STATUS_SUCCESS) {
				throw new Exception(rc.ToString());
			}
		}
        
		public dc_loglevel_t loglevel
		{
			set
			{
				dc_context_set_loglevel (m_context, value);
			}
		}

        private dc_logfunc_t _logfunc;
        public dc_logfunc_t logfunc
		{
			set
			{
                _logfunc = value;
                dc_context_set_logfunc (m_context, value, IntPtr.Zero);
			}
		}

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                dc_context_free(m_context);
                _logfunc = null;
                if (disposing)
                {
                    // Dispose managed state (managed objects).
                }
                

                disposedValue = true;
            }
        }

        
        ~Context()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(false);
        }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
            // TODO: uncomment the following line if the finalizer is overridden above.
            // GC.SuppressFinalize(this);
        }
        #endregion

    };

};
