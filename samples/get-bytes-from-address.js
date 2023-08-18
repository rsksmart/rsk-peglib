const bitcoin = require('../index').bitcoin;
const bitcoinJs = require('bitcoinjs-lib');
const expect = require('chai').expect;

(() => {
    let address = '2MuhbXKRVAiuz7DqTEtiDumNy4cEcFPMVff';
    let bytes = bitcoin.addresses.decodeBase58Address(address);
    expect(bytes).to.equal("00c41aed0b0bf7f9d6b598dc9fe994d46697d5591a29");

    let bufData = Buffer.from(bytes, 'hex');
    let bufVersion = Buffer.alloc(2);
    bufData.copy(bufVersion, 0, 0, 2);

    let bufHash = Buffer.alloc(20);
    bufData.copy(bufHash, 0, 2, 22);

    let regeneratedAddress = bitcoinJs.address.toBase58Check(bufHash, bufVersion.readUInt16BE(0));
    expect(regeneratedAddress).to.equal(address);

    console.log('OK!');
})();
