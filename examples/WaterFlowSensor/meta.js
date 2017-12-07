module.exports = {
  id: 0,
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