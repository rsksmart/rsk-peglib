const bitcoin = require('../index').bitcoin;
const config = require('./config.json');
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

// modify these parameters according to yout local environment configuration
const client = bitcoin.getClient(
    config.bitcoin.host, 
    config.bitcoin.user, 
    config.bitcoin.password, 
    bitcoin.networks[config.bitcoin.network]
);

(async () => {
  let response = await promisefy(client._client.cmd.bind(client._client), ['getnetworkinfo']);
  console.log(`Success => ${response.hasOwnProperty('version')?'yes':'no'}`);
})();