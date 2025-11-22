# BlueCarbon Backend (Project Registration)
Backend template for Project Registration: Express + ethers.js (v6) + nft.storage for IPFS.

## Quick start
1. Install dependencies
```
cd backend
npm install
```
2. Create `.env` from `.env.example` and fill values.
3. Compile your smart contract(s) with Hardhat so `artifacts/` exists:
```
npx hardhat compile
```
4. Start the backend:
```
node src/app.js
```
5. Use Postman to POST to `http://localhost:5000/api/project/register` (see README for sample body).

## Notes
- This template expects the contract artifact at `artifacts/contracts/ProjectRegistryOptimized.sol/ProjectRegistryOptimized.json` after compilation.
- NFT.Storage is used for free IPFS pinning.
- The backend holds the registrar private key and signs transactions. **Keep .env secret and do NOT commit it.**
