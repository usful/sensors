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
            speedControl.pwmWrite(speed - Math.floor(speedRange * poured / target_volume));
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
  meta: require('./meta')
};

