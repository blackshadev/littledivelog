using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

namespace libdivecomputer {

	public class Descriptor {

		internal IntPtr m_descriptor;

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern uint dc_descriptor_get_type (IntPtr descriptor);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern uint dc_descriptor_get_model (IntPtr descriptor);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern IntPtr dc_descriptor_get_vendor (IntPtr descriptor);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern IntPtr dc_descriptor_get_product (IntPtr descriptor);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern void dc_descriptor_free (IntPtr descriptor);

		[DllImport(Constants.LibPath, CallingConvention=CallingConvention.Cdecl)]
		static extern dc_status_t dc_descriptor_iterator (ref IntPtr iterator);


        [DllImport(Constants.LibPath, CallingConvention = CallingConvention.Cdecl)]
        static extern dc_status_t dc_iterator_next(IntPtr iterator, ref IntPtr item);

        [DllImport(Constants.LibPath, CallingConvention = CallingConvention.Cdecl)]
        static extern dc_status_t dc_iterator_free(IntPtr iterator);


        private Descriptor (IntPtr descriptor)
		{
			m_descriptor = descriptor;
		}

		~Descriptor()
		{
			dc_descriptor_free (m_descriptor);
		}

		public uint type
		{
			get
			{
				return dc_descriptor_get_type (m_descriptor);
			}
		}

		public uint model
		{
			get
			{
				return dc_descriptor_get_model (m_descriptor);
			}
		}

		public string vendor
		{
			get
			{
				IntPtr ptr = dc_descriptor_get_vendor (m_descriptor);
				return Marshal.PtrToStringAnsi(ptr);
			}
		}

		public string product
		{
			get
			{
				IntPtr ptr = dc_descriptor_get_product (m_descriptor);
				return Marshal.PtrToStringAnsi(ptr);
			}
		}

		public static IEnumerable<Descriptor> Descriptors()
		{
			dc_status_t status = dc_status_t.DC_STATUS_SUCCESS;
			IntPtr iterator = IntPtr.Zero;
			IntPtr descriptor = IntPtr.Zero;

			dc_descriptor_iterator (ref iterator);
			while ((status = dc_iterator_next (iterator, ref descriptor)) == dc_status_t.DC_STATUS_SUCCESS) {
				yield return new Descriptor(descriptor);
			}

			if (status != dc_status_t.DC_STATUS_SUCCESS && status != dc_status_t.DC_STATUS_DONE) {
				// TODO: Throw exception.
				Console.WriteLine (status.ToString());
			}
		}
        
    };

};
