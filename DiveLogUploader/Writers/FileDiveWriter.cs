using Newtonsoft.Json;
using System;
using System.IO;
using System.Text;

namespace DiveLogUploader.Writers {

    public class FileDiveWriter : AsyncDiveWriter, IDisposable {
        protected StreamWriter fileWriter;
        protected JsonWriter writer;
        protected JsonSerializer serializer;

        public FileDiveWriter(string path) : base() {
            fileWriter = new StreamWriter(path, false, Encoding.UTF8);
            writer = new JsonTextWriter(fileWriter);
            serializer = new JsonSerializer();
        }

        public override void Start() {
            if (worker.IsBusy) return;

            writer.WriteStartObject();
            writer.WritePropertyName("ReadTime");
            writer.WriteValue(DateTime.Now);

            writer.WritePropertyName("Device");
            serializer.Serialize(writer, device);

            writer.WritePropertyName("Dives");
            writer.WriteStartArray();

            base.Start();
        }

        public override void End() {
            if (isDone) return;

            base.End();
            
            writer.WriteEndArray();
            writer.WriteEndObject();
        }

        protected override void ProcessDive(Dive dive) {
            serializer.Serialize(writer, dive);
        }

        public override void Dispose() {
            base.Dispose();

            writer.Close();
            fileWriter.Close();
        }

    }
}