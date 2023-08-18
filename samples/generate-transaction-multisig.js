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
    let data = await client.generateMultisigAddress(null, 3, 2, "p2sh-segwit");
    let destination = await client.generateNewAddress();
    await client.sendToAddress(data.btc, bitcoin.btcToSatoshis(10));
    await client.generate(1);
    let destinationConfig = {};
    destinationConfig[destination] = bitcoin.btcToSatoshis(1);

    await client.sendFromMultisigTo(data, destinationConfig, 10000, 0);

    await client.generate(1);

    console.log(`Is it working?: ${(await client.getAddressBalance(destination))[destination] == destinationConfig[destination] ? "Yes" : "No"}`);
})();




