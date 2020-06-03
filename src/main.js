
import { exec } from 'mz/child_process';
import { promises as fspromises } from 'fs';
import inquirer from 'inquirer';
import { join as pathJoin } from 'path';

const { readdir, mkdir, stat, unlink } = fspromises;

const cardLineLength = 100,
    cardUpperBorder = '▛' + '▀'.repeat(cardLineLength + 2) + '▜',
    cardLowerBorder = '▙' + '▄'.repeat(cardLineLength + 2) + '▟';

(async function main() {

    const testFolderPath = await testFolderInit();

    const usernameQuestion = {
            type: 'input',
            name: 'username',
            message: 'What is your name?',
            default: 'js learner',
        },
        username = await inquirer.prompt(usernameQuestion);

    printCard(`WELCOME TO CODE COMPANION - JAVASCRIPT,\n${username.username}!`);

    await pauseForAnyKey();

    try {
        console.log('Searching for node...');
        await waitPro(1000);
        await exec('which node');
    }
    catch(e) {
        let ready = false,
            checks = 0;
        printCard(`You don't have node on your system - please install\n\nOne way is to go to https://nodejs.org/en/ and download the "current" version, or go to https://nodejs.org/en/download/ and follow the directions`);
        while(!ready) {
            try {
                if( checks === 300 ) {// waiting for longer than five minutes
                    //TODO
                    printCard(`Are you having difficulty?`);
                }
                await exec('which node');
                ready = true;
            }
            catch(e) {
                //console.error('error', e.message || e);
                checks += 1;
                await waitPro(1000);
            }
        }
    }

    await pauseForAnyKey('Great! It seems that node is correctly installed on your computer!\n\nPress any key to continue', true);

    const mainjs = pathJoin(testFolderPath, 'main.js');

    printCard(`I created a folder at\n${testFolderPath}.\n\nWith the aid of your code editor, add a file in that folder called main.js\n(it can be empty for now, just make sure to save it)`);

    let fileCreated = false;
    while( !fileCreated ) {
        try {
            const dets = await stat(mainjs);
            fileCreated = dets.ctimeMs;
        }
        catch(e) {
            await waitPro(1000);
        }
    }

    let fileLastModified = fileCreated;

    printCard('Excellent!\nNow type in the following:\n\nconsole.log("Hello, world!");\n\nand save the file');

    await waitForFileChange(mainjs);

    let correctOutput = false;
    while( !correctOutput ) {
        try {
            const result = (await exec(`node ${mainjs}`))[0].trim();
            printCard(`Your program's output:\n\n${result}`);
            correctOutput = result === 'Hello, world!';

            if( !correctOutput ) {
                printCard(`The output of the program doesn't match "Hello, world!"\nModify your js file so that it matches exactly:\n\nconsole.log("Hello, world!");\n\nand save the file again.`);
                await waitForFileChange(mainjs);
            }
        }
        catch(e) {
            console.error('error in execution', e.message || e);
            await waitForFileChange(mainjs);
        }
    }

    printCard(`Well done, ${username.username}!`);
    process.exit();
}());

async function waitForFileChange(path) {
    const before = Date.now();
    let modified = 0;
    while( modified <= before ) {
        try {
            await waitPro(1000);
            const dets = await stat(path);
            modified = dets.ctimeMs;
        }
        catch(e) {
            // pass
        }
    }
}

async function testFolderInit() {
    const basename = pathJoin(__dirname, '..', 'learning');
    //TODO: if folder exists, either resume program from what is complete, or create new folder plus number
    try {
        await mkdir(basename);
    }
    catch(e) {
        //TEMP: delete file
        try {
            await unlink(pathJoin(basename, 'main.js'));
        }
        catch(e) {
            //console.error('error', e.message || e);
        }
    }
    return basename;
}

function printCard(content = '') {
    const originalLines = content.split('\n'),
        lines = originalLines.reduce(function splitLongLines(acc, line) {
            if( line.length > cardLineLength ) {
                acc.push(line.substring(0, cardLineLength));
                acc.push(line.substring(cardLineLength));
            }
            else {
                acc.push(line);
            }
            return acc;
        }, []),
        formattedLines = lines.map(function addBorder(line) {
            return '▌ ' + line.padEnd(cardLineLength, ' ') + ' ▐';
        });

    console.log('');
    console.log(cardUpperBorder);
    formattedLines.forEach(function print(line) {
        console.log(line);
    })
    console.log(cardLowerBorder);
    console.log('');
}

function pauseForAnyKey(message = 'Press any key to continue', card = false) {
    return new Promise(function pro(resolve, reject) {
        if( card ) {
            printCard(message);
        }
        else {
            console.log(message);
        }

        process.stdin.setRawMode = true;
        process.stdin.resume();
        process.stdin.once('data', function () {
            process.stdin.setRawMode = false;
            resolve();
        });
    });
}

function waitPro(n = 1000) {
    return new Promise(function pro(resolve, reject) {
        setTimeout(resolve, n);
    });
}

