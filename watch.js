const util = require('util');
const fs = require('fs');
const mkdirp = require('mkdirp');

const chalk = require('chalk');
const chokidar = require('chokidar');

const rollup = require('rollup');

const exec = util.promisify(require('child_process').exec);

const log = console.log;

let rollupCache;

const config = {
    src: './src', // Source files to be watched

    generateBundle: true, // You can skip bundling
    bundleFormat: 'umd', // 'amd', 'cjs', 'es', 'iife', 'umd'
    bundleDir: './bundle', // Bundle write dir
    bundleFile: 'bundle.js' // Bundle file name
};

const watcher = chokidar.watch(config.src, {
    ignoreInitial: true
});

watcher
    .on('all', (event, path) => {
        console.log(`${event}: ${path}`);
        compile()
            .catch(e => {
                console.error(chalk.red(e));
            });
    });

async function compile() {
    let command = 'node_modules/.bin/tsc';
    try {
        let start = new Date();
        console.log(chalk.green(`${getPrettyTime()}\nCompiling TS...`));
        await exec(command);
        console.log(chalk.green(`Compiled in ${(new Date() - start) / 1000} secs`));

        if (!config.generateBundle) return;

        console.log(chalk.green('Launching rollup...'));
        start = new Date();
        let bundle = await rollup.rollup({
            entry: './dist/app.js',
            cache: rollupCache
        });

        let result = bundle.generate({
            format: config.bundleFormat
        });

        rollupCache = bundle;
        mkdirp.sync(config.bundleDir);
        fs.writeFileSync(config.bundleFile, result.code);
        console.log(chalk.green(`Rolled up in ${(new Date() - start) / 1000} secs\n---`));

    } catch (e) {
        throw new Error(e.stdout);
    }
}

function getPrettyTime() {
    let time = new Date();

    let hours = time.getHours();
    let minutes = time.getMinutes();
    let seconds = time.getSeconds();

    function pad(n) {
        n = parseInt(n);
        return n > 9 ? n : '0' + n;
    }

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

log(chalk.blue('Watching for changes'));
