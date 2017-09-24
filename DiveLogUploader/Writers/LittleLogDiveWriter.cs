using LibDiveComputer;


namespace DiveLogUploader.Writers {
    
    public class PostComputerResponse {
        public int computer_id;
        public string name;
    }

    public class PostDiveRequest {

    }
    public class PostDiveResponse {
        public int dive_id;
    }


    public class LittleLogDiveWriter : AsyncDiveWriter {
        protected string token;
        protected int computerId;
        public LittleLogDiveWriter(string tok): base() {
            token = tok;
        }

        public override void SetDevice(Device d) {
            base.SetDevice(d);

            var resp = Request.Json<Computer, PostComputerResponse>(
                WebApplicationSession.BASE_URL + "computer",
                HttpVerb.POST,
                new Computer(d),
                WebApplicationSession.TokenHeader(token)
            );
            computerId = resp.computer_id;
        }

        protected override void ProcessDive(Dive d) {
            var resp = Request.Json<Dive, PostDiveResponse>(
                WebApplicationSession.BASE_URL + "computer",
                HttpVerb.POST,
                d,
                WebApplicationSession.TokenHeader(token)
            );
        }
    }
}