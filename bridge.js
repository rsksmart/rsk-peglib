const ADDRESS = "0x0000000000000000000000000000000001000006";

var abi = [{
  name: "getBtcBlockchainBestChainHeight",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int"
  }]
}, {
  name: "getStateForDebugging",
  type: "function",
  constant: "true",
  inputs: [],
  outputs: [{
    name: "",
    type: "bytes"
  }]
}, {
  name: "getBtcBlockchainInitialBlockHeight",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int"
  }]
}, {
  name: "getBtcBlockchainBlockHashAtDepth",
  type: "function",
  constant: true,
  inputs: [{
    name: "depth",
    type: "int256"
  }],
  outputs: [{
    name: "",
    type: "bytes"
  }],
}, {
  name: "getBtcTxHashProcessedHeight",
  type: "function",
  constant: true,
  inputs: [{
    name: "hash",
    type: "string"
  }],
  outputs: [{
    name: "",
    type: "int64"
  }]
}, {
  name: "isBtcTxHashAlreadyProcessed",
  type: "function",
  constant: true,
  inputs: [{
    name: "hash",
    type: "string"
  }],
  outputs: [{
    name: "",
    type: "bool"
  }]
}, {
  name: "getFederationAddress",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "string"
  }]
}, {
  name: "registerBtcTransaction",
  type: "function",
  constant: true,
  inputs: [{
    name: "tx",
    type: "bytes"
  }, {
    name: "height",
    type: "int256"
  }, {
    name: "pmt",
    type: "bytes"
  }],
  outputs: []
}, {
  name: "addSignature",
  type: "function",
  constant: true,
  inputs: [{
    name: "pubkey",
    type: "bytes"
  }, {
    name: "signatures",
    type: "bytes[]"
  }, {
    name: "txhash",
    type: "bytes"
  }],
  outputs: []
}, {
  name: "receiveHeaders",
  type: "function",
  constant: true,
  inputs: [{
    name: "blocks",
    type: "bytes[]"
  }],
  outputs: []
}, {
  name: "receiveHeader",
  type: "function",
  constant: true,
  inputs: [{
    name: "block",
    type: "bytes"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
},
{
  name: "getFederationSize",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getFederationThreshold",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getFederatorPublicKey",
  type: "function",
  constant: true,
  inputs: [{
    name: "index",
    type: "int256"
  }],
  outputs: [{
    name: "",
    type: "bytes"
  }]
}, {
  name: "getFederatorPublicKeyOfType",
  type: "function",
  constant: true,
  inputs: [{
    name: "index",
    type: "int256"
  }, {
    name: "type",
    type: "string"
  }],
  outputs: [{
    name: "",
    type: "bytes"
  }]
}, {
  name: "getFederationCreationTime",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getFederationCreationBlockNumber",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getRetiringFederationAddress",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "string"
  }]
}, {
  name: "getRetiringFederationSize",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getRetiringFederationThreshold",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getRetiringFederatorPublicKey",
  type: "function",
  constant: true,
  inputs: [{
    name: "index",
    type: "int256"
  }],
  outputs: [{
    name: "",
    type: "bytes"
  }]
}, {
  name: "getRetiringFederatorPublicKeyOfType",
  type: "function",
  constant: true,
  inputs: [{
    name: "index",
    type: "int256"
  }, {
    name: "type",
    type: "string"
  }],
  outputs: [{
    name: "",
    type: "bytes"
  }]
}, {
  name: "getRetiringFederationCreationTime",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getRetiringFederationCreationBlockNumber",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "createFederation",
  type: "function",
  constant: false,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "addFederatorPublicKey",
  type: "function",
  constant: false,
  inputs: [{
    name: "key",
    type: "bytes"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "addFederatorPublicKeyMultikey",
  type: "function",
  constant: false,
  inputs: [{
    name: "btcKey",
    type: "bytes"
  }, {
    name: "rskKey",
    type: "bytes"
  }, {
    name: "mstKey",
    type: "bytes"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "commitFederation",
  type: "function",
  constant: false,
  inputs: [{
    name: "hash",
    type: "bytes"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "rollbackFederation",
  type: "function",
  constant: false,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getPendingFederationHash",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "bytes"
  }]
}, {
  name: "getPendingFederationSize",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getPendingFederatorPublicKey",
  type: "function",
  constant: true,
  inputs: [{
    name: "index",
    type: "int256"
  }],
  outputs: [{
    name: "",
    type: "bytes"
  }]
}, {
  name: "getPendingFederatorPublicKeyOfType",
  type: "function",
  constant: true,
  inputs: [{
    name: "index",
    type: "int256"
  }, {
    name: "type",
    type: "string"
  }],
  outputs: [{
    name: "",
    type: "bytes"
  }]
}, {
  name: "getLockWhitelistSize",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getLockWhitelistAddress",
  type: "function",
  constant: true,
  inputs: [{
    name: "index",
    type: "int256"
  }],
  outputs: [{
    name: "",
    type: "string"
  }]
}, {
  // This method is available since RFS-170 fork activation
  name: "getLockWhitelistEntryByAddress",
  type: "function",
  constant: true,
  inputs: [{
    name: "address",
    type: "string"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  // This method is deprecated since RFS-170 fork activation
  name: "addLockWhitelistAddress",
  type: "function",
  constant: false,
  inputs: [{
    name: "address",
    type: "string"
  },{
    name: "maxTransferValue",
    type: "int256"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  // This method is available since RFS-170 fork activation
  name: "addOneOffLockWhitelistAddress",
  type: "function",
  constant: false,
  inputs: [{
    name: "address",
    type: "string"
  },{
    name: "maxTransferValue",
    type: "int256"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  // This method is available since RFS-170 fork activation
  name: "addUnlimitedLockWhitelistAddress",
  type: "function",
  constant: false,
  inputs: [{
    name: "address",
    type: "string"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "removeLockWhitelistAddress",
  type: "function",
  constant: false,
  inputs: [{
    name: "address",
    type: "string"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "setLockWhitelistDisableBlockDelay",
  type: "function",
  constant: false,
  inputs: [{
    name: "disableDelay",
    type: "int256"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getFeePerKb",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "voteFeePerKbChange",
  type: "function",
  constant: false,
  inputs: [{
    name: "feePerKb",
    type: "int256"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "updateCollections",
  type: "function",
  constant: false,
  inputs: [],
  outputs: []
}, {
  name: "getMinimumLockTxValue",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getBtcTransactionConfirmations",
  type: "function",
  constant: true,
  inputs: [{
    name: "txHash",
    type: "bytes32"
  }, {
    name: "blockHash",
    type: "bytes32"
  }, {
    name: "merkleBranchPath",
    type: "uint256"
  }, {
    name: "merkleBranchHashes",
    type: "bytes32[]"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "getLockingCap",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "int256"
  }]
}, {
  name: "increaseLockingCap",
  type: "function",
  constant: true,
  inputs:[{
    name: "newLockingCap",
    type: "int256"
  }],
  outputs: [{
    name: "",
    type: "bool"
  }]
},
{
  name: "registerBtcCoinbaseTransaction",
  type: "function",
  constant: true,
  inputs:[{
    name: "btcTxSerialized",
    type: "bytes"
  }, {
    name: "blockHash",
    type: "bytes32"
  },
  {
    name: "pmtSerialized",
    type: "bytes"
  }, {
    name: "witnessMerkleRoot",
    type: "bytes32"
  }, {
    name: "witnessReservedValue",
    type: "bytes32"
  }],
  outputs: []
},
{
  name: "hasBtcBlockCoinbaseTransactionInformation",
  type: "function",
  constant: true,
  inputs:[{
    name: "blockHash",
    type: "bytes32"
  }],
  outputs: [{
    name: "",
    type: "bool"
  }]
},
{
  name: "registerFastBridgeBtcTransaction",
  type: "function",
  constant: true,
  inputs: [{
    name: "btcTxSerialized",
    type: "bytes"
  }, {
    name: "height",
    type: "uint256"
  }, {
    name: "pmtSerialized",
    type: "bytes"
  }, {
    name: "derivationArgumentsHash",
    type: "bytes32"
  }, {
    name: "userRefundBtcAddress",
    type: "bytes"
  }, {
    name: "liquidityBridgeContractAddress",
    type: "address"
  }, {
    name: "liquidityProviderBtcAddress",
    type: "bytes"
  }, {
    name: "shouldTransferToContract",
    type: "bool"
  }],
  outputs: [{
    name: "",
    type: "int256"
  }]
},
{
  name: "getStateForBtcReleaseClient",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "bytes"
  }]
},
{
  name: "getNextPegoutCreationBlockNumber",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "uint256"
  }]
},
{
  name: "getQueuedPegoutsCount",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "uint256"
  }]
},
{
  name: "getEstimatedFeesForNextPegOutEvent",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "uint256"
  }]
},
{
  name: "getActivePowpegRedeemScript",
  type: "function",
  constant: true,
  inputs: [],
  outputs: [{
    name: "",
    type: "bytes"
  }]
},
{
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "receiver",
      type: "address"
    },
    {
      indexed: false,
      name: "btcTxHash",
      type: "bytes32"
    },
    {
      indexed: false,
      name: "senderBtcAddress",
      type: "string"
    },
    {
      indexed: false,
      name: "amount",
      type: "int256"
    }
  ],
  name: "lock_btc",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: false,
      name: "sender",
      type: "address"
    }
  ],
  name: "update_collections",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "releaseRskTxHash",
      type: "bytes32"
    },
    {
      indexed: true,
      name: "federatorRskAddress",
      type: "address"
    },
    {
      indexed: false,
      name: "federatorBtcPublicKey",
      type: "bytes"
    }
  ],
  name: "add_signature",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "releaseRskTxHash",
      type: "bytes32"
    },
    {
      indexed: false,
      name: "btcRawTransaction",
      type: "bytes"
    }
  ],
  name: "release_btc",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: false,
      name: "oldFederationBtcPublicKeys",
      type: "bytes"
    },
    {
      indexed: false,
      name: "oldFederationBtcAddress",
      type: "string"
    },
    {
      indexed: false,
      name: "newFederationBtcPublicKeys",
      type: "bytes"
    },
    {
      indexed: false,
      name: "newFederationBtcAddress",
      type: "string"
    },
    {
      indexed: false,
      name: "activationHeight",
      type: "int256"
    }
  ],
  name: "commit_federation",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "rskTxHash",
      type: "bytes32"
    },
    {
      indexed: true,
      name: "btcTxHash",
      type: "bytes32"
    },
    {
      indexed: false,
      name: "amount",
      type: "uint256"
    }
  ],
  name: "release_requested",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "sender",
      type: "address"
    },
    {
      indexed: false,
      name: "btcDestinationAddress",
      type: "bytes",
    },
    {
      indexed: false,
      name: "amount",
      type: "uint256"
    }
  ],
  name: "release_request_received",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "sender",
      type: "address"
    },
    {
      indexed: false,
      name: "amount",
      type: "uint256"
    },
    {
      indexed: false,
      name: "reason",
      type: "int256"
    }
  ],
  name: "release_request_rejected",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "receiver",
      type: "address"
    },
    {
      indexed: true,
      name: "btcTxHash",
      type: "bytes32"
    },
    {
      indexed: false,
      name: "amount",
      type: "int256"
    },
    {
      indexed: false,
      name: "protocolVersion",
      type: "int256"
    }
  ],
  name: "pegin_btc",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "btcTxHash",
      type: "bytes32"
    },
    {
      indexed: false,
      name: "reason",
      type: "int256"
    }
  ],
  name: "rejected_pegin",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "btcTxHash",
      type: "bytes32"
    },
    {
      indexed: false,
      name: "reason",
      type: "int256"
    }
  ],
  name: "unrefundable_pegin",
  type: "event"
},
{
  anonymous: false,
  inputs: [
    {
      indexed: true,
      name: "btcTxHash",
      type: "bytes32"
    },
    {
      indexed: false,
      name: "releaseRskTxHashes",
      type: "bytes"
    }
  ],
  name: "batch_pegout_created",
  type: "event"
}];

var buildBrige = function(client) {
  return new client.eth.Contract(abi, ADDRESS);
};

module.exports = {
  abi: abi,
  buildBrige: buildBrige,
  ADDRESS: ADDRESS
}
