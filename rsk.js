var Web3 = require('web3');
var bitcoin = require('./bitcoin');
var bridge = require('./bridge');
var utils = require('./utils');


var getClient = function(server) {
  if(!server.startsWith('http') && !server.startsWith('https')){
    server = 'http://' + server;
  }

  var client = new Web3(server);

  client.evm = {
    //This is because in regtest the RSK node doesn't increase block time
    mine : function increaseTime () {
      var duration = 1;
      const id = Date.now();
    
      return new Promise((resolve, reject) => {
        client.currentProvider.send({
          jsonrpc: '2.0',
          method: 'evm_increaseTime',
          params: [duration],
          id: id,
        }, err1 => {
          if (err1) return reject(err1);
    
          client.currentProvider.send({
            jsonrpc: '2.0',
            method: 'evm_mine',
            id: id + 1,
          }, (err2, res) => {
            return err2 ? reject(err2) : resolve(res);
          });
        });
      });
    }
  };

  client.eth.extend({
    property: 'personal',
    methods: [{
      name: 'newAccountWithSeed',
      call: 'personal_newAccountWithSeed',
      params: 1
    }]
  });

  client.extend({
    property: 'fed',
    methods: [{
      name: 'updateBridge',
      call: 'fed_updateBridge',
      params: 0
    }]
  });

  client.extend({
    property: 'eth',
    methods: [({
      name: 'bridgeState',
      call: 'eth_bridgeState',
      params: 0
    })]
  });

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

var getNonce =  async function getNonce(address){
  var result = await this.eth.getTransactionCount(Web3.utils.toChecksumAddress(address), "pending");
  return result;
}

var getGasPrice = async function getGasPrice() {
  var block = await this.eth.getBlock("latest");
  if (block.minimumGasPrice <= 1) {
    return 1;
  } else {
    return block.minimumGasPrice * 1.01;
  }
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
