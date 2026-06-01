const chalk = require('chalk');

module.exports = {
  main: (text) => console.log(chalk.green(`[ SERVER ] `) + text),
  error: (text) => console.log(chalk.red(`[ ERROR ] `) + text),
  warn: (text) => console.log(chalk.yellow(`[ WARN ] `) + text),
  info: (text) => console.log(chalk.blue(`[ INFO ] `) + text)
};

