using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.IO;
using LibDiveComputer;

namespace LibDiveLogTests
{
    [TestClass]
    public class TestParse
    {
        [TestMethod]
        public void DiveAladinPrime()
        {
            string target = "Aladin Prime";
            Descriptor aladinDescriptor = null;

            foreach(Descriptor descr in Descriptor.Descriptors()) {
                if (descr.product == target) aladinDescriptor = descr;
            }

            if (aladinDescriptor == null) Assert.Fail("Aladin Prime descriptor not found");

            var ctx = new Context();

            var rdr = new BinaryReader(File.Open("./dumps/aladin_prime/current_18.bin", FileMode.Open));
            var systime = rdr.ReadInt64();
            var devtime = rdr.ReadUInt32();
            var data = rdr.ReadBytes((int)rdr.BaseStream.Length - 12);


            var parser = new Parser(ctx, aladinDescriptor, devtime, systime);
            parser.SetData(data);
            
            object maxdepth = (double)0.0d;
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_MAXDEPTH, 0, ref maxdepth);

            object divetime = (uint)0;
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_DIVETIME, 0, ref divetime);

            var dt = parser.GetDatetime();

            var _divetime = (uint)divetime;
            Console.WriteLine(String.Format("datetime: {0}", dt.ToString()));
            Console.WriteLine(String.Format("maxdepth: {0}", maxdepth));
            Console.WriteLine(String.Format("divetime: {0}:{1}", _divetime / 60, _divetime % 60));


        }
    }
}
