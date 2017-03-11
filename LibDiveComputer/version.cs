using System;
using System.Runtime.InteropServices;

namespace LibDiveComputer {

    public static class Version {

        [StructLayout(LayoutKind.Sequential)]
        private struct dc_version_t {
            public uint major;
            public uint minor;
            public uint micro;
        }

        [DllImport(Constants.LibPath, CallingConvention = CallingConvention.Cdecl)]
        private static extern IntPtr dc_version(ref dc_version_t ver);

        public readonly static string AsString;
        public readonly static uint Major;
        public readonly static uint Minor;
        public readonly static uint Micro;

        static Version() {
            var structVersion = new dc_version_t { };
            var ptr = dc_version(ref structVersion);
            AsString = Marshal.PtrToStringAnsi(ptr);

            Major = structVersion.major;
            Minor = structVersion.minor;
            Micro = structVersion.micro;
        }
    }
}