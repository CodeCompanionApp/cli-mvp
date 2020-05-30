
import { exec } from 'mz/child_process';
import { promises as fspromises } from 'fs';
import inquirer from 'inquirer';
import { join as pathJoin } from 'path';

const { readdir, mkdir } = fspromises;

const cardLineLength = 50,
    cardHorizontalBorder = '='.repeat(cardLineLength + 8);

(async function main() {

    const testFolderPath = await testFolderInit();

    const usernameQuestion = {
            type: 'input',
            name: 'username',
            message: 'What is your name?',
            default: 'js learner',
        },
        username = await inquirer.prompt(usernameQuestion);

    console.log('username', username);
    printCard(`WELCOME TO CODE COMPANION - JAVASCRIPT,\n${username.username}!`);

    let n = Math.floor(Math.random() * 1000);
    printCard(`here's a random number: ${n}\nif it is even, then it will wait 3 secs`);

    if( !(n % 2) ) {
        printCard('waiting...');
        await waitPro(3000);
    }

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

    printCard(`I created a folder at\n${testFolderPath}.\n\nWith the aid of your code editor, add a file in that folder called main.js`);

    //printCard('now that we have node.js...');

    //console.log('executing', (await exec('node -p "3+4"'))[0]);

    console.log('dir', await readdir(testFolderPath));

    printCard('all done!');
}());

async function testFolderInit() {
    const basename = pathJoin(__dirname, '..', 'learning');
    //TODO: if folder exists, either resume program from what is complete, or create new folder plus number
    await mkdir(basename, {recursive: true});
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
            return '=== ' + line.padEnd(cardLineLength, ' ') + ' ===';
        });

    console.log('');
    console.log(cardHorizontalBorder);
    formattedLines.forEach(function print(line) {
        console.log(line);
    })
    console.log(cardHorizontalBorder);
    console.log('');
}


function waitPro(n = 1000) {
    return new Promise(function pro(resolve, reject) {
        setTimeout(resolve, n);
    });
}

