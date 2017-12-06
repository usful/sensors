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
const EventEmitter = require('events');

const emitter = new EventEmitter();

const sensor = WaterFlowSensor(4);

const en1 = new GPIO(17, {mode: GPIO.OUTPUT});
const en2 = new GPIO(27, {mode: GPIO.OUTPUT});

let poured = 0;

let lastTime = process.hrtime();
let lastFlowRate = 0;
let pumpOn = false;

emitter.on('data', async (data) => {
  const diff = process.hrtime(lastTime);
  const flowRate = lastFlowRate;

  lastFlowRate = data; //Sets this as early as possible
  lastTime = process.hrtime(); //sets this as early as possible


  console.log('time diff: ',diff[1] / 1000000000 + diff[0]);
  console.log('flowRate: ',flowRate * 1000 / 60);

  poured += ( flowRate * 1000 / 60) * (diff[1] / 1000000000 + diff[0]);
  console.log(poured);

  if (poured >= 250 ) {
    en1.digitalWrite(0);
    console.log(`Poured: ${poured}`);
    process.exit(0);
  }
  
}); //When new flow is read do this

setInterval(
  async () => {
    if (sensor) {
      if (!pumpOn) {
        en2.digitalWrite(0);
        en1.digitalWrite(1);
        pumpOn=true;
      }
      poured += ( lastFlowRate * 1000 / 60) * (diff[1] / 1000000000 + diff[0]);

      const flowRate = await sensor.getValue(); //L/min
      emitter.emit('data', flowRate);
    }
  },
  1100
);

