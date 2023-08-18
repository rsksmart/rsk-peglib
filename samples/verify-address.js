const bitcoin = require('../index').bitcoin;
const config = require('./config.json');
const expect = require('chai').expect;

const client = bitcoin.getClient(
    config.bitcoin.host, 
    config.bitcoin.user, 
    config.bitcoin.password, 
    bitcoin.networks[config.bitcoin.network]
);

(async () => {
    let address = 'mim9yonpNo7Bpau5GJRueJ5zYGPRNVKp4C';

    console.log(`Will test using ${address}. Once you run this test, you have to reset the node or use a different address or this will fail.`);

    let response = await client.isAddressInWallet(address);
    expect(response).to.be.false;

    await client.importAddress(address, undefined, false);
    response = await client.isAddressInWallet(address);
    expect(response).to.be.true;

    address = await client.generateNewAddress();
    response = await client.isAddressInWallet(address);
    expect(response).to.be.true;

    console.log('OK!')
})();