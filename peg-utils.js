var keyUtils = require('./key-utils');

var PegUtils = function(btcClient, rskClient) {
  this._btcClient = btcClient;
  this._rskClient = rskClient;
};

PegUtils.prototype.ensureAddressInRskWallet = function(address) {
  return this._btcClient.getPrivateKey(address).then(pk => ({
    btc: address,
    btcPK: pk,
    rsk: keyUtils.getRskAddress(pk),
    rskPK: keyUtils.privKeyToRskFormat(pk)
  })).then(keys => {
    return this._rskClient.eth.getAccounts().then(rskAddresses => {
      var result = Promise.resolve();
      var normalizedRskAddresses = rskAddresses.map(a => a.toLowerCase());
      if (!normalizedRskAddresses.includes(keys.rsk)) {
        result = this._rskClient.eth.personal.importRawKey(keys.rskPK, "").then((rskAddress) => {
          if (rskAddress !== keys.rsk) {
            return Promise.reject('Could not import private key into RSK wallet');
          }
    	  });
      }

      return result.then(() => ({
        btc: keys.btc,
        rsk: keys.rsk
      }))
    });
  });
};

PegUtils.prototype.generateNewAddress = function(account, type) {
	return this._btcClient.generateNewAddress(account, type).then((address) => {
    return this._btcClient.getPrivateKey(address).then(pk => {
      var rskAddress = keyUtils.getRskAddress(pk);
      return this.ensureAddressInRskWallet(address).then(() => {
        return {
          btc: address,
          rsk: rskAddress,
          inRSK: true
        }
      }).catch(() => {
        return Promise.resolve({
          btc: address,
          rsk: rskAddress,
          inRSK: false
        });
      });
    });
  });
};

PegUtils.prototype.getControlledAddresses = function(account) {
  return this._btcClient.getAddressesByAccount(account).then((btcAddresses) => {
		return Promise.all(btcAddresses.map(address => this._btcClient.getPrivateKey(address).then(pk => ({
			btc: address,
			rsk: keyUtils.getRskAddress(pk)
		}))));
	}).then(addresses => {
		return this._rskClient.eth.getAccounts().then(rskAddresses => {
      var normalizedRskAddresses = rskAddresses.map(a => a.toLowerCase());
      var rskAddressMap = rskAddresses.reduce((map, a) => {
        map[a.toLowerCase()] = a;
        return map;
      }, {});
      return addresses.map(address => ({
        btc: address.btc,
        rsk: rskAddressMap[address.rsk] || address.rsk,
        inRSK: normalizedRskAddresses.includes(address.rsk)
      }))
		});
	});
};

module.exports = {
  using: (btcClient, rskClient) => new PegUtils(btcClient, rskClient)
};
