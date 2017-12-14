import React, { Component } from 'react';
import cx from 'classnames';
import styles from './styles.scss';
import AWS from 'aws-sdk';
import jsHue from 'jsHue';
import Recorder from '../Helpers/Recorder';
import listen from '../Helpers/Listen';

const hue = jsHue();

const pause = (time = 500) => {
  return new Promise((resolve, reject) => setTimeout(() => resolve(), time));
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

//Removed all video recording attempts from the code. The process will work but the time it takes is too long to be off
//use for real-time processing. Perhaps could be used in the vendbot since interactions are generally longer than a couple
//of seconds. This would allow the bot time to store user face for recognition in the future. The time delay could also be
//seen as a more human trait off trying to remember someone and could be funny.

/**
 * Setting up AWS S3 Bucket


const s3 = new AWS.S3({
  params: {Bucket: 'rekognition-faces-dev'}
});

/**
 *  Setting up AWS Rekognition

const rekognition = new AWS.Rekognition();

const analyzeVideo = async name => {
  console.log(JSON.stringify(name));
  rekognition.startFaceSearch({
    CollectionId: 'authorized-hue-faces',
    Video: {
      S3Object: {
        Bucket: 'rekognition-faces-dev',
        Name: name
      }
    },
    FaceMatchThreshold: 9.0
  }, (err, response) => {
    if(err){
      console.log(err);
    }else {
      const jobId = response.JobId;
      console.log(jobId);
      rekognition.getFaceSearch({JobId: `${jobId}`}, (err, data) => {
        if (err) {
          console.log(err);
        }else {
          console.log(data);
        }
      });
    }
  });
};

/**
 * Setting up AWS Elastic Transcoder

const eTranscoder = new AWS.ElasticTranscoder();

const transcodeVideo = async name => {
  const outputName = name.replace('webm', 'mp4').replace('Uploads', 'Transcoded');
  eTranscoder.createJob({
    PipelineId: '1513260493463-g7ff1c',
    Input: {
      Key: name,
      Container: 'webm' //could set this to auto
    },
    Output: {
      Key: outputName,
      PresetId: '1351620000001-100180'
    }
  },async err => {
    if(err) {
      console.log(err);
    }else {
      await pause(20000);
      analyzeVideo(outputName);
    }
  });
};

const uploadData = async blob => {
  console.log(blob);
  const name = `Uploads/${new Date().valueOf()}.webm`;
  s3.putObject({
    Body: blob,
    Key: name,
    ACL: 'public-read'
  }, (err) => {
    if (err) {
      console.log(err);
    }else {
      transcodeVideo(name);
    }
  });
};

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
    this.hueBridge = hue.bridge('192.168.0.10');
    this.user = this.hueBridge.user('goiGLMrBdZmvU8nHunuA8AtPJ3EkiW-9wufDI6HK');
    this.rooms = {};
    this.user.getGroups().then(groups => {
      for (let key of Object.keys(groups)) {
        this.rooms[`${groups[key].name}`.toLowerCase()] = key;
      }
      console.log(this.rooms);
    });

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
          const bri = Math.floor(255*parseInt(slots.bri)/100);
          console.log(`setGroupState(${room},{bri:${bri}})`);
          this.user.setGroupState(room, {bri});
        }
      );
    });
  }

  createRecorder(el) {
    if (!this.recorder) {
      this.recorder = new Recorder(el, uploadData);
      this.recorder.setup();
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
          <div className={styles.vidContainer} style={{display:'none'}}><video ref={el => this.createRecorder(el)} muted/></div>
          <div className={styles.btnContainer}>
            <button
              onClick={
                async () => {
                  listen.getResponse();
                  //this.recorder.start();
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
