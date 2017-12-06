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

const sensor = WaterFlowSensor(4);

setInterval(
  async () => {
    if (sensor) {
      const flowRate = await sensor.getValue();
      console.log(flowRate);
    }
  },
  1100
);