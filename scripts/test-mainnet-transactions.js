const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, standardPrincipalCV, uintCV, stringAsciiCV } = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
const { generateWallet } = require('@stacks/wallet-sdk');
const fs = require('fs');
const path = require('path');
const toml = require('toml');

const network = new StacksMainnet();

// Read mainnet mnemonic from Mainnet.toml
const mainnetTomlPath = path.join(__dirname, '..', 'settings', 'Mainnet.toml');
const mainnetTomlContent = fs.readFileSync(mainnetTomlPath, 'utf8');
const config = toml.parse(mainnetTomlContent);
const MAINNET_MNEMONIC = config.accounts.deployer.mnemonic;

// Your mainnet deployer address - will be calculated from mnemonic
let MAINNET_ADDRESS;

const getWallet = async () => {
  const wallet = await generateWallet({
    secretKey: MAINNET_MNEMONIC,
    password: ''
  });
  return wallet.accounts[0].stxPrivateKey;
};

const getAddress = async () => {
  const wallet = await generateWallet({
    secretKey: MAINNET_MNEMONIC,
    password: ''
  });
  // For mainnet, we need the actual address that will sign transactions
  // This should be consistent with what deployed the contracts
  return wallet.accounts[0];
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runMainnetTransactions = async () => {
  console.log('\n🚀 Haven Collective - Mainnet Transaction Tests');
  console.log('='.repeat(70));
  
  const senderKey = await getWallet();
  const account = await getAddress();
  
  // The address that deployed contracts (should be the mainnet version)
  MAINNET_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T'; // Update if different
  
  console.log(`\n📍 Contract Address: ${MAINNET_ADDRESS}`);
  console.log(`⚠️  REAL MAINNET TRANSACTIONS - STX WILL BE SPENT!\n`);
  console.log(`Starting in 5 seconds...\n`);
  
  await sleep(5000);
  
  let passedTests = 0;
  let failedTests = 0;
  const results = [];
  
  // Test 1: Create Collection
  console.log('1️⃣  Creating NFT Collection...');
  try {
    const tx1 = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-registry',
      functionName: 'create-collection',
      functionArgs: [
        stringAsciiCV('Haven Genesis Collection'),
        stringAsciiCV('HAVEN')
      ],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result1 = await broadcastTransaction(tx1, network);
    
    if (result1.txid) {
      console.log(`   ✅ Success!`);
      console.log(`   TX: ${result1.txid}`);
      console.log(`   View: https://explorer.hiro.so/txid/${result1.txid}?chain=mainnet`);
      passedTests++;
      results.push({ test: 'create-collection', status: 'success', txid: result1.txid });
      
      console.log(`\n   ⏳ Waiting 60s for confirmation...`);
      await sleep(60000);
    } else {
      console.log(`   ❌ Failed: ${result1.error}`);
      failedTests++;
      results.push({ test: 'create-collection', status: 'failed', error: result1.error });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
    results.push({ test: 'create-collection', status: 'error', error: error.message });
  }
  
  // Test 2: Authorize Minter
  console.log('\n2️⃣  Authorizing Minter...');
  try {
    const tx2 = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-mint',
      functionName: 'authorize-minter',
      functionArgs: [standardPrincipalCV(MAINNET_ADDRESS)],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result2 = await broadcastTransaction(tx2, network);
    
    if (result2.txid) {
      console.log(`   ✅ Success!`);
      console.log(`   TX: ${result2.txid}`);
      console.log(`   View: https://explorer.hiro.so/txid/${result2.txid}?chain=mainnet`);
      passedTests++;
      results.push({ test: 'authorize-minter', status: 'success', txid: result2.txid });
      
      console.log(`\n   ⏳ Waiting 60s for confirmation...`);
      await sleep(60000);
    } else {
      console.log(`   ❌ Failed: ${result2.error}`);
      failedTests++;
      results.push({ test: 'authorize-minter', status: 'failed', error: result2.error });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
    results.push({ test: 'authorize-minter', status: 'error', error: error.message });
  }
  
  // Test 3: Mint NFT #1
  console.log(`\n3️⃣  Minting NFT #1 to ${MAINNET_ADDRESS}...`);
  try {
    const tx3 = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-mint',
      functionName: 'mint',
      functionArgs: [
        uintCV(1), // collection-id
        standardPrincipalCV(MAINNET_ADDRESS) // recipient
      ],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result3 = await broadcastTransaction(tx3, network);
    
    if (result3.txid) {
      console.log(`   ✅ Success!`);
      console.log(`   TX: ${result3.txid}`);
      console.log(`   View: https://explorer.hiro.so/txid/${result3.txid}?chain=mainnet`);
      passedTests++;
      results.push({ test: 'mint-nft', status: 'success', txid: result3.txid });
      
      console.log(`\n   ⏳ Waiting 60s for confirmation...`);
      await sleep(60000);
    } else {
      console.log(`   ❌ Failed: ${result3.error}`);
      failedTests++;
      results.push({ test: 'mint-nft', status: 'failed', error: result3.error });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
    results.push({ test: 'mint-nft', status: 'error', error: error.message });
  }
  
  // Test 4: Set Token Metadata
  console.log('\n4️⃣  Setting Token Metadata...');
  try {
    const tx4 = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-metadata',
      functionName: 'set-token-uri',
      functionArgs: [
        uintCV(1),
        stringAsciiCV('ipfs://QmHavenGenesisNFT1')
      ],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result4 = await broadcastTransaction(tx4, network);
    
    if (result4.txid) {
      console.log(`   ✅ Success!`);
      console.log(`   TX: ${result4.txid}`);
      console.log(`   View: https://explorer.hiro.so/txid/${result4.txid}?chain=mainnet`);
      passedTests++;
      results.push({ test: 'set-metadata', status: 'success', txid: result4.txid });
      
      console.log(`\n   ⏳ Waiting 60s for confirmation...`);
      await sleep(60000);
    } else {
      console.log(`   ❌ Failed: ${result4.error}`);
      failedTests++;
      results.push({ test: 'set-metadata', status: 'failed', error: result4.error });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
    results.push({ test: 'set-metadata', status: 'error', error: error.message });
  }
  
  // Test 5: List Token for Sale
  console.log('\n5️⃣  Listing Token #1 for 100 STX...');
  try {
    const tx5 = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-market',
      functionName: 'list-token',
      functionArgs: [
        uintCV(1),
        uintCV(100000000) // 100 STX
      ],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result5 = await broadcastTransaction(tx5, network);
    
    if (result5.txid) {
      console.log(`   ✅ Success!`);
      console.log(`   TX: ${result5.txid}`);
      console.log(`   View: https://explorer.hiro.so/txid/${result5.txid}?chain=mainnet`);
      passedTests++;
      results.push({ test: 'list-token', status: 'success', txid: result5.txid });
      
      console.log(`\n   🎉 NFT successfully listed on Haven Collective marketplace!`);
    } else {
      console.log(`   ❌ Failed: ${result5.error}`);
      failedTests++;
      results.push({ test: 'list-token', status: 'failed', error: result5.error });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
    results.push({ test: 'list-token', status: 'error', error: error.message });
  }
  
  // Summary
  console.log('\n');
  console.log('='.repeat(70));
  console.log('📊 MAINNET TRANSACTION RESULTS');
  console.log('='.repeat(70));
  console.log(`\n✅ Passed: ${passedTests}/5`);
  console.log(`❌ Failed: ${failedTests}/5\n`);
  
  if (passedTests === 5) {
    console.log('🎉 ALL MAINNET TRANSACTIONS SUCCESSFUL!');
    console.log('   Your NFT platform is fully operational on Stacks mainnet!\n');
    console.log('📝 What was accomplished:');
    console.log('   ✅ Created "Haven Genesis Collection"');
    console.log('   ✅ Authorized minter contract');
    console.log('   ✅ Minted NFT #1');
    console.log('   ✅ Set IPFS metadata');
    console.log('   ✅ Listed NFT for 100 STX on marketplace\n');
  } else {
    console.log('⚠️  Some transactions failed. Review errors above.\n');
  }
  
  console.log('💸 Estimated cost: ~0.25 STX (5 transactions × 0.05 STX)\n');
  console.log('='.repeat(70) + '\n');
  
  // Save results
  const resultsPath = path.join(__dirname, '..', 'mainnet-transactions-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`💾 Results saved to: mainnet-transactions-results.json\n`);
};

runMainnetTransactions().catch(console.error);
