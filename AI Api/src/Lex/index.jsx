import React, { Component } from 'react';
import cx from 'classnames';
import styles from './styles.scss';
import AWS from 'aws-sdk';
import jsHue from 'jsHue';
import locks from 'locks';
import capture from '../Helpers/Capture';
import listen from '../Helpers/Listen';
import speak from '../Helpers/Speak';
import face_detect from '../Helpers/FaceDetect';

const hue = jsHue();

const mutex = locks.createMutex();

const getBinary = base64Image => {

  var binaryImg = atob(base64Image);
  var length = binaryImg.length;
  var ab = new ArrayBuffer(length);
  var ua = new Uint8Array(ab);
  for (var i = 0; i < length; i++) {
    ua[i] = binaryImg.charCodeAt(i);
  }

  return ab;
};

/**
 * Setting up AWS credentials
 */
const credentials = new AWS.Credentials({
  secretAccessKey: 'iqbPa4ZiiT0Wu+KGdvXfvz2bZTeySac1EEU7iKH7',
  accessKeyId: 'AKIAJ2CUCDT5I6LLXU7Q'
});
const config = new AWS.Config({
  region: 'us-east-1',
  credentials
});
AWS.config = config;

/**
 *  Setting up AWS Rekognition
*/
const rekognition = new AWS.Rekognition();

/**
 * Setting up AWS Lex Runtime
 */
const lex = new AWS.LexRuntime();

export default class LexExample extends Component{
  constructor(props) {
    super(props);

    this.rooms = {};
    this.count=0;

    try {
      this.hueBridge = hue.bridge('192.168.0.10');
      this.user = this.hueBridge.user('goiGLMrBdZmvU8nHunuA8AtPJ3EkiW-9wufDI6HK');
      this.user.getGroups().then(groups => {
        for (let key of Object.keys(groups)) {
          this.rooms[`${groups[key].name}`.toLowerCase()] = key;
        }
      });
    } catch (err) {
      console.log('could not connect to hue bridge');

    }

    //Todo further improve this demo by adding more commands. e.g change color, individual lights, get light configuration

    listen.addListener((speechText) => {
      console.log(speechText);
      lex.postContent({
          botAlias: 'UsfulTestBot',
          botName: 'UsfulLexBot',
          contentType: 'text/plain; charset=utf-8',
          inputStream: speechText,
          userId: 'dev00',
        }, (err, response) => {
          /** const slots = response.slots;
           const room = this.rooms[slots.room.toLowerCase()];
           const bri = Math.floor(255 * parseInt(slots.bri) / 100);

           this.user.setGroupState(room, {bri});
           **/
          console.log(response);
        }
      );
    });

    //capture.addListener(this.analyzeImage.bind(this));
    capture.addListener(canvas => face_detect.faceDetect(canvas));

    //face_detect.addListener(this.drawFaces.bind(this));
    face_detect.addListener(data => {
      mutex.lock(() => {
        if (data.faceDetected && !this.person) {
          this.person = true;
          this.analyzeImage();
        } else if (!data.faceDetected && this.person) {
          this.count ++;
          //sometimes the facedetect doesn't detect a face due to blured out frame. Should throw away frams that are blurry
          //but this is a quick work around
          if (this.count > 1) {
            delete this.person;
            speak.speak('Goodbye');
          }
        }
        mutex.unlock();
      });
    });

  }

  //Method for testing the face detection. Will make the capture image canvas visible and draw rectangles around the face
  //that has been detected
  drawFaces(data) {
    const canvas = capture.canvas;
    if (!document.body.contains(canvas)) {
      document.body.appendChild(canvas);
    }
    const context = canvas.getContext('2d');
    context.strokeStyle = "red";
    for (let face of data.features) {
      context.rect(face.x, face.y, face.width, face.height);
    }
    context.stroke();
  }

  //Todo further filter results based on results confidence of individual photos as well as entire search

  async analyzeImage() {

    const data = capture.canvas.toDataURL();
    const base64Image = data.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    const imageBytes = getBinary(base64Image);

    const results = await this.searchFacesAsync({
      CollectionId: 'all-faces',
      Image: {
        Bytes: imageBytes
      },
      FaceMatchThreshold: 0.90
    });

    const index = results.FaceMatches.findIndex(match => match.Similarity > 0.9);
    let faceId;

    if (index === -1) {
      //Add face to all-faces collection
      const faceData = await indexFacesAsync({
        CollectionId: 'all-faces',
        Image: {
          Bytes: imageBytes,
        }
      });
      faceId = faceData.FaceRecords[0].Face.FaceId;
    }else {
      faceId = results.FaceMatches[index].Face.FaceId;
    }

    const json = await (await fetch(`/face/${faceId}`)).json();
    console.log(json);
    this.person = json.person;
    if(!!json.person) {
      console.log(json.person);
      speak.speak(`Hello, ${json.person.name}`);
    }else {
      //get their name
    }

  };

  searchFacesAsync(params) {
    return new Promise((resolve, reject) => {
      rekognition.searchFacesByImage(params, (err,data) => {
          if(err){
            return reject(err);
          }
          resolve(data);
      });
    })
  }

  indexFacesAsync(params) {
    return new Promis((resolve, reject) => {
      rekognition.indexFaces(params, (err, data) => {
        if(err){
          return reject(err);
        }
        resolve(data);
      })
    })
  }

  setupMediaCapture(el) {
    if (!capture.video) {
      capture.setup(el);
      setInterval(() => {
        capture.capturePhoto();
      }, 500);
    }
  }

  render() {
    return (
      <div className={styles.container}>
        <h1>
          Amazon Lex Example
        </h1>
        <div>
          <h2 style={{color: this.hueBridge ? 'green' : 'red'}}>{this.hueBridge ? 'Hue Bridge Found' : 'Hue Bridge Not Found'}</h2>
          <h2 style={{color: this.user ? 'green' : 'red'}}>{this.user ? 'Valid Username' : 'Invalid Username'}</h2>
          <div className={styles.vidContainer}><video width={640} height={480} ref={el => this.setupMediaCapture(el)} muted/></div>
          <div className={styles.btnContainer}>
            <button
              onClick={
                async () => {
                  //listen.getResponse();
                  listen.emit('set kitchen lights');
                }
              }
            >
              Listen
            </button>
          </div>
        </div>
      </div>
    );
  }
}
