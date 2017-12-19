class FaceDetect  {

  constructor() {
    this.worker = new Worker('cv-wasm/wasm-worker.js');
    this.cbs = [];

    this.worker.onmessage = message => {
      const data = message.data;
      if (data.faceDetected !== null) {
        this.detected(data);
      }
    };
  }

  addListener(cb) {
    this.cbs.push(cb);
  }

  detected(event) {
    this.cbs.forEach(cb => cb(event));
  }

  faceDetect(canvas) {
    this.startJob(canvas, 'faceDetect');
  }

  startJob(canvas, command) {
    let message = {
      cmd: command,
      img: canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
    };

    this.worker.postMessage(message);
  }
}

const face_detector = new FaceDetect();

export default face_detector;