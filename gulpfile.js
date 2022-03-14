const {exec, spawn} = require('child_process');
const path = require('path');
const {parseArgsStringToArgv} = require('string-argv');

const SRC_PATH = '/Users/turgaysaba/Desktop/projects/debt-service/src';
const APPLY_UNSAFE_TRANSFORMS = false;
const APPLY_TS_MIGRATE = true;
const RUN_VISUALIZER = true;

const SAFE_TRANSFORM_TYPES = [
  'arrow', // +  .......... callback to arrow function
  'arrow-return', // +  ... drop return statements in arrow functions
  'for-of', // +  ......... for loop to for-of loop
  'for-each', // +  ....... for loop to Array.forEach()
  'arg-rest', // +  ....... use of arguments to function(...args)
  'arg-spread', // +  ..... use of apply() to spread operator
  'obj-method', // +  ..... function values in objects to methods
  'obj-shorthand', // +  .. {foo: foo} to {foo}
  'no-strict', // +  ...... remove "use strict" directives
  'exponent', // +  ....... Math.pow() to ** operator (ES7)
  'multi-var', // +  ...... single var x,y; declaration to var x; var y; (refactor)
];

const UNSAFE_TRANSFORM_TYPES = [
  'let', // +  ............ var to let/const
  'class', // +  .......... prototype assignments to class declaration
  'commonjs', // +  ....... CommonJS module loading to import/export
  'template', // +  ....... string concatenation to template string
  'default-param', // +  .. use of || to default parameters
  'destruct-param', // +  . use destructuring for objects in function parameters
  'includes', // +  ....... indexOf() != -1 to includes() (ES7)
];

const TRANSFORM_TYPES = [
  ...SAFE_TRANSFORM_TYPES,
  ...(APPLY_UNSAFE_TRANSFORMS ? UNSAFE_TRANSFORM_TYPES : []),
];

const runSerial = (works) => works.reduce((acc, run) => acc.then(() => run()), Promise.resolve()); // initial

const runCommand = (command, config) => {
  // const ls = spawn(command.split(' ')[0], command.split(' ').slice(1), config);
  // const args = parseArgsStringToArgv(command);
  // console.log(' Ar', args)
  // const cmd = args.shift();
  // const ls = spawn(cmd, args, config);
  const ls = exec(command, config)
  return new Promise((res) => {
    ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data.toString()}`);
    });

    ls.stderr.on('data', (data) => {
      console.log(`stderr: ${data.toString()}`);
    });

    ls.on('exit', (code) => {
      console.log(`child process exited with code ${code.toString()}`);
      res(' ');
    });
  });
};

async function runLebab() {
  // const {version} = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const works = TRANSFORM_TYPES.map((transformType) => () => {
    const command = `node bin/index.js --replace ${SRC_PATH} --transform ${transformType}`;
    console.log(`Transform: ${transformType}`);
    return runCommand(command, {cwd: process.cwd()});
  });
  await runSerial(works);
}

async function runTsMigrate() {
  const commands = [
    'tsc --init',
    'ts-migrate rename .',
    'ts-migrate migrate .',
  ];
  const works = commands.map((command) => () => runCommand(command, {cwd: SRC_PATH}));
  await runSerial(works);
}

async function runVisualizer() {
  const commands = [
    'depcruise --max-depth 2 --include-only \'^src\' --output-type dot src | dot -T svg > dependencygraph.svg',
    'madge --image madge-graph.svg src',
  ];
  console.log('Generating visualizations');
  console.log(' C', path.join(SRC_PATH, '..'));
  const works = commands.map((command) => () => runCommand(command, {cwd: path.join(SRC_PATH, '..')}));
  await runSerial(works);
}

async function asyncAwaitTask() {
  // await runLebab();
  // if (APPLY_TS_MIGRATE) {
  //   await runTsMigrate();
  // }
  if (RUN_VISUALIZER) {
    await runVisualizer();
  }
}

exports.default = asyncAwaitTask;
