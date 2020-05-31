
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
        printCard('Searching for node...');
        await exec('which node');
    }
    catch(e) {
        printCard(`you don't have node on your system -\nplease install`);
        let ready = false;
        while(!ready) {
            let goAhead = false;
            const readyOrNotQuestion = {
                    type: 'confirm',
                    name: 'goNoGo',
                    message: 'Confirm when you are ready to continue',
                },
                readyOrNot = await inquirer.prompt(readyOrNotQuestion);
            if( readyOrNot.goNoGo ) {
                console.log('it is a yes');
            }
            else {
                console.log('it is a no');
                //TODO
            }
            try {
                await exec('which node');
                ready = true;
            }
            catch(e) {
                console.error('error', e.message || e);
            }
        }
    }

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

    while( fileLastModified === fileCreated ) {
        await waitPro(1000);
        const dets = await stat(mainjs);
        fileLastModified = dets.ctimeMs;
    }

    let correctOutput = false;
    while( !correctOutput ) {
        try {
            const result = (await exec(`node ${mainjs}`))[0].trim();
            correctOutput = result === 'Hello, world!';

            if( !correctOutput ) {
                printCard(`The output of the program doesn't match "Hello, world!"\nModify your js file so that it matches exactly:\n\nconsole.log("Hello, world!");\n\nand save the file again.`);
                const tryAgain = fileLastModified;
                while( fileLastModified === tryAgain ) {
                    await waitPro(1000);
                    const dets = await stat(mainjs);
                    fileLastModified = dets.ctimeMs;
                }
            }
        }
        catch(e) {
            console.error('error in execution', e.message || e);
            const tryAgain = fileLastModified;
            while( fileLastModified === tryAgain ) {
                await waitPro(1000);
                const dets = await stat(mainjs);
                fileLastModified = dets.ctimeMs;
            }
        }
    }

    printCard(`Well done, ${username.username}!`);
    process.exit();
}());

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

function pauseForAnyKey() {
    return new Promise(function pro(resolve, reject) {
        console.log('Press any key to continue');

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

