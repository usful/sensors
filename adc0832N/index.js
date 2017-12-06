const Gpio  = require('pigpio').Gpio;
const { pause } = require('../utils/index');

module.exports = function (csPin, dioPin, clockPin, channel = 0) {

    this.getValue = async () => {
	const adcCLK = new Gpio(clockPin, {mode: Gpio.OUTPUT});
        const adcDIO = new Gpio(dioPin, {mode: Gpio.OUTPUT});
        const adcCS = new Gpio(csPin, {mode: Gpio.OUTPUT});

        adcCLK.digitalWrite(0);
        adcCS.digitalWrite(0);

        adcDIO.digitalWrite(1);
        await pause(10);
        adcCLK.digitalWrite(1);
        await pause(10);
        adcCLK.digitalWrite(0);
        await pause(10);

        adcDIO.digitalWrite(1);
        adcCLK.digitalWrite(1);
        await pause(10);
        adcCLK.digitalWrite(0);
        await pause(10);
 
        adcDIO.digitalWrite(channel);
        adcCLK.digitalWrite(1);
        await pause(10);
        adcDIO.mode(Gpio.INPUT);
        adcCLK.digitalWrite(0);
        await pause(10);
 
        adcCLK.digitalWrite(1);
        await pause(10);
        adcCLK.digitalWrite(0);
        await pause(10);
 
        let value = 0;
        for (let i = 0; i < 8; i++){
          adcCLK.digitalWrite(1);
          const bit = await adcDIO.digitalRead();
          value = (value << 1) | bit;
          await pause(10);
          adcCLK.digitalWrite(0);
          await pause(10);
        }
 
        adcCS.digitalWrite(1);
        return value;
  };

  return this;
};
