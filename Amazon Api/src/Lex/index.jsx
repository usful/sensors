import React, { Component } from 'react';
import cx from 'classnames';
import styles from './styles.scss';
import AWS from 'aws-sdk';

import jsHue from 'jsHue';
const hue = jsHue();

import listen from '../Helpers/Listen';

const lex = new AWS.LexRuntime({
  region: 'us-east-1',
  secretAccessKey: 'iqbPa4ZiiT0Wu+KGdvXfvz2bZTeySac1EEU7iKH7',
  accessKeyId: 'AKIAJ2CUCDT5I6LLXU7Q',
});

export default class LexExample extends Component{
  constructor(props) {
    super(props);
    this.state = {
      listening: false
    };
    /**
    this.hueBridge = hue.bridge('192.168.0.10');
    this.user = this.hueBridge.user('goiGLMrBdZmvU8nHunuA8AtPJ3EkiW-9wufDI6HK');
    this.rooms = {};
    this.user.getGroups().then(groups => {
      for (let key of Object.keys(groups)) {
        this.rooms[`${groups[key].name}`.toLowerCase()] = key;
      }
      console.log(this.rooms);
    });*/

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
          /**
          const room = this.rooms[slots.room.toLowerCase()];
          const bri = Math.floor(255*parseInt(slots.bri)/100);
          console.log(`setGroupState(${room},{bri:${bri}})`);
          this.user.setGroupState(room, {bri});
           */
        }
      );
    });
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
          <div className={styles.btnContainer}>
            <button
              onClick={
                () => {
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
