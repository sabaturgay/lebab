// const fs = require('fs');
const {exec, spawn} = require('child_process');

const FILE_PATH = '/Users/turgaysaba/Desktop/projects/debt-service/src';
const FOLDER_PATH = '/Users/turgaysaba/Desktop/projects/debt-service';
const APPLY_ONLY_SAFE_TRANSFORMS = false;
const APPLY_TS_MIGRATE = true;
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
  ...(APPLY_ONLY_SAFE_TRANSFORMS ? [] : UNSAFE_TRANSFORM_TYPES),
];

const runSerial = (works) => works.reduce((acc, run) => acc.then(() => run()), Promise.resolve()); // initial

const runCommand = (command) => {
  const ls = spawn(command.split(' ')[0], command.split(' ').slice(1));

  ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data.toString()}`);
  });

  ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data.toString()}`);
  });

  ls.on('exit', (code) => {
    console.log(`child process exited with code ${code.toString()}`);
  });
};
async function runLebab() {
  // const {version} = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const works = TRANSFORM_TYPES.map((transformType) => () => {
    const command = `node bin/index.js --replace ${FILE_PATH} --transform ${transformType}`;
    console.log(transformType);
    return runCommand(command);
  });
  await runSerial(works);
  // await Promise.all(
  //   )
  // );
  // await Promise.resolve('some result');
}

async function runTsMigrate() {
  // const {version} = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const commands = [
    `cd ${FOLDER_PATH}`,
    // 'ts-migrate init .',
    'ts-migrate rename .',
    'ts-migrate migrate .',
    // 'eslint --fix',
  ];
  const works = commands.map((command) => () => {
    console.log(' A', command);
    runCommand(command);
  });
  await runSerial(works);
  // await Promise.all(
  //   )
  // );
  // await Promise.resolve('some result');
}
async function asyncAwaitTask() {
  await runLebab();
  if (APPLY_TS_MIGRATE) {
    await runTsMigrate();
  }
}

exports.default = asyncAwaitTask;
