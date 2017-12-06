const GPIO = require('pigpio').Gpio;
const { pause } = require('../utils');

/**
 * To convert the number of times a rising edge occurs within a given time duration into a measurement of flow,
 * it is required to convert that number into a measurement of frequency (Hz). Then use the Flow Rate Pulse characteristics
 * as described by the sensors data sheet to convert the frequency measurement into a rate of flow measurement.
 *
 * The default configurations are set to a sampling time duration of 1000 ms and a flow rate pulse characteristics of
 *  hz = 7.5 * rateOfFlow(L/min) which we then divide by 60 to get L/s.
 *
 * @param pin
 * @param duration
 * @param flowRatePulseCharacteristics
 * @returns {*}
 */

const defaultConf = {
  duration: 1000,
  flowRatePulseCharacteristics: hz => hz/(7.5*60),
};

module.exports = (pin, conf) => {
  this.sensor = new GPIO(pin, {mode: GPIO.OUTPUT});
  this.NbTopsFan;

  const duration = conf.duration || defaultConf.duration;
  const flowRatePulseCharacteristics = conf.flowRatePulseCharacteristics || defaultConf.flowRatePulseCharacteristics;

  this.rpm = () => {
    this.NbTopsFan ++;
  };

  this.sensor.pullUpDown(GPIO.PUD_UP);
  this.sensor.on('interrupt', this.rpm);

  const multiplier  = 1000/duration;

  this.getValue = async () => {
    this.NbTopsFan = 0;
    this.sensor.enableInterrupt(GPIO.RISING_EDGE);
    await pause(duration);
    sensor.disableInterrupt();
    return flowRatePulseCharacteristics(NbTopsFan*multiplier);
  };

  return this;
};