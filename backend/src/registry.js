import { Router } from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

import abi from '../../artifacts/contracts/ProjectRegistryOptimized.sol/ProjectRegistryOptimized.json' with { type: 'json' };


const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi.abi, wallet);

router.post('/register', async (req, res) => {
  try {
    const { projectID, registrationCID } = req.body;
    const tx = await contract.registerProjectByID(projectID, registrationCID);
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
