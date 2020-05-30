
import tape from 'tape';
import _test from 'tape-promise';

const tapetest = _test(tape);


tapetest('test', async function testProgram(t) {
    t.pass('empty test file');
    t.end();
});


