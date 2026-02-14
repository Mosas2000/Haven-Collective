const { makeContractDeploy, broadcastTransaction, AnchorMode, makeSTXTokenTransfer, PostConditionMode } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { generateWallet, generateSecretKey, getStxAddress } = require('@stacks/wallet-sdk');
const fs = require('fs');

const deployContract = async (contractName, contractFile, network, senderKey) => {
  try {
    const codeBody = fs.readFileSync(contractFile, 'utf8');
    
    const txOptions = {
      contractName,
      codeBody,
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 200000,
      postConditionMode: PostConditionMode.Allow
    };

    console.log(`Creating transaction for ${contractName}...`);
    const transaction = await makeContractDeploy(txOptions);
    
    console.log(`Broadcasting ${contractName}...`);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    return broadcastResponse;
  } catch (error) {
    return { error: error.message };
  }
};

const deployMissingContracts = async () => {
  const network = new StacksTestnet();
  
  // Mnemonic from Testnet.toml
  const mnemonic = 'bread shift morning sense clean interest humor oven kick fox vintage december oxygen zebra shed guess toast rebuild attract panda early satisfy climb refuse';
  
  // Generate wallet and get private key
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: ''
  });
  
  const account = wallet.accounts[0];
  const senderKey = account.stxPrivateKey;
  const address = getStxAddress({ account, transactionVersion: 0x80 }); // Testnet
  
  console.log(`Deployer address: ${address}`);
  console.log(`Network: Testnet\n`);

  const contracts = [
    { name: 'haven-market', file: './contracts/haven-market.clar' },
    { name: 'haven-metadata', file: './contracts/haven-metadata.clar' },
    { name: 'haven-offers', file: './contracts/haven-offers.clar' },
  ];

  console.log(`Deploying ${contracts.length} missing contracts...\n`);

  for (const contract of contracts) {
    console.log(`\n=== Deploying ${contract.name} ===`);
    const result = await deployContract(contract.name, contract.file, network, senderKey);
    
    if (result.error) {
      console.error(`❌ Failed: ${result.error}`);
      if (result.reason) console.error(`   Reason: ${result.reason}`);
    } else if (result.txid) {
      console.log(`✓ Transaction ID: ${result.txid}`);
      console.log(`  View: https://explorer.hiro.so/txid/${result.txid}?chain=testnet`);
    } else {
      console.log(`Response:`, JSON.stringify(result, null, 2));
    }
    
    // Wait between deployments
    console.log('Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('\n=== Deployment Complete ===');
};

deployMissingContracts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
