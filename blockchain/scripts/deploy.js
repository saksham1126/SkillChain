const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying SkillChain smart contract to local network...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from account:", deployer.address);

  const SkillChain = await ethers.getContractFactory("SkillChain");
  const skillChain = await SkillChain.deploy();
  await skillChain.waitForDeployment();

  const contractAddress = await skillChain.getAddress();
  console.log("SkillChain successfully deployed to:", contractAddress);

  // Extract ABI from artifacts
  const artifactPath = path.join(
    __dirname,
    "../artifacts/blockchain/contracts/SkillChain.sol/SkillChain.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Save config for frontend
  const configDir = path.join(__dirname, "../../src");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const contractConfig = {
    address: contractAddress,
    network: "localhost",
    chainId: 31337,
    abi: artifact.abi,
  };

  fs.writeFileSync(
    path.join(configDir, "contractConfig.json"),
    JSON.stringify(contractConfig, null, 2)
  );

  console.log("Contract configuration saved to src/contractConfig.json");
  console.log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
