const program = require('commander');
const glob = require('glob');
const demos = glob.sync('**/').map(dir => require(`./${dir}`));
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

  if(demo.parameters) {
    console.log('Configure Parameters\n');
    Object.keys(demo.parameters).forEach(key => {
      const param = demo.parameters[key];
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

  console.log("Running Demo\n");
  demo.run(params);
};

if (program.list) {
  console.log('The avaiable demos are...');
  demos.forEach(demo => {
    console.log(`\t${demo.name}\n\t\t${demo.description}`);
  });
}else {
  demos.forEach(demo => {
    if (demo.name === program.args[0]) {
      runDemo(demo);
    }
  });
}