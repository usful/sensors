const program = require('commander');
const glob = require('glob');
const demos = glob.sync('**/').forEach(dir => require(`./${dir}demo.js`));
const readline = require('readline');

program
  .version('0.0.1')
  .option('-l, --list', 'List Available Demos')
  .parse(process.argv);

const runDemo = demo => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const params = {};

  if(demo.meta.parameters) {
    console.log('Configure Parameters\n');
    Object.keys(demo.meta.parameters).forEach(key => {
      const param = demo.meta.parameters[key];
      while (!params[key]) {
        rl.question(`${key} [default ${param.default}]: `,
          answer => {
            let value = answer;
            if (param.type === 'Number') {
              value = +value;
            }

            if (!param.range || (param.range && (param.min && !value < param.min) && (param.max && !value > param.max ))) {
              params[key] = value;
            }
          }
        );
      }
    })
  }

  demo.run(params);
};

demos.forEach(demo => {
  if (demo.meta.name) {
    runDemo(demo);
  }
});