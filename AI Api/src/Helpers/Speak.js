const VOICE = 'Google US English';
const speech = window.speechSynthesis;

let utterances = [];

const UTTERANCE = {
  text: '',
  volume: 1,
  pitch: 1,
  rate: 1.1,
  lang: 'en',
  pause: 0 //ms.
};

class Speak {
  constructor() {
    this.cbs = [];
  }

  getVoice(name = VOICE) {
    return speech.getVoices().find(voice => voice.name === name);
  }

  _reject(e) {
    if (this.rejector) {
      this.rejector(e);
    }

    this.resolver = null;
    this.rejector = null;
  }

  _resolve() {
    if (this.resolver) {
      this.resolver();
    }

    this.resolver = null;
    this.rejector = null;
  }

  addListener(cb) {
    this.cbs.push(cb);
  }

  emit(event) {
    this.cbs.forEach(cb => cb(event));
  }

  cancel() {
    speech.cancel()
  }
  
  speakUtterances() {
    if (this.utterances.length === 0) {
      this.emit('');
      this._resolve();
      return;
    }

    const utter = this.utterances.pop();

    if (utter.pause) {
      setTimeout(() => this.speakUtterances(), utter.pause);
      return;
    }

    const msg = new SpeechSynthesisUtterance();

    msg.addEventListener('end', e => this.speakUtterances());
    msg.addEventListener('error', e => this._reject(e));

    msg.lang = utter.lang;
    msg.text = utter.text;
    msg.volume = utter.volume;
    msg.rate = utter.rate;
    msg.pitch = utter.pitch;

    msg.voice = this.getVoice();

    utterances.push(msg);
    
    speech.speak(msg);
    this.emit(msg.text);
  }

  speak(arr) {
    const map = utter => {
      if (typeof utter === 'string') {
        return { ...UTTERANCE, text: utter };
      } else if (typeof utter === Number) {
        return { ...UTTERANCE, pause: utter };
      } else return { ...UTTERANCE, ...utter };
    };

    return new Promise((resolve, reject) => {
      this.resolver = resolve;
      this.rejector = reject;
      utterances = [];
      this.utterances = [];

      (Array.isArray(arr) ? arr : [arr]).forEach(utter =>
        this.utterances.push(map(utter))
      );

      this.utterances.reverse();

      this.speakUtterances();
    });
  }
}

const speak = new Speak();

export default speak;
