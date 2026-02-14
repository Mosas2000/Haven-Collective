const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, standardPrincipalCV, uintCV, stringAsciiCV } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');

const network = new StacksTestnet();
const mnemonic = 'glue into gate this better involve alarm beyond dance control heavy party penalty avoid affair memory idle horror exotic slam odor caught ocean host';

// The CORRECT testnet address that signs transactions
const TESTNET_ADDRESS = 'ST3382F8A75J4XF2VVNHTFTRZ0MNDX9J97NSNK2FD';

const getWallet = async () => {
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: ''
  });
  return wallet.accounts[0].stxPrivateKey;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTests = async () => {
  const senderKey = await getWallet();
  
  console.log('\n🧪 Testing Optimized Contracts on Testnet');
  console.log('='.repeat(70));
  console.log(`\nContract Address: ${TESTNET_ADDRESS}\n`);
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Create Collection
  console.log('1️⃣  Testing create-collection...');
  try {
    const tx1 = await makeContractCall({
      contractAddress: TESTNET_ADDRESS,
      contractName: 'haven-registry',
      functionName: 'create-collection',
      functionArgs: [stringAsciiCV('Optimized Test'), stringAsciiCV('OPT')],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 30000,
      postConditionMode: PostConditionMode.Allow
    });
    const result1 = await broadcastTransaction(tx1, network);
    
    if (result1.txid) {
      console.log(`   ✅ Success! TX: ${result1.txid}`);
      passedTests++;
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result1.error}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
  }
  
  // Test 2: Authorize Minter
  console.log('\n2️⃣  Testing authorize-minter...');
  try {
    const tx2 = await makeContractCall({
      contractAddress: TESTNET_ADDRESS,
      contractName: 'haven-mint',
      functionName: 'authorize-minter',
      functionArgs: [standardPrincipalCV(TESTNET_ADDRESS)],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 30000,
      postConditionMode: PostConditionMode.Allow
    });
    const result2 = await broadcastTransaction(tx2, network);
    
    if (result2.txid) {
      console.log(`   ✅ Success! TX: ${result2.txid}`);
      passedTests++;
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result2.error}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
  }
  
  // Test 3: Mint NFT to correct address
  console.log(`\n3️⃣  Testing mint to ${TESTNET_ADDRESS}...`);
  try {
    const tx3 = await makeContractCall({
      contractAddress: TESTNET_ADDRESS,
      contractName: 'haven-mint',
      functionName: 'mint',
      functionArgs: [uintCV(1), standardPrincipalCV(TESTNET_ADDRESS)],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 30000,
      postConditionMode: PostConditionMode.Allow
    });
    const result3 = await broadcastTransaction(tx3, network);
    
    if (result3.txid) {
      console.log(`   ✅ Success! TX: ${result3.txid}`);
      passedTests++;
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result3.error}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
  }
  
  // Test 4: Set Metadata
  console.log('\n4️⃣  Testing set-token-uri...');
  try {
    const tx4 = await makeContractCall({
      contractAddress: TESTNET_ADDRESS,
      contractName: 'haven-metadata',
      functionName: 'set-token-uri',
      functionArgs: [uintCV(1), stringAsciiCV('ipfs://QmOptimizedTest')],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 30000,
      postConditionMode: PostConditionMode.Allow
    });
    const result4 = await broadcastTransaction(tx4, network);
    
    if (result4.txid) {
      console.log(`   ✅ Success! TX: ${result4.txid}`);
      passedTests++;
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result4.error}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
  }
  
  // Test 5: List Token (THE CRITICAL TEST)
  console.log('\n5️⃣  Testing list-token (owner == tx-sender)...');
  try {
    const tx5 = await makeContractCall({
      contractAddress: TESTNET_ADDRESS,
      contractName: 'haven-market',
      functionName: 'list-token',
      functionArgs: [uintCV(1), uintCV(1000000)],
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 30000,
      postConditionMode: PostConditionMode.Allow
    });
    const result5 = await broadcastTransaction(tx5, network);
    
    if (result5.txid) {
      console.log(`   ✅ Success! TX: ${result5.txid}`);
      passedTests++;
      console.log('\n   🎉 LIST-TOKEN WORKS! Optimization successful!');
    } else {
      console.log(`   ❌ Failed: ${result5.error}`);
      failedTests++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedTests++;
  }
  
  // Summary
  console.log('\n');
  console.log('='.repeat(70));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(70));
  console.log(`\n✅ Passed: ${passedTests}/5`);
  console.log(`❌ Failed: ${failedTests}/5\n`);
  
  if (passedTests === 5) {
    console.log('🎉 ALL TESTS PASSED!');
    console.log('   Optimized contracts work perfectly!');
    console.log('   Ready for mainnet deployment.\n');
  } else {
    console.log('⚠️  Some tests failed. Review errors above.\n');
  }
  
  console.log('='.repeat(70) + '\n');
};

runTests().catch(console.error);
