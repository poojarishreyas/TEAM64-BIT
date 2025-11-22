import fs from 'fs/promises';
import path from 'path';
import { wallet } from '../config/blockchain.js';
import { ethers } from 'ethers';

const artifactsPath = path.join(process.cwd(), '..', 'artifacts', 'contracts', 'ProjectRegistryOptimized.sol', 'ProjectRegistryOptimized.json');

let cachedContract = null;
export const getContract = async () => {
  if (cachedContract) return cachedContract;
  const raw = await fs.readFile(artifactsPath, 'utf8');
  const json = JSON.parse(raw);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, json.abi, wallet);
  cachedContract = contract;
  return contract;
};

export const getContractAddress = () => process.env.CONTRACT_ADDRESS || null;

export const registerProjectOnChain = async (projectID, cid) => {
  const contract = await getContract();
  // Use registerProjectByID for simplicity (convenient but costs hashing on-chain).
  const tx = await contract.registerProjectByID(projectID, cid);
  const receipt = await tx.wait();
  return receipt.transactionHash;
};
