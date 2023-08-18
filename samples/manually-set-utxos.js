const bitcoin = require('../index').bitcoin;
const config = require('./config.json');

// modify these parameters according to yout local environment configuration
const client = bitcoin.getClient(
    config.bitcoin.host, 
    config.bitcoin.user, 
    config.bitcoin.password, 
    bitcoin.networks[config.bitcoin.network]
);

(async () => {
    let source = await client.generateNewAddress();
    let destination = await client.generateNewAddress();
    let fundTxHash = await client.sendToAddress(source, bitcoin.btcToSatoshis(10));
    let destinationConfig = {};
    destinationConfig[destination] = bitcoin.btcToSatoshis(1);
    let fundTx = await client.getTransaction(fundTxHash);

    await client.sendFromTo(source, destinationConfig, 10000, 0, fundTx);

    await client.generate(1);

    console.log(`Is it working?: ${(await client.getAddressBalance(destination))[destination] == destinationConfig[destination] ? "Yes" : "No"}`);
})();




