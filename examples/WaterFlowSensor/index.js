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

const WaterFlowSensor = require('../../src/WaterFlowSensor/index');
const GPIO = require('pigpio').Gpio;


module.exports = {
  run: ({pump_enable_pin, sensor_pin, target_volume, conversion_constant, speed_control_pin, speed}) => {
    const sensor = WaterFlowSensor(sensor_pin);
    const minSpeed = 80;

    const speedRange = speed - minSpeed

    const en = new GPIO(pump_enable_pin, {mode: GPIO.OUTPUT});
    const speedControl = new GPIO(speed_control_pin, {mode: GPIO.OUTPUT});


    let poured = 0;
    let pumpOn = false;

    this.stop = () => {
      en.digitalWrite(0);
      speedControl.digitalWrite(0);
      process.exit(0);
    };

    setInterval(
      async () => {
        if (sensor) {
          if (!pumpOn) {
            en.digitalWrite(1);
            speedControl.pwmWrite(speed);
            pumpOn=true;
          }else {
            const newSpeed =Math.floor(speed - speedRange * poured / target_volume);
            speedControl.pwmWrite(newSpeed);
            console.log(`New Speed: ${newSpeed}`);
          }

          const flowRate = await sensor.getValue(); //L/min
          //Multiplied 1.68 due to testing. Depending on your apparatus this value might be different.
          poured += flowRate * 1000 / 60 * conversion_constant;
          console.log(`Poured out: ${poured}`);
          if (poured >= target_volume) {
            this.stop();
          }
        }
      },
      1001
    );
  },
  parameters: {
    "pump_enable_pin": {
      type: "Number",
      range: {
        min: 0,
        max: 27
      },
      default: 17
    },
    "sensor_pin": {
      type: "Number",
      range: {
        min: 0,
        max: 27
      },
      default: 4
    },
    "target_volume": {
      type: "Number",
      units: "mL",
      range: {
        min: 0
      },
      default: 250
    },
    "conversion_constant": {
      type: "Number",
      range: {
        min: 0
      },
      default: 1.68
    },
    "speed" :{
      type: "Number",
      range: {
        min: 0,
        max: 255
      },
      default: 128
    },
    "speed_control_pin": {
      type: "Number",
      range: {
        min: 0,
        max: 27
      },
      default: 27
    },
  },
  name: 'Water Flow Sensor',
  description: "In this demo we use a bilge pump paired with the water flow sensor to pump a specific amount of water"
};

