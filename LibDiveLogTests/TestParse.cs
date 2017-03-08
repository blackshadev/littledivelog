using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.IO;
using LibDiveComputer;

namespace LibDiveLogTests
{
    [TestClass]
    public class TestParse
    {
        protected byte[] Data;
        [TestMethod]
        public void DiveAladinPrime()
        {
            string target = "Aladin Prime";
            Descriptor aladinDescriptor = null;

            foreach(Descriptor descr in Descriptor.Descriptors()) {
                if (descr.product == target) aladinDescriptor = descr;
            }

            // model 18, type = 196610
            if (aladinDescriptor == null) Assert.Fail("Aladin Prime descriptor not found");

            var ctx = new Context();
            
            var rdr = new BinaryReader(File.Open("./dumps/aladin_prime/current_0.bin", FileMode.Open));
            var systime = rdr.ReadInt64();
            var devtime = rdr.ReadUInt32();
            Data = rdr.ReadBytes((int)rdr.BaseStream.Length - 12);
            rdr.Dispose();

            var parser = new Parser(ctx, aladinDescriptor, devtime, systime );
            parser.SetData(Data);
            
            object maxdepth = (double)0.0d;
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_MAXDEPTH, 0, ref maxdepth);

            object divetime = (uint)0;
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_DIVETIME, 0, ref divetime);

            var dt = parser.GetDatetime();

            var _divetime = (uint)divetime;
            Console.WriteLine(String.Format("datetime: {0}", dt.ToString()));
            Console.WriteLine(String.Format("maxdepth: {0}", maxdepth));
            Console.WriteLine(String.Format("divetime: {0}:{1}", _divetime / 60, _divetime % 60));
            Console.WriteLine(Data[5]);

        }
    }
}
