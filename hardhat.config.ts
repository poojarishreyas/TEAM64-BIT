import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const AMOY_RPC_URL = process.env.AMOY_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""; // keep empty if not using amoy

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    // Enable this ONLY if you have correct PRIVATE_KEY + RPC_URL
    ...(AMOY_RPC_URL && PRIVATE_KEY
      ? {
          amoy: {
            url: AMOY_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 80002,
          },
        }
      : {}),
  },
};

export default config;
