// const fs_pr = require('fs').promises;
const fs = require('fs').promises;

async function write_to_file(path, data) {
}

async function main() {
    await fs.writeFile('./output/test', `${JSON.stringify([0, 1])}\n`, { encoding: 'utf-8', flag: 'a' });
}

main();