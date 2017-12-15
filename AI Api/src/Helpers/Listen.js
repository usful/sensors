const PAUSE_TIMEOUT = 600;
const START_TIMEOUT = 5000;
const LANGUAGE = 'en-CA';

class Listen {
  constructor() {
    if (!window.webkitSpeechRecognition) {
      console.log('no speech recognition');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = e => {
      //console.log(Date.now(), 'Listen onstart');
      this.isListening = true;
      this.setTimeout(this.timeoutTime);
    };

    recognition.onerror = e => {

      if (event.error === 'no-speech') {
        this.ignoreOnEnd = true;
        this.noResponse(new Error('no-speech'));
      }

      if (event.error === 'audio-capture') {
        this.ignoreOnEnd = true;
      }
      if (event.error === 'not-allowed') {
        this.ignoreOnEnd = true;
      }
    };

    recognition.onend = e => {
      //console.log(Date.now(), 'Listen onend');

      this.isListening = false;

      if (this.ignoreOnEnd) {
        return;
      }

      if (!this.finalTranscript) {
        this.clearTimeout();
        this.noResponse();
        return;
      }

      this.clearTimeout();
      this.gotResponse(this.finalTranscript);
    };

    recognition.onspeechend = e => {
      //console.log(Date.now(), 'Listen onspeechend');
    };

    recognition.onresult = e => {
      this.setTimeout(this.pauseTimeout);

      let interimTranscript = '';

      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const result = e.results[i];

        if (result.isFinal) {
          this.finalTranscript += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript + ' ';
        }
      }

      //console.log(Date.now(), 'Listen->onresult', this.finalTranscript);
    };

    this.recognition = recognition;
    this.isListening = false;
    this.ignoreOnEnd = false;
    this.finalTranscript = '';
    this.cbs = [];
  }

  addListener(cb) {
    this.cbs.push(cb);
  }

  emit(event) {
    this.cbs.forEach(cb => cb(event));
  }

  clearTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  setTimeout(timeout = PAUSE_TIMEOUT) {
    this.clearTimeout();
    this.timeout = setTimeout(() => this.stop(), timeout);
  }

  gotResponse() {
    this.stop();
    //console.log(Date.now(), 'Listen->gotResponse', this.finalTranscript);

    this.emit(this.finalTranscript);

    if (this.resolver) {
      this.resolver(this.finalTranscript);
      this.resolver = null;
    }
  }

  noResponse(e) {
    this.stop();

    if (this.rejector) {
      this.rejector(e || new Error('no-speech'));
      this.rejector = null;
    }
  }

  stop() {
    if (this.isListening) {
      //console.log(Date.now(), 'Listen->stop');
      this.clearTimeout();
      this.recognition.stop();
      this.isListening = false;
    }
  }

  start(timeout = START_TIMEOUT, pause = PAUSE_TIMEOUT) {
    //console.log(Date.now(), 'Listen->start');
    if (this.isListening) {
      this.stop();
      console.error(Date.now(), 'Listen->start problem listening.');
      this.setTimeout(() => this.start(timeout, pause), 500);
      return;
    }

    this.finalTranscript = '';
    this.timeoutTime = timeout;
    this.pauseTimeout = pause;
    this.recognition.start();
    this.ignoreOnEnd = false;
    this.recognition.lang = LANGUAGE;
  }

  getResponse(timeout = START_TIMEOUT, pause = PAUSE_TIMEOUT) {
    return new Promise((resolve, reject) => {
      this.resolver = resolve;
      this.rejector = reject;

      this.start(timeout, pause);
    });
  }
}

const listen = new Listen();
export default listen;
