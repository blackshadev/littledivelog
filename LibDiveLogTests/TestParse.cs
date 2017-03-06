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
            var parser = new Parser(ctx, aladinDescriptor, 1084257261, 1488814786);

            byte[] data = File.ReadAllBytes("./dumps/aladin_prime_dive.bin");
            parser.SetData(data);
            
            object maxdepth = (double)0.0d;
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_MAXDEPTH, 0, ref maxdepth);

            object divetime = (UInt32)0;
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_DIVETIME, 0, ref divetime);

            var dt = parser.GetDatetime();

            Console.WriteLine(String.Format("datetime: {0}", dt.ToString()));
            Console.WriteLine(String.Format("maxdepth: {0}", maxdepth));
            Console.WriteLine(String.Format("divetime: {0}", divetime));


        }
    }
}
