const lineReader = require('n-readlines');

function* my_it(filename) {
    let idx = 0;
    let arr = [];
    const liner = new lineReader(`./dataset/${filename}`);
    let line;
    while (line = liner.next()) {
        arr.push(line.toString('utf8'));
        idx++;
        if (idx === 99) {
            yield arr;
            arr = [];
            idx = 0;
        }
    }
    if (arr.length !== 0) {
        yield arr;
    }
}

for (const lines of my_it('slice')) {
    console.log(lines);
}