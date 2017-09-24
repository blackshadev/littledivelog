using LibDiveComputer;


namespace DiveLogUploader.Writers {
    public class PostComputerRequest {
        public uint serial;
        public string vendor;
        public uint model;
        public uint type;
        public string name;
    }
    public class PostComputerResponse {
        public int computer_id;
        public string name;
    }


    public class LittleLogDiveWriter : AsyncDiveWriter {
        protected string token;
        protected int computerId;
        public LittleLogDiveWriter(string tok): base() {
            token = tok;
        }

        public override void SetDevice(Device d) {
            base.SetDevice(d);

            var resp = Request.Json<PostComputerRequest, PostComputerResponse>(
                WebApplicationSession.BASE_URL + "computer",
                HttpVerb.POST,
                new PostComputerRequest {
                    model = d.Model,
                    name = d.Descriptor.product,
                    serial = d.Serial,
                    type = d.Descriptor.type,
                    vendor = d.Descriptor.vendor
                },
                WebApplicationSession.TokenHeader(token)
            );
            computerId = resp.computer_id;
        }

        protected override void ProcessDive(Dive dive) {
        }
    }
}