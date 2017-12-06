/**
 *
 *  Water Flow Sensor Demo
 *
 *  This piece of code makes use of the code from index.js to read values from a water flow sensor and output
 *  the flow rate of the water to console.
 *
 *  The waterflow sensor output is connected to the raspberry pi's gpio pin 4. Ground is put in gpio pin 5 and
 *  power is put into the raspberry pi's 5v gpio pin.
 *
 */

const WaterFlowSensor = require('./index');
const GPIO = require('pigpio').Gpio;

const sensor = WaterFlowSensor(4);

const en1 = new GPIO(17, {mode: GPIO.OUTPUT});
const en2 = new GPIO(27, {mode: GPIO.OUTPUT});

let poured = 0;

(async function loop() {
  let pumpOn = false;
  while(true) {
    if (sensor) {
      if (!pumpOn) {
        en2.digitalWrite(0);
        en1.digitalWrite(1);
      }
      const flowRate = await sensor.getValue(); //L/min
      const mLPerSecond = flowRate*1000/60;
      poured += mLPerSecond;
      console.log(`Flow Rate: ${flowRate}`, `Total Volume (mL): ${poured}`);
    }
  }
})();

setInterval(() => {
    if (poured >= 250) {
      en1.digitalWrite(0);
      process.exit(0);
    }
  },
  100
);