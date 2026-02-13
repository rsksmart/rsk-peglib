const { Web3 } = require('web3');
const bitcoin = require('./bitcoin');
const bridge = require('./bridge');
const utils = require('./utils');


const getClient = (server) => {
  if(!server.startsWith('http') && !server.startsWith('https')){
    server = 'http://' + server;
  }

  const client = new Web3(server);

  // Custom RPC via requestManager (web3 v4: no callback-based currentProvider.send)
  client.evm = {
    //This is because in regtest the RSK node doesn't increase block time
    mine: async () => {
      await client.requestManager.send({
        method: 'evm_increaseTime',
        params: [1],
      });
      return client.requestManager.send({
        method: 'evm_mine',
        params: [],
      });
    }
  };

  // web3 v4: eth.extend() not implemented; add RSK-specific personal methods via requestManager
  if (!client.eth.personal) client.eth.personal = {};
  client.eth.personal.newAccountWithSeed = (seed) => {
    return client.requestManager.send({
      method: 'personal_newAccountWithSeed',
      params: [seed],
    });
  };
  // Always use our wrapper so passphrase defaults to '' and RSK RPC is used (used by peg-utils)
  client.eth.personal.importRawKey = (key, passphrase) => {
    return client.requestManager.send({
      method: 'personal_importRawKey',
      params: [key, passphrase || ''],
    });
  };

  // web3 v4: use requestManager instead of client.extend() for custom RPC
  client.fed = {
    updateBridge: () => {
      return client.requestManager.send({
        method: 'fed_updateBridge',
        params: [],
      });
    }
  };

  client.eth.bridgeState = () => {
    return client.requestManager.send({
      method: 'eth_bridgeState',
      params: [],
    });
  };

  client.rsk = {
    bridge: bridge.buildBrige(client),
    sendTx: sendTx.bind(client),
    getWhiteListAddresses: getWhiteListAddresses.bind(client),
    getFederatorsPublicKeys: getFederatorsPublicKeys.bind(client),//Deprecated after Wasabi
    getPendingFederatorsPublicKeys: getPendingFederatorsPublicKeys.bind(client), //Deprecated after Wasabi
    getRetiringFederatorsPublicKeys: getRetiringFederatorsPublicKeys.bind(client), //Deprecated after Wasabi
    getFederatorsPublicMultiKeys: getFederatorsPublicMultiKeys.bind(client),
    getPendingFederatorsPublicMultiKeys: getPendingFederatorsPublicMultiKeys.bind(client), 
    getRetiringFederatorsPublicMultiKeys: getRetiringFederatorsPublicMultiKeys.bind(client),
    getNonce: getNonce.bind(client),
    getGasPrice: getGasPrice.bind(client),
    utils: {
      publicKeyToAddress: (pk) => {
        // Pk needs to be the uncompressed public key as a hex string,
        // either with or without a leading '0x'
        var pubKey = pk;

        var index = 2;
        if (pk.substr(0,2) === '0x') {
          index = 4;
        }
        pubKey = pubKey.substr(index);

        return '0x' + client.utils.keccak256(`0x${pubKey}`).substr(26);
      },
    },
  }

  return client;
};

var getWhiteListAddresses = async function getWhiteListAddresses() {
  var size = await this.rsk.bridge.methods.getLockWhitelistSize().call();
  if(size == 0){
    return [];
  }
  var getWhitelistedAddress = [];
  for(i=0; i < size; i++){
    getWhitelistedAddress[i] = await this.rsk.bridge.methods.getLockWhitelistAddress(i).call();
  }
  return getWhitelistedAddress
};

//Deprecated after Wasabi
var getFederatorsPublicKeys = async function getFederatorsPublicKeys() {
  var federatorsPublicKeysPromise=[];
  var size = await this.rsk.bridge.methods.getFederationSize().call();
  
  for(i=0; i < size; i++){
    federatorsPublicKeysPromise[i] = this.rsk.bridge.methods.getFederatorPublicKey(i).call();
  }
  return await Promise.all(federatorsPublicKeysPromise);
};

var getFederatorsPublicMultiKeys = async function getFederatorsPublicMultiKeys() {
  var federatorsPublicKeys=[];
  var size = await this.rsk.bridge.methods.getFederationSize().call();
  
  for(i=0; i < size; i++){
    federatorsPublicKeys[i] = {}
    federatorsPublicKeys[i].btc = await this.rsk.bridge.methods.getFederatorPublicKeyOfType(i,'btc').call();
    federatorsPublicKeys[i].rsk = await this.rsk.bridge.methods.getFederatorPublicKeyOfType(i,'rsk').call();
    federatorsPublicKeys[i].mst = await this.rsk.bridge.methods.getFederatorPublicKeyOfType(i,'mst').call();
  }
  return { size:size, 
    list:federatorsPublicKeys 
  };
};

//Deprecated after Wasabi
var getPendingFederatorsPublicKeys = async function getPendingFederatorsPublicKeys() {
  var federatorsPublicKeysPromise=[];
  var size = await this.rsk.bridge.methods.getPendingFederationSize().call();
  
  for(i=0; i < size; i++){
    federatorsPublicKeysPromise[i] = this.rsk.bridge.methods.getPendingFederatorPublicKey(i).call();
  }
  return await Promise.all(federatorsPublicKeysPromise);
};

var getPendingFederatorsPublicMultiKeys = async function getPendingFederatorsPublicMultiKeys() {
  var federatorsPublicKeys=[];
  var size = await this.rsk.bridge.methods.getPendingFederationSize().call();
  
  for(i=0; i < size; i++){
    federatorsPublicKeys[i] = {}
    federatorsPublicKeys[i].btc = await this.rsk.bridge.methods.getPendingFederatorPublicKeyOfType(i,'btc').call();
    federatorsPublicKeys[i].rsk = await this.rsk.bridge.methods.getPendingFederatorPublicKeyOfType(i,'rsk').call();
    federatorsPublicKeys[i].mst = await this.rsk.bridge.methods.getPendingFederatorPublicKeyOfType(i,'mst').call();
  }
  return { size:size, 
    list:federatorsPublicKeys 
  };
};

//Deprecated after Wasabi
var getRetiringFederatorsPublicKeys = async function getRetiringFederatorsPublicKeys() {
  var federatorsPublicKeysPromise=[];
  var size = await this.rsk.bridge.methods.getRetiringFederationSize().call();
  
  for(i=0; i < size; i++){
    federatorsPublicKeysPromise[i] = this.rsk.bridge.methods.getRetiringFederatorPublicKeys(i).call();
  }
  return await Promise.all(federatorsPublicKeysPromise);
};

var getRetiringFederatorsPublicMultiKeys = async function getRetiringFederatorsPublicMultiKeys() {
  var federatorsPublicKeys=[];
  var size = await this.rsk.bridge.methods.getRetiringFederationSize().call();
  
  for(i=0; i < size; i++){
    federatorsPublicKeys[i] = {}
    federatorsPublicKeys[i].btc = await this.rsk.bridge.methods.getRetiringFederatorPublicKeyOfType(i,'btc').call();
    federatorsPublicKeys[i].rsk = await this.rsk.bridge.methods.getRetiringFederatorPublicKeyOfType(i,'rsk').call();
    federatorsPublicKeys[i].mst = await this.rsk.bridge.methods.getRetiringFederatorPublicKeyOfType(i,'mst').call();
  }
  return { size:size, 
    list:federatorsPublicKeys 
  };
};

var getNonce = async function getNonce(address) {
  // web3 v4: use instance utils; getTransactionCount returns BigInt
  var result = await this.eth.getTransactionCount(this.utils.toChecksumAddress(address), "pending");
  if (typeof result === 'bigint') {
    if (result > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error('Nonce is too large to be represented as a number');
    }
    return Number(result);
  }
  return Number(result);
};

var getGasPrice = async function getGasPrice() {
  var block = await this.eth.getBlock("latest");
  // web3 v4: block numeric fields (e.g. minimumGasPrice) can be BigInt
  var minGasPrice = block && block.minimumGasPrice != null ? Number(block.minimumGasPrice) : 0;
  if (minGasPrice <= 1) {
    return 1;
  }
  return Math.ceil(minGasPrice * 101n / 100n);
}

var sendTx = function(tx, mine, pollInterval = 500, maxAttempts = 120) {
  mine = mine || (() => Promise.resolve());

  var sendResult = this.eth.sendTransaction(tx);
  sendResult.catch(() => {});

  var check = (txHash, success) => {
    return mine().then(() => this.eth.getTransactionReceipt(txHash).then((receipt) => {
      if (receipt != null) {
        success(receipt);
      }
    }));
  };

  return new Promise((resolve, reject) => {
    sendResult.once('transactionHash', (txHash) => {
      var clear;
      var resolved;
      var success = (receipt) => {
        clear();
        resolve(receipt);
        resolved = true;
      }
      var done = () => {
        if (!resolved) {
          reject(`Max attempts at getting tx receipt for tx ${txHash} exceeded`);
        }
      }
      clear = utils.interval(() => check(txHash, success), pollInterval, maxAttempts, done);
    });
  });
};

var SATOSHI_IN_WEIS = Math.pow(10, 10);
var BTC_IN_SATOSHIS = Math.pow(10, 8);
var BTC_IN_WEIS = BTC_IN_SATOSHIS * SATOSHI_IN_WEIS;

var btcToWeis = (amount) => Math.floor(amount * BTC_IN_WEIS);
var weisToBtc = (amount) => Number(bitcoin.btcToString(amount / BTC_IN_WEIS));
var satoshisToBtc = (amount) => Number(bitcoin.btcToString(amount / BTC_IN_SATOSHIS));
var satoshisToWeis = (amount) => Math.floor(amount * SATOSHI_IN_WEIS);
var weisToSatoshis = (amount) => Number(bitcoin.btcToString(amount / SATOSHI_IN_WEIS));

module.exports = {
  getClient: getClient,
  getBridgeAddress: () => bridge.ADDRESS,
  getBridgeAbi: () => bridge.abi,
  btcToWeis: btcToWeis,
  weisToBtc: weisToBtc,
  satoshisToWeis: satoshisToWeis,
  weisToSatoshis: weisToSatoshis,
  satoshisToBtc: satoshisToBtc
};
