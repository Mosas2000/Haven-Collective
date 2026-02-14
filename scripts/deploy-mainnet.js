const { makeContractDeploy, broadcastTransaction, AnchorMode, PostConditionMode } = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
const { generateWallet } = require('@stacks/wallet-sdk');
const fs = require('fs');
const path = require('path');
const toml = require('toml');

// MAINNET CONFIGURATION
const network = new StacksMainnet();
const OPTIMIZED_FEE = 20000; // 0.02 STX per transaction - ultra low but still gets picked up
const WAIT_TIME = 45000; // 45 seconds between deployments

// Read mainnet mnemonic from Mainnet.toml
const mainnetTomlPath = path.join(__dirname, '..', 'settings', 'Mainnet.toml');
let MAINNET_MNEMONIC;

try {
  const mainnetTomlContent = fs.readFileSync(mainnetTomlPath, 'utf8');
  const config = toml.parse(mainnetTomlContent);
  MAINNET_MNEMONIC = config.accounts.deployer.mnemonic;
  
  if (!MAINNET_MNEMONIC || MAINNET_MNEMONIC === 'YOUR_MAINNET_MNEMONIC_HERE') {
    console.error('❌ ERROR: Update Mainnet.toml with your real mainnet mnemonic');
    console.error('   File: settings/Mainnet.toml');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ ERROR: Could not read Mainnet.toml');
  console.error('   Make sure settings/Mainnet.toml exists with your mnemonic');
  process.exit(1);
}

const getWallet = async () => {
  const wallet = await generateWallet({
    secretKey: MAINNET_MNEMONIC,
    password: ''
  });
  return wallet.accounts[0].stxPrivateKey;
};

const contracts = [
  'haven-traits',
  'haven-core',
  'haven-token',
  'haven-registry',
  'haven-mint',
  'haven-metadata',
  'haven-market',
  'haven-royalty',
  'haven-offers'
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const deployContract = async (contractName, senderKey) => {
  try {
    const contractPath = path.join(__dirname, '..', 'contracts', 'optimized', `${contractName}.clar`);
    const codeBody = fs.readFileSync(contractPath, 'utf8');
    
    console.log(`\n📄 Deploying ${contractName}...`);
    console.log(`   Size: ${codeBody.length} bytes`);
    console.log(`   Fee: ${OPTIMIZED_FEE} microSTX (${OPTIMIZED_FEE / 1000000} STX)`);
    
    const txOptions = {
      contractName,
      codeBody,
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: OPTIMIZED_FEE,
      postConditionMode: PostConditionMode.Allow
    };

    const transaction = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction(transaction, network);
    
    if (result.error) {
      console.log(`   ❌ Failed: ${result.error}`);
      console.log(`   Reason: ${result.reason || 'Unknown'}`);
      return { success: false, contract: contractName, error: result.error };
    } else {
      console.log(`   ✅ Success!`);
      console.log(`   TX: ${result.txid}`);
      console.log(`   View: https://explorer.hiro.so/txid/${result.txid}?chain=mainnet`);
      return { success: true, contract: contractName, txid: result.txid };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, contract: contractName, error: error.message };
  }
};

const checkMempoolSize = async () => {
  try {
    const response = await fetch('https://api.mainnet.hiro.so/extended/v1/tx/mempool');
    const data = await response.json();
    const size = data.total;
    console.log(`\n🌐 Mempool size: ${size} pending transactions`);
    
    if (size > 100) {
      console.log(`   ⚠️  Warning: Mempool is busy. Consider waiting for lower congestion.`);
      console.log(`   💡 Ideal mempool size: < 50 transactions`);
      return false;
    }
    return true;
  } catch (error) {
    console.log(`   ⚠️  Could not check mempool: ${error.message}`);
    return true; // Proceed anyway
  }
};

const estimateTotalCost = () => {
  const deploymentCost = contracts.length * (OPTIMIZED_FEE / 1000000);
  const buffer = deploymentCost * 0.2; // 20% buffer
  const total = deploymentCost + buffer;
  
  console.log(`\n💰 Cost Estimate:`);
  console.log(`   Deployments: ${contracts.length} contracts × ${OPTIMIZED_FEE / 1000000} STX = ${deploymentCost.toFixed(2)} STX`);
  console.log(`   Buffer (20%): ${buffer.toFixed(2)} STX`);
  console.log(`   Total: ~${total.toFixed(2)} STX`);
  console.log(`\n   At $1.00/STX: ~$${total.toFixed(2)} USD`);
  console.log(`   At $1.50/STX: ~$${(total * 1.5).toFixed(2)} USD`);
};

const deployAll = async () => {
  console.log('🚀 Haven Collective - Mainnet Deployment (Optimized)');
  console.log('='.repeat(70));
  
  estimateTotalCost();
  
  console.log(`\n⏰ Estimated time: ${(contracts.length * WAIT_TIME / 1000 / 60).toFixed(1)} minutes`);
  console.log(`\n⚠️  MAINNET DEPLOYMENT - REAL STX WILL BE SPENT!`);
  console.log(`\nPress Ctrl+C within 10 seconds to cancel...`);
  
  await sleep(10000);
  
  const mempoolOk = await checkMempoolSize();
  if (!mempoolOk) {
    console.log(`\n⏸️  Pausing 30 seconds for you to reconsider...`);
    await sleep(30000);
  }
  
  console.log(`\n🔥 Starting deployment...\n`);
  
  const senderKey = await getWallet();
  const results = [];
  let successCount = 0;
  let totalSpent = 0;
  
  for (let i = 0; i < contracts.length; i++) {
    const contractName = contracts[i];
    console.log(`\n[${i + 1}/${contracts.length}] ${contractName}`);
    
    const result = await deployContract(contractName, senderKey);
    results.push(result);
    
    if (result.success) {
      successCount++;
      totalSpent += (OPTIMIZED_FEE / 1000000);
    }
    
    if (i < contracts.length - 1) {
      console.log(`\n   ⏳ Waiting ${WAIT_TIME / 1000}s before next deployment...`);
      await sleep(WAIT_TIME);
    }
  }
  
  // Summary
  console.log('\n');
  console.log('='.repeat(70));
  console.log('📊 DEPLOYMENT SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n✅ Successful: ${successCount}/${contracts.length}`);
  console.log(`❌ Failed: ${contracts.length - successCount}/${contracts.length}`);
  console.log(`💸 Actual cost: ~${totalSpent.toFixed(3)} STX (+ bytecode costs)\n`);
  
  if (successCount === contracts.length) {
    console.log('🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!\n');
    console.log('📝 Next steps:');
    console.log('   1. Wait 5-10 minutes for all transactions to confirm');
    console.log('   2. Verify contracts on explorer.hiro.so');
    console.log('   3. Test core functions (create collection, mint, list)');
    console.log('   4. Set platform fees and authorize contracts');
  } else {
    console.log('⚠️  Some deployments failed. Review errors above.\n');
    console.log('Failed contracts:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.contract}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  
  // Save results
  const resultsPath = path.join(__dirname, '..', 'mainnet-deployment-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: mainnet-deployment-results.json\n`);
};

deployAll().catch(console.error);
