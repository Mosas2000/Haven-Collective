const { makeContractDeploy, broadcastTransaction, AnchorMode, PostConditionMode } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { generateWallet } = require('@stacks/wallet-sdk');
const fs = require('fs');
const path = require('path');

// TESTNET CONFIGURATION
const network = new StacksTestnet();
const OPTIMIZED_FEE = 20000; // 0.02 STX - testing the low fee
const WAIT_TIME = 30000; // 30 seconds between deployments

// Use the mnemonic from Testnet.toml
const TESTNET_MNEMONIC = 'glue into gate this better involve alarm beyond dance control heavy party penalty avoid affair memory idle horror exotic slam odor caught ocean host';

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

const getWallet = async () => {
  const wallet = await generateWallet({
    secretKey: TESTNET_MNEMONIC,
    password: ''
  });
  return wallet.accounts[0].stxPrivateKey;
};

const deployContract = async (contractName, senderKey) => {
  try {
    const contractPath = path.join(__dirname, '..', 'contracts', 'optimized', `${contractName}.clar`);
    const codeBody = fs.readFileSync(contractPath, 'utf8');
    
    console.log(`\n📄 Deploying ${contractName}...`);
    console.log(`   Size: ${codeBody.length} bytes (vs original: ${getOriginalSize(contractName)} bytes)`);
    console.log(`   Savings: ${((1 - codeBody.length / getOriginalSize(contractName)) * 100).toFixed(1)}%`);
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
      console.log(`   View: https://explorer.hiro.so/txid/${result.txid}?chain=testnet`);
      return { success: true, contract: contractName, txid: result.txid };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, contract: contractName, error: error.message };
  }
};

const getOriginalSize = (contractName) => {
  try {
    const originalPath = path.join(__dirname, '..', 'contracts', `${contractName}.clar`);
    const originalCode = fs.readFileSync(originalPath, 'utf8');
    return originalCode.length;
  } catch {
    return 0;
  }
};

const estimateTotalCost = () => {
  const deploymentCost = contracts.length * (OPTIMIZED_FEE / 1000000);
  
  // Calculate actual bytecode sizes
  let totalBytes = 0;
  contracts.forEach(contract => {
    try {
      const contractPath = path.join(__dirname, '..', 'contracts', 'optimized', `${contract}.clar`);
      const code = fs.readFileSync(contractPath, 'utf8');
      totalBytes += code.length;
    } catch (error) {
      console.log(`Warning: Could not read ${contract}`);
    }
  });
  
  // Rough estimate: ~0.0005 STX per byte on testnet
  const bytecodeCost = (totalBytes * 0.0005) / 1000;
  const total = deploymentCost + bytecodeCost;
  
  console.log(`\n💰 Cost Estimate (Testnet):`);
  console.log(`   Deployment fees: ${contracts.length} contracts × ${OPTIMIZED_FEE / 1000000} STX = ${deploymentCost.toFixed(3)} STX`);
  console.log(`   Bytecode cost:   ${totalBytes.toLocaleString()} bytes × ~0.0005 STX/KB ≈ ${bytecodeCost.toFixed(3)} STX`);
  console.log(`   ─────────────────────────────────────────`);
  console.log(`   Total estimate:  ~${total.toFixed(3)} STX`);
  
  return total;
};

const verifyContracts = async () => {
  console.log('\n🔍 Verifying optimized contracts exist...');
  let allExist = true;
  
  for (const contract of contracts) {
    const contractPath = path.join(__dirname, '..', 'contracts', 'optimized', `${contract}.clar`);
    if (!fs.existsSync(contractPath)) {
      console.log(`   ❌ Missing: ${contract}.clar`);
      allExist = false;
    } else {
      const size = fs.statSync(contractPath).size;
      console.log(`   ✓ ${contract}.clar (${size} bytes)`);
    }
  }
  
  return allExist;
};

const deployAll = async () => {
  console.log('🚀 Haven Collective - Testnet Deployment (Optimized Contracts)');
  console.log('='.repeat(70));
  
  // Verify contracts exist
  const allExist = await verifyContracts();
  if (!allExist) {
    console.error('\n❌ Some optimized contracts are missing. Deployment aborted.');
    process.exit(1);
  }
  
  const estimatedCost = estimateTotalCost();
  
  console.log(`\n⏰ Estimated time: ${(contracts.length * WAIT_TIME / 1000 / 60).toFixed(1)} minutes`);
  console.log(`\n🧪 Testing optimized contracts with low fees on TESTNET`);
  console.log(`   This validates the optimization before mainnet deployment.`);
  console.log(`\nStarting in 5 seconds...`);
  
  await sleep(5000);
  
  const senderKey = await getWallet();
  
  console.log(`\n🔥 Starting deployment...\n`);
  
  const results = [];
  let successCount = 0;
  let totalSpent = 0;
  
  for (let i = 0; i < contracts.length; i++) {
    const contractName = contracts[i];
    console.log(`\n[${ i + 1}/${contracts.length}] ${contractName}`);
    
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
  console.log('📊 DEPLOYMENT SUMMARY (TESTNET)');
  console.log('='.repeat(70));
  console.log(`\n✅ Successful: ${successCount}/${contracts.length}`);
  console.log(`❌ Failed: ${contracts.length - successCount}/${contracts.length}`);
  console.log(`💸 Deployment fees: ${totalSpent.toFixed(3)} STX`);
  console.log(`💸 Total cost: ~${totalSpent.toFixed(3)} STX (+ bytecode costs)\n`);
  
  if (successCount === contracts.length) {
    console.log('🎉 ALL OPTIMIZED CONTRACTS DEPLOYED SUCCESSFULLY ON TESTNET!\n');
    console.log('📝 Next steps:');
    console.log('   1. Wait 5 minutes for all transactions to confirm');
    console.log('   2. Run on-chain tests to verify functionality');
    console.log('   3. Compare gas costs with original contracts');
    console.log('   4. If all tests pass, proceed to mainnet deployment');
    console.log('\n💡 Test command:');
    console.log('   node scripts/test-optimized.js');
  } else {
    console.log('⚠️  Some deployments failed. Review errors above.\n');
    console.log('Failed contracts:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.contract}: ${r.error}`);
    });
    console.log('\n💡 Common issues:');
    console.log('   - Fee too low (increase to 30000-50000 microSTX)');
    console.log('   - Contract name already exists (check previous deployments)');
    console.log('   - Network congestion (try again later)');
  }
  
  console.log('\n' + '='.repeat(70));
  
  // Save results
  const resultsPath = path.join(__dirname, '..', 'testnet-optimized-deployment.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Results saved to: testnet-optimized-deployment.json\n`);
};

deployAll().catch(console.error);
