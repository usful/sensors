const options = {
  mimeType: 'video/webm;codecs=h264',
  videoBitsPerSecond: Math.floor(1200000)
};

//13934592
export default class Recorder {
  constructor(video, cb = () =>{}) {
    this.video = video;
    this.cb = cb;
  }

  onStop(e) {
    console.log('Recorder->onStop');
  }

  onDataAvailable(e) {
    if (event.data && event.data.size > 0) {
      //Will stream the chunk of data instead
      this.cb(event.data);
    }
  }

  start() {
    if (!this.mediaRecorder) {
      return;
    }

    console.log('Recorder->recording');
    this.mediaRecorder.start();
    this.timer = setTimeout(() => {
      this.mediaRecorder.stop();
    }, 5000);
  }

  stop() {
    if (!this.mediaRecorder) {
      return;
    }
    clearTimeout(this.timer);
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
