import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const projectRegistry = await ethers.deployContract("ProjectRegistryOptimized", [deployer.address]);
  await projectRegistry.waitForDeployment();
  console.log(`ProjectRegistryOptimized deployed to: ${projectRegistry.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});