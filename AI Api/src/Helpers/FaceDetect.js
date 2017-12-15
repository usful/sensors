export default class FaceDetect  {

  constructor(video) {
    this.video = video;
    this.cbs = [];
    this.faceDetected = false;
  }

  addListener(cb) {
    this.cbs.push(cb);
  }

  detected() {
    this.cbs.forEach(cb => cb());
  }

  processVideo() {
    try {
      const begin = Date.now();
      const {
        src,
        cap,
        classifier,
        dst,
        gray,
        faces
      } = this;
      // start processing.
      cap.read(src);
      src.copyTo(dst);
      cv.cvtColor(dst, gray, cv.COLOR_RGBA2GRAY, 0);
      // detect faces.
      classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
      //if faces found and no face was detected earlier execute callbacks else set faceDetected to false
      if(faces.size() > 0 && !this.faceDetected) {
        this.detected();
        this.faceDetected = true;
      }else{
        this.faceDetected = false;
      }
      // schedule the next one.
      let delay = 1000/60 - (Date.now() - begin);
      setTimeout(this.processVideo, delay);
    } catch (err) {
      console.log(err);
    }
  };

  setup() {
    console.log(this.video, this.video.height, this.video.width);
    this.src = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC4);
    this.dst = new cv.Mat(this.video.height, this.video.width, cv.CV_8UC1);
    this.gray = new cv.Mat();
    this.cap = new cv.VideoCapture(this.video);
    this.faces = new cv.RectVector();
    this.classifier = new cv.CascadeClassifier();

    this.classifier.load('haarcascade_frontalface_default.xml');

    this.processVideo();
  }
}