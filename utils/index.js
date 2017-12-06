module.exports = {
  pause: (t) => new Promise(resolve => {setTimeout(resolve, t)})
};