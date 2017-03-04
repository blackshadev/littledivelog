using System;
using System.Collections;
using System.Runtime.InteropServices;

using LibDiveComputer;

class Test {

	public static void logfunc (IntPtr context, Context.dc_loglevel_t loglevel, string file, uint line, string function, string message, IntPtr userdata)
	{
		if (loglevel == Context.dc_loglevel_t.DC_LOGLEVEL_ERROR || loglevel == Context.dc_loglevel_t.DC_LOGLEVEL_WARNING) {
			Console.WriteLine("{0}: {1} [in {2}:{3} ({4})]", loglevel.ToString(), message, file, line, function);
		} else {
			Console.WriteLine("{0}: {1}", loglevel.ToString(), message);
		}
	}

	public static void event_cb (IntPtr device, Device.dc_event_type_t type, IntPtr data, IntPtr userdata)
	{
		Device.dc_event_progress_t progress;
		Device.dc_event_devinfo_t devinfo;
		Device.dc_event_clock_t clock;

		switch (type) {
		case Device.dc_event_type_t.DC_EVENT_WAITING:
			Console.WriteLine ("Waiting");
			break;
		case Device.dc_event_type_t.DC_EVENT_PROGRESS:
            progress = (Device.dc_event_progress_t) Marshal.PtrToStructure(data, typeof(Device.dc_event_progress_t));
			Console.WriteLine ("Progress: {0} ({1}/{2})",
			                   100.0 * (double) progress.current / (double) progress.maximum,
			                   progress.current, progress.maximum);
			break;
		case Device.dc_event_type_t.DC_EVENT_DEVINFO:
			devinfo = (Device.dc_event_devinfo_t) Marshal.PtrToStructure (data, typeof (Device.dc_event_devinfo_t));
			Console.WriteLine ("Devinfo: {0} {1} {2}",
			                   devinfo.model, devinfo.firmware, devinfo.serial);
			break;
		case Device.dc_event_type_t.DC_EVENT_CLOCK:
			clock = (Device.dc_event_clock_t) Marshal.PtrToStructure (data, typeof (Device.dc_event_clock_t));
			Console.WriteLine ("Clock: {0} {1}",
			                   clock.devtime, clock.systime);
			break;
		}
	}

	public static void sample_cb (Parser.dc_sample_type_t type, Parser.dc_sample_value_t value, IntPtr userdata)
	{
		/*static const char *events[] = {
			"none", "deco", "rbt", "ascent", "ceiling", "workload", "transmitter",
			"violation", "bookmark", "surface", "safety stop", "gaschange",
			"safety stop (voluntary)", "safety stop (mandatory)", "deepstop",
			"ceiling (safety stop)", "unknown", "divetime", "maxdepth",
			"OLF", "PO2", "airtime", "rgbm", "heading", "tissue level warning"};

		sample_data_t *sampledata = (sample_data_t *) userdata;*/

		switch (type) {
		case Parser.dc_sample_type_t.DC_SAMPLE_TIME:
			/*if (sampledata->nsamples++)
				fprintf (sampledata->fp, "</sample>\n");
			fprintf (sampledata->fp, "<sample>\n");*/
			//Console.WriteLine ("   <time>{0}</time>", value.time);
			Console.WriteLine ("   <time>{0}:{1}</time>", value.time / 60, value.time % 60);
			break;
		case Parser.dc_sample_type_t.DC_SAMPLE_DEPTH:
			Console.WriteLine ("   <depth>{0}</depth>", value.depth);
			break;
		case Parser.dc_sample_type_t.DC_SAMPLE_PRESSURE:
			Console.WriteLine ("   <pressure tank=\"{0}\">{1}</pressure>", value.pressure_tank, value.pressure_value);
			break;
		case Parser.dc_sample_type_t.DC_SAMPLE_TEMPERATURE:
			Console.WriteLine ("   <temperature>{0}</temperature>", value.temperature);
			break;
		/*case Parser.dc_sample_type_t.DDC_SAMPLE_EVENT:
			fprintf (sampledata->fp, "   <event type=\"%u\" time=\"%u\" flags=\"%u\" value=\"%u\">%s</event>\n",
				value.event.type, value.event.time, value.event.flags, value.event.value, events[value.event.type]);
			break;
		case Parser.dc_sample_type_t.DC_SAMPLE_RBT:
			fprintf (sampledata->fp, "   <rbt>%u</rbt>\n", value.rbt);
			break;
		case Parser.dc_sample_type_t.DC_SAMPLE_HEARTBEAT:
			fprintf (sampledata->fp, "   <heartbeat>%u</heartbeat>\n", value.heartbeat);
			break;
		case Parser.dc_sample_type_t.DC_SAMPLE_BEARING:
			fprintf (sampledata->fp, "   <bearing>%u</bearing>\n", value.bearing);
			break;
		case Parser.dc_sample_type_t.DC_SAMPLE_VENDOR:
			fprintf (sampledata->fp, "   <vendor type=\"%u\" size=\"%u\">", value.vendor.type, value.vendor.size);
			for (unsigned int i = 0; i < value.vendor.size; ++i)
				fprintf (sampledata->fp, "%02X", ((unsigned char *) value.vendor.data)[i]);
			fprintf (sampledata->fp, "</vendor>\n");
			break;
		default:
			break;*/
		}
	}

	public static int dive_cb (byte[] data, uint size, 
		byte[] fingerprint, uint fsize,
		IntPtr userdata)
	{
		Console.WriteLine("size={0} {1}", data.Length, fingerprint.Length);

		GCHandle gch = GCHandle.FromIntPtr(userdata);
		Device device = (Device)gch.Target;	

		Parser parser = new Parser (device);

		parser.SetData (data);

		Parser.dc_datetime_t dt = new Parser.dc_datetime_t ();
		parser.GetDatetime (ref dt);
		DateTime datetime = new DateTime (dt.year, dt.month, dt.day, dt.hour, dt.minute, dt.second);
		Console.WriteLine("datetime={0}", datetime);

		object maxdepth = new double();
		parser.GetField (Parser.dc_field_type_t.DC_FIELD_MAXDEPTH, 0, (object)maxdepth);
		Console.WriteLine("maxdepth={0}", maxdepth);
		Console.WriteLine(maxdepth);

		//parser.Foreach (sample_cb, IntPtr.Zero);

		return 1;
	}

	public static void Main_2 (string[] args)
	{
		Console.WriteLine("main");

		Context context = null;
		Descriptor descriptor = null;
		Device device = null;

		context = new Context ();
		//context.loglevel = Context.dc_loglevel_t.DC_LOGLEVEL_ALL;
		context.logfunc = logfunc;

		foreach (Descriptor x in Descriptor.Descriptors())
        {
            Console.WriteLine (x.vendor + " " + x.product);

            if (x.product == "D9")
            	descriptor = x;
        }

		device = new Device (context, descriptor, "/tmp/ttyS0");

		//Device.dc_event_callback_t my_event_cb = new Device.dc_event_callback_t (event_cb);
		//device.SetEvents (Device.dc_event_type_t.DC_EVENT_PROGRESS, event_cb, IntPtr.Zero);

/*		byte[] buffer = null;
		device.Dump (ref buffer);
*/

		GCHandle gch = GCHandle.Alloc(device);
		device.Foreach (dive_cb, GCHandle.ToIntPtr(gch));
		gch.Free();

		Console.WriteLine (descriptor.vendor + " " + descriptor.product);
		Console.WriteLine (device);
		Console.WriteLine (Marshal.SizeOf(typeof(Parser.dc_sample_value_t)));
		Console.WriteLine (Marshal.SizeOf(typeof(Parser.dc_vendor_t)));
		Console.WriteLine (Marshal.SizeOf(typeof(Parser.dc_event_t)));
		Console.WriteLine (Marshal.SizeOf(typeof(Parser.dc_pressure_t)));
	}
}

