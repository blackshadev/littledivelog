namespace LibDiveComputer {

    public static class Constants {
        public const string LibPath = ".\\lib\\bin\\libdivecomputer-0.6.dll";
    }

    public enum dc_status_t {
        DC_STATUS_SUCCESS = 0,
        DC_STATUS_DONE = 1,
        DC_STATUS_UNSUPPORTED = -1,
        DC_STATUS_INVALIDARGS = -2,
        DC_STATUS_NOMEMORY = -3,
        DC_STATUS_NODEVICE = -4,
        DC_STATUS_NOACCESS = -5,
        DC_STATUS_IO = -6,
        DC_STATUS_TIMEOUT = -7,
        DC_STATUS_PROTOCOL = -8,
        DC_STATUS_DATAFORMAT = -9,
        DC_STATUS_CANCELLED = -10
    };
};