const bitcoin = require('../index').bitcoin;
const config = require('./config.json');
const assert = require('assert');

// modify these parameters according to yout local environment configuration
const client = bitcoin.getClient(
    config.bitcoin.host, 
    config.bitcoin.user, 
    config.bitcoin.password, 
    bitcoin.networks[config.bitcoin.network]
);

(async () => {
    let blockHash = await client.generate(1);
    let response = await client.getBlockHeader(blockHash[0], false);
    assert.equal(response.length, 160);
    console.log('OK!');
})();
