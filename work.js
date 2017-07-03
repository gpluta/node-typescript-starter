const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const log = console.log;

async function compileTypescript() {
    let command = 'node_modules/.bin/tsc';
    try {
        await exec(command);
    } catch (e) {
        throw new Error(e.stdout);
    }
}

fs.watch(path.normalize('./src'), (eventType, filename) => {
    log(chalk.blue(`${chalk.green(filename)} was ${eventType}'d`));
    compileTypescript()
        .catch(e => {
            log(chalk.red(e))
        });
});

log(chalk.blue('Watching for changes'));