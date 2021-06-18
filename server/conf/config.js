const fs = require('fs');

const server_config = JSON.parse(fs.readFileSync(`${__dirname}/server_config.json`, { encoding: 'utf8' }));

console.log(server_config);

module.exports = server_config;