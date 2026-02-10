const { makeContractDeploy, broadcastTransaction, AnchorMode } = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
const fs = require('fs');
require('dotenv').config();

const deployContract = async (contractName, contractFile, network, senderKey) => {
  const codeBody = fs.readFileSync(contractFile, 'utf8');
  
  const txOptions = {
    contractName,
    codeBody,
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractDeploy(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  return broadcastResponse;
};

const deployAll = async () => {
  const isMainnet = process.env.NETWORK === 'mainnet';
  const network = isMainnet ? new StacksMainnet() : new StacksTestnet();
  const senderKey = process.env.PRIVATE_KEY;

  if (!senderKey) {
    console.error('Error: PRIVATE_KEY not set in environment');
    process.exit(1);
  }

  const contracts = [
    { name: 'haven-core', file: './contracts/haven-core.clar' },
    { name: 'haven-token', file: './contracts/haven-token.clar' },
    { name: 'haven-registry', file: './contracts/haven-registry.clar' },
    { name: 'haven-mint', file: './contracts/haven-mint.clar' },
    { name: 'haven-metadata', file: './contracts/haven-metadata.clar' },
    { name: 'haven-market', file: './contracts/haven-market.clar' },
    { name: 'haven-royalty', file: './contracts/haven-royalty.clar' },
    { name: 'haven-offers', file: './contracts/haven-offers.clar' },
    { name: 'haven-traits', file: './contracts/haven-traits.clar' },
  ];

  console.log(`Deploying to ${isMainnet ? 'mainnet' : 'testnet'}...`);
  console.log(`Total contracts: ${contracts.length}\n`);

  const results = [];
  
  for (const contract of contracts) {
    try {
      console.log(`Deploying ${contract.name}...`);
      const result = await deployContract(contract.name, contract.file, network, senderKey);
      
      if (result.error) {
        console.error(`Failed to deploy ${contract.name}: ${result.error}`);
        results.push({ contract: contract.name, status: 'failed', error: result.error });
      } else {
        console.log(`${contract.name} deployed: ${result.txid}`);
        results.push({ contract: contract.name, status: 'success', txid: result.txid });
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error deploying ${contract.name}:`, error.message);
      results.push({ contract: contract.name, status: 'error', error: error.message });
    }
  }

  console.log('\n--- Deployment Summary ---');
  results.forEach(result => {
    const status = result.status === 'success' ? '✓' : '✗';
    console.log(`${status} ${result.contract}: ${result.status === 'success' ? result.txid : result.error}`);
  });

  const successful = results.filter(r => r.status === 'success').length;
  console.log(`\nTotal: ${successful}/${contracts.length} contracts deployed successfully`);
};

deployAll().catch(console.error);
