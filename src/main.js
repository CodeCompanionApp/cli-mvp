
import { exec } from 'mz/child_process';


const lineLength = 50,
    cardTop = '='.repeat(lineLength + 8);

(async function main() {
    printCard('WELCOME TO CODE COMPANION - JAVASCRIPT!');

    let n = Math.floor(Math.random() * 1000);
    printCard(`here's a random number: ${n}\nif it is even, then it will wait 3 secs`);

    if( !(n % 2) ) {
        printCard('waiting...');
        await waitPro(3000);
    }

    try {
        await exec('which node');
    }
    catch(e) {
        printCard(`you don't have lksjlefkj on your system`);
    }

    printCard('now that we have node.js...');

    console.log('executing', (await exec('node -p "3+4"'))[0]);

    printCard('all done!');
}());


function printCard(content = '') {
    const originalLines = content.split('\n'),
        lines = originalLines.reduce(function splitLongLines(acc, line) {
            if( line.length > lineLength ) {
                acc.push(line.substring(0, lineLength));
                acc.push(line.substring(lineLength));
            }
            else {
                acc.push(line);
            }
            return acc;
        }, []),
        formattedLines = lines.map(function addBorder(line) {
            return '=== ' + line.padEnd(lineLength, ' ') + ' ===';
        });

    console.log('');
    console.log(cardTop);
    formattedLines.forEach(function print(line) {
        console.log(line);
    })
    console.log(cardTop);
    console.log('');
}


function waitPro(n = 1000) {
    return new Promise(function pro(resolve, reject) {
        setTimeout(resolve, n);
    });
}

