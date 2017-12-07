module.exports = {
  parameters: {
    "pump_enable_pin": {
      type: "Integer",
      range: {
        min: 0,
        max: 42
      },
      default: 17
    },
    "sensor_pin": {
      type: "Integer",
      range: {
        min: 0,
        max: 42
      },
      default: 4
    },
    "target_volume": {
      type: "Integer",
      units: "mL",
      range: {
        min: 0
      },
      defautl: 250
    },
    "conversion_constant": {
      type: "Float",
      range: {
        min: 0
      },
      default: 1.68
    }
  },
  description: "In this demo we use a bilge pump paired with the water flow sensor to pump a specific amount of water"
};