const program = require('commander');
const glob = require('glob');
const demos = glob.sync('**/').map(dir => require(`./${dir}demo.js`));
const prompt = require('prompt-sync')();

program
  .version('0.0.1')
  .option('-l, --list', 'List Available Demos')
  .parse(process.argv);

const runDemo = demo => {

  process.on('SIGINT', () => {
    demo.stop();
    process.exit(0);
  });

  const params = {};

  if(demo.meta.parameters) {
    console.log('Configure Parameters\n');
    Object.keys(demo.meta.parameters).forEach(key => {
      const param = demo.meta.parameters[key];
      let answer;
      while (!params[key]) {
        answer = prompt(`${key} [default ${param.default}]: `);

        if (answer === '') {
          params[key] = param.default;
        } else {
          let value = answer;
          if (param.type === 'Number') {
            value = +value;
          }

          if (!param.range || (param.range && (param.min && !value < param.min) && (param.max && !value > param.max ))) {
            params[key] = value;
          }
        }
      }
    })
  }

  demo.run(params);
  rl.close();

  console.log('Demo Finished!');
};

demos.forEach(demo => {
  if (demo.meta.name) {
    runDemo(demo);
  }
});