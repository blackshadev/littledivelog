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
            var dev = new Device(ctx, aladinDescriptor, null);
            var parser = new Parser(dev);

            byte[] data = File.ReadAllBytes("./dumps/aladin_prime_dive.bin");
            parser.SetData(data);

            var dt = parser.GetDatetime();
            Console.WriteLine(dt.ToString());

            object maxdepth = new double();
            parser.GetField(Parser.dc_field_type_t.DC_FIELD_MAXDEPTH, 0, (object)maxdepth);
            Console.WriteLine(maxdepth);

        }
    }
}
