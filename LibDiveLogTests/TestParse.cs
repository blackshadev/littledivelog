using LibDiveComputer;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.IO;

namespace LibDiveLogTests {

    [TestClass]
    public class TestParse {
        protected Descriptor aladinDescriptor;

        [TestInitialize]
        public void Init() {
            foreach (Descriptor descr in Descriptor.Descriptors()) {
                if (descr.vendor == "Uwatec" && descr.model == 0x13) aladinDescriptor = descr;
            }
        }

        protected byte[] Data;

        [TestMethod]
        public void DiveAladinPrime() {
            if (aladinDescriptor == null) Assert.Fail("Aladin Prime descriptor not found");

            var ctx = new Context();

            var rdr = new BinaryReader(File.Open("./dumps/aladin_prime/current_1.bin", FileMode.Open));
            var systime = rdr.ReadInt64();
            var devtime = rdr.ReadUInt32();
            Data = rdr.ReadBytes((int)rdr.BaseStream.Length - 12);
            rdr.Dispose();

            var parser = new Parser(ctx, aladinDescriptor, devtime, systime);
            parser.SetData(Data);

            var maxdepth = parser.GetField<double?>(Parser.dc_field_type_t.DC_FIELD_MAXDEPTH, 0);

            var divetime = parser.GetField<uint?>(Parser.dc_field_type_t.DC_FIELD_DIVETIME, 0);

            var mintemp = parser.GetField<double?>(Parser.dc_field_type_t.DC_FIELD_TEMPERATURE_MINIMUM, 0);

            var mix = parser.GetField<Parser.dc_gasmix_t?>(Parser.dc_field_type_t.DC_FIELD_GASMIX, 0);

            var tank = parser.GetField<Parser.dc_tank_t?>(Parser.dc_field_type_t.DC_FIELD_TANK, 0);

            var avgdepth = parser.GetField<double?>(Parser.dc_field_type_t.DC_FIELD_AVGDEPTH, 0);

            var dt = parser.GetDatetime();

            Console.WriteLine($"datetime= {dt.ToString()}");
            Console.WriteLine($"maxdepth= {maxdepth}");
            Console.WriteLine($"avgdepth= {avgdepth}");
            Console.WriteLine($"divetime= {divetime / 60}:{divetime % 60}");
            Console.WriteLine($"mintemp= {mintemp}C");
            Console.WriteLine($"gasmix= He:{mix.Value.helium * 100}%; O:{mix.Value.oxygen * 100}%; N:{mix.Value.nitrogen * 100}%");

            Assert.AreEqual(tank.HasValue, false, "Shouldn't support tank");

            Assert.AreEqual(mix.HasValue, true, "Should support mix");
            Assert.AreEqual(mix.Value.helium, 0.0, "Invalid mix:helium");
            Assert.AreEqual(mix.Value.oxygen, 0.21, "Invalid mix:helium");
            Assert.AreEqual(mix.Value.nitrogen, 0.79, "Invalid mix:helium");

            Assert.AreEqual(divetime, 1980u, "Invalid dive time");
            Assert.AreEqual(mintemp, 19.2, "Invalid min temp");
            Assert.AreEqual(maxdepth.Value, 3.49268292682927, 0.001, "Invalid max depth");

            ctx.Dispose();
            parser.Dispose();
        }
    }
}