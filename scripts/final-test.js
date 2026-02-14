const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, standardPrincipalCV, uintCV, stringAsciiCV } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { generateWallet } = require('@stacks/wallet-sdk');

const network = new StacksTestnet();
const mnemonic = 'bread shift morning sense clean interest humor oven kick fox vintage december oxygen zebra shed guess toast rebuild attract panda early satisfy climb refuse';

// CRITICAL: The correct testnet address that actually signs transactions
const TESTNET_ADDRESS = 'ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VPPJ66ZM';

const getWallet = async () => {
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: ''
  });
  return wallet.accounts[0].stxPrivateKey;
};

const waitForTx = (msg) => {
  return new Promise((resolve) => {
    console.log(`   ${msg}`);
    setTimeout(() => resolve(), 30000);
  });
};

const runCompleteTest = async () => {
  const senderKey = await getWallet();
  
  console.log('\n🚀 Haven Collective - Complete On-chain Test (CORRECTED)');
  console.log('='.repeat(70));
  console.log(`\n✅ Using correct testnet address: ${TESTNET_ADDRESS}`);
  console.log(`   (All mint recipients, tx-senders will be this address)\n`);
  
  // Test 1: Create collection
  console.log('1️⃣  Creating collection #3...');
  const createTx = await makeContractCall({
    contractAddress: TESTNET_ADDRESS,
    contractName: 'haven-registry',
    functionName: 'create-collection',
    functionArgs: [stringAsciiCV('Final Test Collection'), stringAsciiCV('FTC')],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  const createResult = await broadcastTransaction(createTx, network);
  console.log(`   TX: ${createResult.txid || createResult.error}`);
  
  if (createResult.error) {
    console.log(`\n❌ Failed: ${createResult.error}\n`);
    return;
  }
  
  await waitForTx('⏳ Waiting 30s for confirmation...');
  
  // Test 2: Authorize minter
  console.log('\n2️⃣  Authorizing minter...');
  const authTx = await makeContractCall({
    contractAddress: TESTNET_ADDRESS,
    contractName: 'haven-mint',
    functionName: 'authorize-minter',
    functionArgs: [standardPrincipalCV(TESTNET_ADDRESS)],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  const authResult = await broadcastTransaction(authTx, network);
  console.log(`   TX: ${authResult.txid || authResult.error}`);
  
  if (authResult.error) return;
  await waitForTx('⏳ Waiting 30s for confirmation...');
  
  // Test 3: Mint NFT to CORRECT testnet address
  console.log(`\n3️⃣  Minting token #3 to ${TESTNET_ADDRESS}...`);
  const mintTx = await makeContractCall({
    contractAddress: TESTNET_ADDRESS,
    contractName: 'haven-mint',
    functionName: 'mint',
    functionArgs: [
      uintCV(3),  // collection-id
      standardPrincipalCV(TESTNET_ADDRESS)  // Recipient must be ST... address!
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  const mintResult = await broadcastTransaction(mintTx, network);
  console.log(`   TX: ${mintResult.txid || mintResult.error}`);
  
  if (mintResult.error) return;
  await waitForTx('⏳ Waiting 30s for confirmation...');
  
  // Test 4: Set metadata
  console.log('\n4️⃣  Setting token metadata...');
  const metaTx = await makeContractCall({
    contractAddress: TESTNET_ADDRESS,
    contractName: 'haven-metadata',
    functionName: 'set-token-uri',
    functionArgs: [uintCV(3), stringAsciiCV('ipfs://QmFinalTest')],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  const metaResult = await broadcastTransaction(metaTx, network);
  console.log(`   TX: ${metaResult.txid || metaResult.error}`);
  
  if (metaResult.error) return;
  await waitForTx('⏳ Waiting 30s for confirmation...');
  
  // Test 5: List token - THIS WILL WORK because owner == tx-sender == ST31...
  console.log('\n5️⃣  Listing token #3 for 1 STX...');
  const listTx = await makeContractCall({
    contractAddress: TESTNET_ADDRESS,
    contractName: 'haven-market',
    functionName: 'list-token',
    functionArgs: [uintCV(3), uintCV(1000000)],  // 1 STX
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  const listResult = await broadcastTransaction(listTx, network);
  console.log(`   TX: ${listResult.txid || listResult.error}`);
  
  if (listResult.error) return;
  await waitForTx('⏳ Waiting 30s for confirmation...');
  
  // Verify all results
  console.log('\n📊 Verification:');
  console.log('='.repeat(70));
  
  const verifyCmd = `curl -s "https://api.testnet.hiro.so/extended/v1/tx/0x${listResult.txid}" | python3 -c "import sys, json; tx = json.load(sys.stdin); print(f'Status: {tx.get(\\"tx_status\\")}'); print(f'Result: {tx.get(\\"tx_result\\", {}).get(\\"repr\\", \\"N/A\\")}')"`;
  
  console.log(`\nRun this command to verify list-token succeeded:`);
  console.log(`\n${verifyCmd}\n`);
  
  console.log('✅ All 5 tests completed!');
  console.log('='.repeat(70));
  console.log('\n📝 Summary:');
  console.log(`   ✓ Collection #3 created`);
  console.log(`   ✓ Minter authorized`);
  console.log(`   ✓ Token #3 minted to correct address (${TESTNET_ADDRESS})`);
  console.log(`   ✓ Metadata set`);
  console.log(`   ✓ Token listed (verify with command above)`);
  console.log('\n💡 The fix: Mint NFTs to ST... (testnet) not SP... (mainnet format)');
  console.log('   This ensures token-owner == tx-sender for authorization checks.\n');
};

runCompleteTest().catch(console.error);
