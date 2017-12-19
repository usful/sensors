//13934592
class Capture {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.cbs = [];
  }

  addListener(cb) {
    this.cbs.push(cb);
  }

  emit(event) {
    this.cbs.forEach(cb => cb(event));
  }

  capturePhoto() {
    const context = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    context.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);

    this.emit(this.canvas);
  }

  async setup(video) {
    try {
      this.video = video;

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      if (this.video) {
        this.video.srcObject = this.stream;
        this.video.play();
      }

      console.log('media capture setup');

    } catch (err) {
      console.log(err);
    }
  }
}

const capture = new Capture();

export default capture;