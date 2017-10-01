using LibDiveComputer;
using Newtonsoft.Json;
using System;

namespace DiveLogUploader.Writers {

    public class ComputerBoundDive: Dive {
        [JsonProperty("computer_id")]
        public int ComputerId;

        public ComputerBoundDive(Dive d, int comp) : base(d) {
            ComputerId = comp;
        }

    }
    
    public class PostComputerResponse {
        public int computer_id;
        public string name;
        public string last_fingerprint;
    }

    public class PostDiveRequest {

    }
    public class PostDiveResponse {
        public int dive_id;
        public bool skipped;
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

            if (resp.last_fingerprint != null) {
                var fingerprint = Convert.FromBase64String(resp.last_fingerprint);
                d.SetFingerprint(fingerprint);
            }
        }

        protected override void ProcessDive(Dive d) {
            var boundDive = new ComputerBoundDive(d, computerId);

            var resp = Request.Json<Dive, PostDiveResponse>(
                WebApplicationSession.BASE_URL + "dive",
                HttpVerb.POST,
                boundDive,
                WebApplicationSession.TokenHeader(token)
            );
        }
    }
}