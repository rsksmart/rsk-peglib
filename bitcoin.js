const bitcoin = require('bitcoin');
const bitcoinLib = require('bitcoinjs-lib');

const BTC_IN_SATOSHIS = Math.pow(10, 8);
const BTC_MAX_DECIMAL = 8;
const DEFAULT_BITCOIN_HOST = "localhost";
const DEFAULT_BITCOIN_PORT = 18443;

const btcToString = (amount) => amount.toFixed(BTC_MAX_DECIMAL);
const btcToSatoshis = (amount) => Math.round(amount * BTC_IN_SATOSHIS);
const satoshisToBtc = (amount) => Number(btcToString(amount / BTC_IN_SATOSHIS));

// Convert bitcoin-client-callback-styled function results into promises
var promisefy = function(f, args) {
  args = args || [];
  return new Promise(function(resolve, reject) {
    var callback = function(error, result) {
      if (error) {
          reject(error);
          return;
      }
      resolve(result);
    }
    var finalArgs = args.concat(callback);
    f.apply(null, finalArgs);
  });
};

var getBuilderFor = function(inputs, outputs, network) {
  var tx = new bitcoinLib.TransactionBuilder(network);

  inputs.forEach(input => tx.addInput(input.txid, input.vout));
  outputs.forEach(output => tx.addOutput(output.address, output.amount));

  return tx;
}

var buildRawIncompleteTransaction = function(inputs, outputs, network) {
  return getBuilderFor(inputs, outputs, network).buildIncomplete().toHex();
};

let decodeBase58Address = (address) => {
    let decodedAddress = bitcoinLib.address.fromBase58Check(address);
    let bufferVersion = Buffer.allocUnsafe(1);
    bufferVersion.writeUInt8(decodedAddress.version);
    return Buffer.concat([bufferVersion, decodedAddress.hash]).toString('hex');
}

var Client = function(server, username, password, network) {
  var parts = server.split(':');
  var host = parts[0] || DEFAULT_BITCOIN_HOST;
  var port = parts[1] || DEFAULT_BITCOIN_PORT;
  this._client = new bitcoin.Client({
      host: host,
      port: port,
      user: username,
      pass: password
  });
  this.network = network || bitcoinLib.networks.bitcoin;
};

Client.prototype.getVersion = function() {
  return promisefy(this._client.getNetworkInfo.bind(this._client)).then((response) => response.version);
};

Client.prototype.getBlock = async function(blockHash, jsonEncoded) {
  jsonEncoded = jsonEncoded != null ? jsonEncoded : true;
  if (!blockHash) {
    throw new Error('Block hash is required');
  }
  return promisefy(this._client.getBlock.bind(this._client), [blockHash, jsonEncoded]);
}

Client.prototype.getBlockCount = async function() {
  return promisefy(this._client.getBlockCount.bind(this._client), []);
}

Client.prototype.getBlockByHeight = async function(blockHeight) {
  return promisefy(this._client.getBlockHash.bind(this._client), [blockHeight])
    .then((blockHash) => this.getBlock(blockHash));
};

Client.prototype.getLatestBlock = async function() {
  return this.getBlockCount()
    .then((height) => this.getBlockByHeight(height));
};

Client.prototype.getBlockHeader = async function(blockHash, jsonEncoded) {
    jsonEncoded = jsonEncoded != null ? jsonEncoded : true;
    if (!blockHash) {
        throw new Error('Block hash is required');
    }
    return promisefy(this._client.cmd.bind(this._client), ['getblockheader', blockHash, jsonEncoded]);
};

Client.prototype.generateNewAddress = async function(account, type) {
  type = type || 'legacy';
  const version = await this.getVersion();
    if (version < 160000) {
      throw new Error('Version minor than 0.16 is not allowed');
    } else {
      return promisefy(this._client.getNewAddress.bind(this._client), [account, type]);
    }
};

Client.prototype.generateMultisigAddress = async function(account, signerSize, requiredSigners, type) {
  signerSize = signerSize || 3;
  requiredSigners = requiredSigners || 2;
  type = type || 'legacy';
  var addresses = [];

  if (signerSize < requiredSigners) {
    throw new Error("Total amount of signers can not be smaller than signers amount");
  }

  // Generate addresses that will form the multisig addresses
  for(i=0; i<signerSize; i++){
    addresses[i] = await this.generateNewAddress(account);
  }

  // Create multisg object
  var multisig = await promisefy(this._client.addMultiSigAddress.bind(this._client), [requiredSigners, addresses, null, type]);
  
  return {
    btc: multisig.address, 
    rsk: null,
    info: {
      type: 'multisig',
      members: addresses,
      redeemScript: multisig.redeemScript
    }
  };
};

Client.prototype.getPrivateKey = function(address) {
  return promisefy(this._client.dumpPrivKey.bind(this._client), [address]);
};

Client.prototype.getAddressesByAccount = function(account) {
  return promisefy(this._client.getAddressesByAccount.bind(this._client), [account]);
};

// address can be both an address string or an array of addresses (e.g., in the account use case)
Client.prototype.getUnspentForAddress = function(address, minConfirmations) {
  var addresses = Array.isArray(address) ? address : [address];
  return promisefy(this._client.listUnspent.bind(this._client), []).then((utxos) => {
    return utxos.filter(utxo => addresses.includes(utxo.address) && utxo.confirmations >= (minConfirmations || 0));
  }).then(filteredUtxos => filteredUtxos.map(utxo => ({
    ...utxo,
    amount: btcToSatoshis(utxo.amount)
  })));
};

Client.prototype.getUnspentForAccount = function(account, minConfirmations) {
  return this.getAddressesByAccount(account).then(addresses => this.getUnspentForAddress(addresses, minConfirmations));
};

Client.prototype.generate = function(amount) {
  return promisefy(this._client.generate.bind(this._client), [amount]);
};

Client.prototype.sendToAddress = function(address, amount) {
  return promisefy(this._client.sendToAddress.bind(this._client), [address, satoshisToBtc(amount)]);
};

// address can be both an address string or an array of addresses (e.g., in the account use case)
Client.prototype.selectSpendableUTXOsFromAddress = function(address, amount, minConfirmations) {
  return this.getUnspentForAddress(address, minConfirmations).then(utxos => {
    var selected = [];
    var accumulated = 0;
    var i = 0;
    while (accumulated < amount && i < utxos.length) {
      selected.push(utxos[i]);
      accumulated += utxos[i].amount;
      i += 1;
    }

    return {
      utxos: selected,
      change: accumulated - amount
    }
  });
};

Client.prototype.selectSpendableUTXOsFromAccount = function(account, amount, minConfirmations) {
  return this.getAddressesByAccount(account).then(addresses => this.selectSpendableUTXOsFromAddress(addresses, amount, minConfirmations));
};

// sourceAddress can be both an address string or an array of addresses (e.g., in the account use case)
// destinationAddresses can be both a map from addresses to amount (in satoshis)
// or an array of maps, each with keys 'address' and 'amount'
// this allows for creation of txs with more than 1 output to the same address
Client.prototype.buildTxSendFromTo = function(sourceAddress, destinationAddresses, txFee, minConfirmations, fundingTx) {
  const getTxInfo = async (utxos, change, outputs) => {
    let inputs = utxos.map(utxo => ({
      txid: utxo.txid,
      vout: utxo.vout
    }));
    let actualChange = change - txFee;
    if (actualChange > 0) {
      let changeAddress = Array.isArray(sourceAddress) ? sourceAddress[0] : sourceAddress;
      outputs.push({
        address: changeAddress,
        amount: actualChange
      });
    }
    let result = {
      tx: buildRawIncompleteTransaction(inputs, outputs, this.network),
      prevTxs: utxos // includes all the UTXOs to spend with this TX
    };

    return result;
  }

  var outputs = destinationAddresses;
  if (!Array.isArray(outputs)) {
    outputs = Object.keys(destinationAddresses).map((address) => ({
      address: address,
      amount: destinationAddresses[address]
    }));
  }
  var totalAmount = outputs.reduce((total, output) => total + output.amount, 0);
  if (fundingTx) {
    let utxos = this.extractSpendableUtxosFromTxOutputForAddress(fundingTx, sourceAddress);
    let change = utxos.map((u) => u.amount).reduce((accum, current) => accum + current) - totalAmount;
    return getTxInfo(utxos, change, outputs);
  }
  return this.selectSpendableUTXOsFromAddress(sourceAddress, totalAmount, minConfirmations)
    .then(selection => getTxInfo(selection.utxos, selection.change, outputs));
};

Client.prototype.dumpPrivKey = function(address) {
  return promisefy(this._client.dumpPrivKey.bind(this._client), [address]);
};

// tx the transaction to sign
// sourceAddress can be both an address string or an array of addresses (e.g., for multiple input UTXOs)
Client.prototype.signRawTransaction = async function(tx, sourceAddress, prevTxs) {
  prevTxs = prevTxs || [];
  var sourceAddresses = Array.isArray(sourceAddress) ? sourceAddress : [sourceAddress];
  let pks = await Promise.all(sourceAddresses.map(address => this.dumpPrivKey(address)));
  const version = await this.getVersion();
  if (version < 180000) {
    // Pre 0.18 we should use signRawTransaction
    let signed = await promisefy(this._client.signRawTransaction.bind(this._client), [tx, prevTxs, pks]);
    return {
      tx: signed.hex,
      complete: signed.complete
    };
  } else {
    // from 0.18 we should use signRawTransactionWithKey
    // as the dependency doesn't support it. Extend the messages to call the new method
    let signed = await promisefy(this._client.cmd.bind(this._client), ['signrawtransactionwithkey', tx, pks, prevTxs]);
    return {
      tx: signed.hex,
      complete: signed.complete
    };
  }
};

Client.prototype.sendRawTransaction = function(tx) {
  return promisefy(this._client.sendRawTransaction.bind(this._client), [tx]);
};

Client.prototype.sendFromTo = function(sourceAddress, destinationAddresses, txFee, minConfirmations, fundingTx) {
  return this.buildTxSendFromTo(sourceAddress, destinationAddresses, txFee, minConfirmations, fundingTx)
    .then((txInfo) => this.signRawTransaction(txInfo.tx, sourceAddress))
    .then((signed) => this.sendRawTransaction(signed.tx));
};

Client.prototype.sendFromMultisigTo = function(sourceAddress, destinationAddresses, txFee, minConfirmations, fundingTx) {
  return this.buildTxSendFromTo(sourceAddress.btc, destinationAddresses, txFee, minConfirmations, fundingTx)
    .then((txInfo) => {
      let prevTxs = txInfo.prevTxs.map(output => ({
        txid: output.txid,
        vout: output.vout,
        scriptPubKey: output.scriptPubKey,
        redeemScript: sourceAddress.info.redeemScript,
        amount: satoshisToBtc(output.amount)
      }));
      return this.signRawTransaction(txInfo.tx, sourceAddress.info.members, prevTxs);
    })
    .then((signed) => this.sendRawTransaction(signed.tx))
};

// address can be both an address string or an array of addresses (e.g., for multiple input UTXOs)
// balances are given in satoshis
Client.prototype.getAddressBalance = function(address, minConfirmations) {
  return this.getUnspentForAddress(address, minConfirmations).then(utxos => {
    var balances = utxos.reduce((balances, utxo) => {
      balances[utxo.address] = balances[utxo.address] || 0;
      balances[utxo.address] += utxo.amount;
      return balances;
    }, {});

    return balances;
  });
};

Client.prototype.getTransactionInfo = function(txId) {
  return promisefy(this._client.getTransaction.bind(this._client), [txId]);
};

Client.prototype.getTransaction = function(txId) {
  return promisefy(this._client.getRawTransaction.bind(this._client), [txId]).then(txHex => {
    return promisefy(this._client.decodeRawTransaction.bind(this._client), [txHex]);
  });
};

Client.prototype.getRawTransaction = function(txId) {
  return promisefy(this._client.getRawTransaction.bind(this._client), [txId]);
}

Client.prototype.importAddress = function(address, account, rescan) {
  return promisefy(this._client.importAddress.bind(this._client), [address, account, rescan]);
};

Client.prototype.isAddressInWallet = async function (address) {
  let info = await promisefy(this._client.cmd.bind(this._client), ['getaddressinfo', address]);
  // isMine is for owned addresses
  // isWatchOnly is for imported addresses
  return info.ismine || info.iswatchonly;
};

Client.prototype.getUtxo = function(txid, n) {
  return promisefy(this._client.getTxOut.bind(this._client), [txid, n]);
};

Client.prototype.extractSpendableUtxosFromTxOutputForAddress = (tx, addresses) => {
  return tx.vout
    .filter((output) => output.scriptPubKey.addresses.some((addr) => addresses.includes(addr)))
    .map((output) => ({
      txid: tx.txid,
      vout: output.n,
      address: output.scriptPubKey.addresses[0],
      scriptPubKey: output.scriptPubKey.hex,
      amount: btcToSatoshis(output.value)
    }));
};

/** Public keys are hex strings, either compressed or uncompressed **/
var createMultisigAddress = function(threshold, publicKeysHex, network) {
  var publicKeys = publicKeysHex.map(function (hex) { return Buffer.from(hex, 'hex') });

  var redeemScript = bitcoinLib.script.multisig.output.encode(threshold, publicKeys);
  var scriptPubKey = bitcoinLib.script.scriptHash.output.encode(bitcoinLib.crypto.hash160(redeemScript));
  return bitcoinLib.address.fromOutputScript(scriptPubKey, network);
};

/** Public key is a hex string, either compressed or uncompressed **/
var publicKeyToCompressedOrUncompressed = function(compressed) {
  return function(publicKeyHex) {
    var key = bitcoinLib.ECPair.fromPublicKeyBuffer(Buffer.from(publicKeyHex, 'hex'));
    key.compressed = compressed;
    return key.getPublicKeyBuffer().toString('hex');
  };
};

module.exports = {
  getClient: (server, username, password, network) => new Client(server, username, password, network),
  btcToString: btcToString,
  btcToSatoshis: btcToSatoshis,
  satoshisToBtc: satoshisToBtc,
  raw: {
    buildRawIncompleteTransaction: buildRawIncompleteTransaction,
    getBuilderFor: getBuilderFor,
    ECPair: bitcoinLib.ECPair,
  },
  networks: bitcoinLib.networks,
  addresses: {
    createMultisigAddress: createMultisigAddress,
    decodeBase58Address: decodeBase58Address
  },
  keys: {
    publicKeyToCompressed: publicKeyToCompressedOrUncompressed(true),
    publicKeyToUncompressed: publicKeyToCompressedOrUncompressed(false),
  },
};
