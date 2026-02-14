const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, standardPrincipalCV, uintCV, stringAsciiCV } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { generateWallet } = require('@stacks/wallet-sdk');

const network = new StacksTestnet();
const mnemonic = 'bread shift morning sense clean interest humor oven kick fox vintage december oxygen zebra shed guess toast rebuild attract panda early satisfy climb refuse';
const TESTNET_ADDRESS = 'ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VPPJ66ZM';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runQuickTest = async () => {
  const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
  const senderKey = wallet.accounts[0].stxPrivateKey;
  
  console.log('\n🎯 Quick Test - Mint and List NFT with Correct Address\n');
  
  // Create collection #6
  console.log('Creating collection #6...');
  let tx = await makeContractCall({
    contractAddress: TESTNET_ADDRESS,
    contractName: 'haven-registry',
    functionName: 'create-collection',
    functionArgs: [stringAsciiCV('Quick Test'), stringAsciiCV('QT')],
    senderKey, network, anchorMode: AnchorMode.Any, fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  let result = await broadcastTransaction(tx, network);
  console.log(`✓ TX: ${result.txid || result.error}`);
  
  await sleep(30000);
  
  // Authorize minter
  console.log('\nAuthorizing minter...');
  tx = await makeContractCall({
    contractAddress: TESTNET_ADDRESS,
    contractName: 'haven-mint',
    functionName: 'authorize-minter',
    functionArgs: [standardPrincipalCV(TESTNET_ADDRESS)],
    senderKey, network, anchorMode: AnchorMode.Any, fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  result = await broadcastTransaction(tx, network);
  console.log(`✓ TX: ${result.txid || result.error}`);
  
  await sleep(30000);
  
  // Mint token #4 TO ST31... (not SP31...)
  console.log(`\nMinting token #4 to ${TESTNET_ADDRESS}...`);
  tx = await makeContractCall({
    contractAddress: TESTNET_ADDRESS,
    contractName: 'haven-mint',
    functionName: 'mint',
    functionArgs: [uintCV(6), standardPrincipalCV(TESTNET_ADDRESS)],
    senderKey, network, anchorMode: AnchorMode.Any, fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  result = await broadcastTransaction(tx, network);
  const mintTxid = result.txid;
  console.log(`✓ TX: ${result.txid || result.error}`);
  
  await sleep(30000);
  
  // List token #4
  console.log('\nListing token #4 for 1 STX...');
  tx = await makeContractCall({
    contractAddress: TESTNET_ADDRESS,
    contractName: 'haven-market',
    functionName: 'list-token',
    functionArgs: [uintCV(4), uintCV(1000000)],
    senderKey, network, anchorMode: AnchorMode.Any, fee: 50000,
    postConditionMode: PostConditionMode.Allow
  });
  result = await broadcastTransaction(tx, network);
  const listTxid = result.txid;
  console.log(`✓ TX: ${result.txid || result.error}`);
  
  console.log('\n⏳ Waiting 40s for confirmation...\n');
  await sleep(40000);
  
  // Verify
  console.log('📊 Results:\n');
  
  const execSync = require('child_process').execSync;
  
  const mintStatus = execSync(`curl -s "https://api.testnet.hiro.so/extended/v1/tx/0x${mintTxid}" | python3 -c "import sys, json; tx = json.load(sys.stdin); print(f'Mint status: {tx.get(\\"tx_status\\")}')"`).toString().trim();
  console.log(mintStatus);
  
  const listStatus = execSync(`curl -s "https://api.testnet.hiro.so/extended/v1/tx/0x${listTxid}" | python3 -c "import sys, json; tx = json.load(sys.stdin); print(f'List status: {tx.get(\\"tx_status\\")}'); print(f'List result: {tx.get(\\"tx_result\\", {}).get(\\"repr\\", \\"N/A\\")}')"` ).toString().trim();
  console.log(listStatus);
  
  console.log('\n✅ Test complete!\n');
};

runQuickTest().catch(console.error);
