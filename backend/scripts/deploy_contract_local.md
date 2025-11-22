# How to compile & deploy ProjectRegistryOptimized locally (Hardhat)

1. Make sure your solidity contract file `contracts/ProjectRegistryOptimized.sol` exists in project root.
2. Install hardhat and necessary plugins (in project root):
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
3. Create hardhat.config.js / ts and configure network 'localhost' or default.
4. Compile:
   npx hardhat compile
5. Deploy using a script (example below):
   npx hardhat run scripts/deploy.ts --network localhost
6. Copy the deployed address into backend `.env` as CONTRACT_ADDRESS
