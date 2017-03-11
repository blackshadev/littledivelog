using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Linq;

namespace LibDiveLogTests {

    [TestClass]
    public class TestVersion {

        [TestMethod]
        public void VersionString() {
            var strVersion = String.Format("{0}.{1}.{2}", LibDiveComputer.Version.Major, LibDiveComputer.Version.Minor, LibDiveComputer.Version.Micro);
            var asStr = LibDiveComputer.Version.AsString.Substring(0, 5);
            var parts = asStr.Split('.').Select((v) => UInt32.Parse(v)).ToArray();

            Assert.AreEqual(parts[0], LibDiveComputer.Version.Major, "Major version check failed");
            Assert.AreEqual(parts[1], LibDiveComputer.Version.Minor, "Minor version check failed");
            Assert.AreEqual(parts[2], LibDiveComputer.Version.Micro, "Micro version check failed");
        }
    }
}