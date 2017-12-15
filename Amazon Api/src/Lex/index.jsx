import React, { Component } from 'react';
import cx from 'classnames';
import styles from './styles.scss';
import AWS from 'aws-sdk';
import jsHue from 'jsHue';
import Capture from '../Helpers/Capture';
import listen from '../Helpers/Listen';

const hue = jsHue();

const hueCommands = {};

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
    this.state = {
      listening: false
    };

    this.authorized = false;
    this.rooms = {};

    try {
      this.hueBridge = hue.bridge('192.168.0.10');
      this.user = this.hueBridge.user('goiGLMrBdZmvU8nHunuA8AtPJ3EkiW-9wufDI6HK');
      this.user.getGroups().then(groups => {
        for (let key of Object.keys(groups)) {
          this.rooms[`${groups[key].name}`.toLowerCase()] = key;
        }
      });
    }catch(err){
      console.log('could not connect to hue bridge');

    }

    listen.addListener((speechText) => {
      console.log(speechText);
      lex.postContent({
          botAlias: 'UsfulTestBot',
          botName: 'UsfulLexBot',
          contentType: 'text/plain; charset=utf-8',
          inputStream: speechText,
          userId: 'dev00',
        }, (err, response) => {
          const slots = response.slots;
          console.log(slots);
          this.setState({
            listening: false
          });
          const room = this.rooms[slots.room.toLowerCase()];
          const bri = Math.floor(255 * parseInt(slots.bri) / 100);
          console.log(this);
          if (this.authorized) {
            this.user.setGroupState(room, {bri});
          }
        }
      );
    });
  }

  createMediaCapture(el) {
    if (!this.capture) {
      this.capture = new Capture(el, this.analyzeImage.bind(this));
      this.capture.setup();
    }
  }

  analyzeImage(data) {
    const base64Image = data.replace(/^data:image\/(png|jpeg|jpg);base64,/, "")
    const imageBytes = getBinary(base64Image);
    console.log(imageBytes);
    rekognition.searchFacesByImage({
      CollectionId: 'authorized-hue-faces',
      Image: {
        Bytes: imageBytes
      },
      FaceMatchThreshold: 9.0
    },(err, data) => {
      if(err) {
        console.log(err);
      }else {
        console.log(data);
        if(data.FaceMatches.find(result => result.Similarity > 90)) {
          console.log('command approved');
          this.authorized = true;
        }else {
          console.log('command rejected');
          this.authorized = false;
        }
      }
    })
  };

  render() {
    return (
      <div className={styles.container}>
        <h1>
          Amazon Lex Example
        </h1>
        <div>
          <h2 style={{color: this.hueBridge ? 'green' : 'red'}}>{this.hueBridge ? 'Hue Bridge Found' : 'Hue Bridge Not Found'}</h2>
          <h2 style={{color: this.user ? 'green' : 'red'}}>{this.user ? 'Valid Username' : 'Invalid Username'}</h2>
          <div className={styles.vidContainer}><video ref={el => this.createMediaCapture(el)} muted/></div>
          <div className={styles.btnContainer}>
            <button
              onClick={
                async () => {
                  this.capture.capturePhoto();
                  listen.getResponse();
                  this.setState({
                    listening: true
                  });
                }
              }
              disabled={this.state.listening}
            >
              Listen
            </button>
            {this.state.listening ? <h3>Listening ...</h3> : null}
          </div>
        </div>
      </div>
    );
  }
}
