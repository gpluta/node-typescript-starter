const util = require('util');
const chalk = require('chalk');
const chokidar = require('chokidar');

const exec = util.promisify(require('child_process').exec);

const log = console.log;
const SRC = './src';

const watcher = chokidar.watch(SRC, {
    ignoreInitial: true
});

watcher
    .on('all', (event, path) => {
        console.log(`${event}: ${path}`);
        compileTypescript()
            .catch(e => {
                console.log(chalk.red(e));
            });
    });

async function compileTypescript() {
    let command = 'node_modules/.bin/tsc';
    try {
        let start = new Date();
        console.log(chalk.green('Compiling...'));
        await exec(command);
        console.log(chalk.green(`Compiled in ${(new Date() - start) / 1000} secs`));
    } catch (e) {
        throw new Error(e.stdout);
    }
}

log(chalk.blue('Watching for changes'));
