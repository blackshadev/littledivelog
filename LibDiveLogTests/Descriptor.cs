using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;

namespace LibDiveLogTests
{
    [TestClass]
    public class Descriptor
    {
        [TestMethod]
        public void DescriptorList()
        {
            var checkList = new List<string>();
            checkList.Add("suunto");
            checkList.Add("uwatec");
            checkList.Add("mares");

            foreach (LibDiveComputer.Descriptor descr in LibDiveComputer.Descriptor.Descriptors())
            {
                var idx = checkList.IndexOf(descr.vendor.ToLower());
                if (idx > -1) checkList.RemoveAt(idx);
            }

            Assert.AreEqual(checkList.Count, 0, "Missing vendors: " + String.Join(", ", checkList));
        }
    }
}
