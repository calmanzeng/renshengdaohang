const config = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    "monad-testnet": {
      type: "http",
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
    },
    monad: {
      type: "http",
      url: "https://rpc.monad.xyz",
      chainId: 143,
    },
  },
};

export default config;
