using LibDiveComputer;
using System.Collections.Generic;
using System.ComponentModel;
using System.Threading;

namespace DiveLogUploader.Writers {

    public delegate void OnCompleteHandler(object sender);

    public delegate void OnProgresHandler(object sender, int total, int processed);

    public interface IDiveWriter {

        event OnCompleteHandler OnComplete;

        event OnProgresHandler OnProgres;

        void SetDevice(Device device);

        void AddDive(Dive dive);

        void Start();

        void End();
    }

    public abstract class AsyncDiveWriter : IDiveWriter {

        public event OnCompleteHandler OnComplete;

        public event OnProgresHandler OnProgres;

        public int Total = 0;
        public int Processed = 0;

        protected Device device;
        protected BackgroundWorker worker;

        protected bool isDone = true;
        protected Queue<Dive> queue = new Queue<Dive>();
        protected EventWaitHandle waitEvent = new AutoResetEvent(false);
        protected EventWaitHandle doneEvent = new AutoResetEvent(false);

        public AsyncDiveWriter() {
            worker = new BackgroundWorker();
            worker.DoWork += DoWork;
        }

        public virtual void AddDive(Dive dive) {
            lock (queue) {
                queue.Enqueue(dive);
                Total += 1;
            }
            OnProgres?.Invoke(this, Total, Processed);
            waitEvent.Set();
        }

        public virtual void Start() {
            if (worker.IsBusy) return;

            isDone = false;
            worker.RunWorkerAsync();
        }

        public virtual void End() {
            if (isDone) return;

            isDone = true;
            waitEvent.Set();
            doneEvent.WaitOne();
        }

        public virtual void SetDevice(Device d) {
            device = d;
        }

        public virtual void Dispose() {
            End();
            worker.Dispose();
        }

        protected virtual void DoWork(object sender, DoWorkEventArgs e) {
            while (!isDone) {
                Dive item = null;

                lock (queue) {
                    if (queue.Count != 0) {
                        item = queue.Dequeue();
                        Processed++;
                    }
                }
                if (item != null) {
                    ProcessDive(item);
                    OnProgres?.Invoke(this, Total, Processed);
                } else {
                    waitEvent.WaitOne();
                }
            }
            Done();
        }

        protected virtual void Done() {
            OnComplete?.Invoke(this);
            doneEvent.Set();
        }

        protected abstract void ProcessDive(Dive dive);
    }
}