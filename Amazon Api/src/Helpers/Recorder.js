const options = {
  mimeType: 'video/webm;codecs=h264',
  videoBitsPerSecond: Math.floor(1200000)
};

//13934592
export default class Recorder {
  constructor(video) {
    this.video = video;
  }

  onStop(e) {
    console.log('Recorder->onStop');
    this.download();
  }

  onDataAvailable(e) {
    if (event.data && event.data.size > 0) {
      this.chunks.push(event.data);
    }
  }

  async download() {
    if (!this.mediaRecorder) {
      return;
    }

    const blob = new Blob(this.chunks, {
      type: options.mimeType
    });
  
    const fd = new FormData();
    fd.append(`${this.id}.webm`, blob);
    
    const response = await fetch(`/api/video/save/${this.id}`, {
      method: 'POST',
      body: fd
    });
    
    const json = await response.json();
  }

  record(id) {
    if (!this.mediaRecorder) {
      return;
    }

    this.id = id;
    console.log('Recorder->recording');
    this.chunks = [];
    this.mediaRecorder.start();
  }

  stop() {
    if (!this.mediaRecorder) {
      return;
    }

    this.mediaRecorder.stop();
  }

  async setup() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (this.video) {
        this.video.srcObject = this.stream;
        this.video.play();
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.mediaRecorder.onstop = e => this.onStop(e);
      this.mediaRecorder.ondataavailable = e => this.onDataAvailable(e);
    } catch (err) {
      console.log(err);
    }
  }
}
