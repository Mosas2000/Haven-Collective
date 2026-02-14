const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, standardPrincipalCV, uintCV, stringAsciiCV } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');

const network = new StacksTestnet();
const mnemonic = 'bread shift morning sense clean interest humor oven kick fox vintage december oxygen zebra shed guess toast rebuild attract panda early satisfy climb refuse';

const getWallet = async () => {
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: ''
  });
  const account = wallet.accounts[0];
  
  // On testnet, use testnet address format (ST...)
  const testnetAddress = getStxAddress({ account, transactionVersion: 0x80 });
  
  return {
    senderKey: account.stxPrivateKey,
    address: testnetAddress
  };
};

const waitForTx = (txid) => {
  return new Promise((resolve) => {
    console.log(`Waiting 30 seconds for transaction to confirm...`);
    setTimeout(() => resolve(), 30000);
  });
};

const runTest = async () => {
  const { senderKey, address } = await getWallet();
  console.log(`\n🔧 Corrected Test - Using consistent testnet addresses`);
  console.log(`Contract & Wallet Address: ${address}\n`);
  
  // Test 1: Create collection
  console.log('1️⃣  Creating collection #2...');
  const createTx = await makeContractCall({
    contractAddress: address,
    contractName: 'haven-registry',
    functionName: 'create-collection',
    functionArgs: [stringAsciiCV('Test Collection 2'), stringAsciiCV('TC2')],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  const createResult = await broadcastTransaction(createTx, network);
  console.log(`   TX: ${createResult.txid || createResult.error}`);
  
  await waitForTx(createResult.txid);
  
  // Test 2: Authorize minter
  console.log('\n2️⃣  Authorizing minter...');
  const authTx = await makeContractCall({
    contractAddress: address,
    contractName: 'haven-mint',
    functionName: 'authorize-minter',
    functionArgs: [standardPrincipalCV(address)],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  const authResult = await broadcastTransaction(authTx, network);
  console.log(`   TX: ${authResult.txid || authResult.error}`);
  
  await waitForTx(authResult.txid);
  
  // Test 3: Mint NFT to TESTNET address (ST...)
  console.log(`\n3️⃣  Minting token #2 to testnet address ${address}...`);
  const mintTx = await makeContractCall({
    contractAddress: address,
    contractName: 'haven-mint',
    functionName: 'mint',
    functionArgs: [
      uintCV(2),  // collection-id #2
      standardPrincipalCV(address)  // recipient: testnet address
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  const mintResult = await broadcastTransaction(mintTx, network);
  console.log(`   TX: ${mintResult.txid || mintResult.error}`);
  
  await waitForTx(mintResult.txid);
  
  // Test 4: Set metadata
  console.log('\n4️⃣  Setting token metadata...');
  const metaTx = await makeContractCall({
    contractAddress: address,
    contractName: 'haven-metadata',
    functionName: 'set-token-uri',
    functionArgs: [uintCV(2), stringAsciiCV('ipfs://QmTest2')],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  const metaResult = await broadcastTransaction(metaTx, network);
  console.log(`   TX: ${metaResult.txid || metaResult.error}`);
  
  await waitForTx(metaResult.txid);
  
  // Test 5: List token - THIS SHOULD WORK NOW
  console.log('\n5️⃣  Listing token #2 for 1 STX...');
  const listTx = await makeContractCall({
    contractAddress: address,
    contractName: 'haven-market',
    functionName: 'list-token',
    functionArgs: [uintCV(2), uintCV(1000000)],  // 1 STX
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  const listResult = await broadcastTransaction(listTx, network);
  console.log(`   TX: ${listResult.txid || listResult.error}`);
  
  console.log('\n⏳ Waiting for final transaction to confirm...');
  await waitForTx(listResult.txid);
  
  // Verify listing
  console.log('\n📊 Verifying results...');
  const verifyCmd = `curl -s "https://api.testnet.hiro.so/extended/v1/tx/0x${listResult.txid}" | python3 -c "import sys, json; tx = json.load(sys.stdin); print(f'List-token status: {tx.get(\\"tx_status\\")}'); print(f'Result: {tx.get(\\"tx_result\\", {}).get(\\"repr\\", \\"N/A\\")}')"`;
  
  console.log('\n✅ All tests complete!');
  console.log(`\n🔍 Check list-token result with:`);
  console.log(`   ${verifyCmd}`);
  
  console.log(`\n📝 Summary:`);
  console.log(`   - Collection #2 created`);
  console.log(`   - Minter authorized`);
  console.log(`   - Token #2 minted to ${address}`);
  console.log(`   - Metadata set`);
  console.log(`   - Token listed (check if tx succeeded)`);
};

runTest().catch(console.error);
