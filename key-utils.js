var bs58 = require('bs58');
var wallet = require('ethereumjs-wallet');

var keyBtcToRskInBytes = function(btcPK) {
    var decodedKey = bs58.decode(btcPK);
    var privKeyBytes = decodedKey.slice(1, decodedKey.length - 5);
    return privKeyBytes;
};

var privKeyToRskFormat = function(btcPK) {
    var privKeyBytes = keyBtcToRskInBytes(btcPK);
    var privKeyInRskFormat = new Buffer(privKeyBytes).toString('hex');
    return privKeyInRskFormat;
};

var getRskAddress = function(btcPK) {
    var myWallet = wallet.fromPrivateKey(new Buffer(keyBtcToRskInBytes(btcPK)));
    var addressInRskFormat = myWallet.getAddress();
    return `0x${addressInRskFormat.toString('hex')}`;
};

var getRskAddressFromRskPublicKey = function(rskPublicKey) {
    var myWallet = wallet.fromPublicKey(Buffer.from(rskPublicKey,'hex'));
    var addressInRskFormat = myWallet.getAddress();
    return `0x${addressInRskFormat.toString('hex')}`;
};

module.exports = {
    keyBtcToRskInBytes: keyBtcToRskInBytes,
    privKeyToRskFormat: privKeyToRskFormat,
    getRskAddress: getRskAddress,
    getRskAddressFromRskPublicKey: getRskAddressFromRskPublicKey
}
