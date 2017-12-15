const options = {
  mimeType: 'video/webm;codecs=h264',
  videoBitsPerSecond: Math.floor(1200000)
};

//13934592
export default class Recorder {
  constructor(video, cb = () =>{}) {
    this.video = video;

    this.canvas = document.createElement('canvas');

    this.cb = cb;
  }

  capturePhoto() {
    const context = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    context.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);

    this.cb(this.canvas.toDataURL());
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

    } catch (err) {
      console.log(err);
    }
  }
}
