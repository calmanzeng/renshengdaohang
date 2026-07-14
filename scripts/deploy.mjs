import { hre } from "hardhat";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const network = hre.network.name;
  console.log(`\n🔄 Deploying DestinySBT to ${network}...`);
  
  // Get the contract factory
  const DestinySBT = await hre.ethers.getContractFactory("DestinySBT");
  console.log("  Contract factory obtained");
  
  // Deploy
  const contract = await DestinySBT.deploy();
  console.log("  Transaction sent, waiting for deployment...");
  
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  
  console.log(`\n✅ DestinySBT deployed!`);
  console.log(`   Network: ${network} (Chain ID: ${chainId})`);
  console.log(`   Address: ${address}`);
  console.log(`   Explorer: https://testnet.monadexplorer.com/address/${address}`);
  
  // Save deployment info
  const deploymentsDir = join(project_root, "deployments");
  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentInfo = {
    network: network,
    chainId: Number(chainId),
    address: address,
    deployedAt: new Date().toISOString(),
    name: "DestinySBT",
    symbol: "DESTINY",
  };
  
  const filePath = join(deploymentsDir, `${network}.json`);
  writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n📝 Deployment info saved to: ${filePath}`);
  
  // Also update the frontend deployment config
  const frontendDeployPath = join(project_root, "lib", "contracts", "deployment.json");
  writeFileSync(frontendDeployPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📝 Frontend deployment config updated`);
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:", error);
  process.exitCode = 1;
});
