const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, uintCV, stringAsciiCV, bufferCV, standardPrincipalCV } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');

const network = new StacksTestnet();
const contractAddress = 'ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VPPJ66ZM';

// Mnemonic from Testnet.toml
const mnemonic = 'bread shift morning sense clean interest humor oven kick fox vintage december oxygen zebra shed guess toast rebuild attract panda early satisfy climb refuse';

const getWallet = async () => {
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: ''
  });
  const account = wallet.accounts[0];
  return {
    senderKey: account.stxPrivateKey,
    address: getStxAddress({ account, transactionVersion: 0x80 })
  };
};

const callContract = async (contractName, functionName, functionArgs, senderKey) => {
  const txOptions = {
    contractAddress,
    contractName,
    functionName,
    functionArgs,
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  return broadcastResponse;
};

const runTests = async () => {
  console.log('=== Haven Collective - On-Chain Testing ===\n');
  
  const { senderKey, address } = await getWallet();
  console.log(`Testing from: ${address}\n`);

  // Test 1: Create a collection
  console.log('Test 1: Creating collection...');
  try {
    const result = await callContract(
      'haven-registry',
      'create-collection',
      [
        stringAsciiCV('Test Collection'),
        stringAsciiCV('TEST'),
        uintCV(100)
      ],
      senderKey
    );
    
    if (result.error) {
      console.log(`❌ Failed: ${result.error}`);
    } else {
      console.log(`✓ TX: ${result.txid}`);
      console.log(`  View: https://explorer.hiro.so/txid/${result.txid}?chain=testnet\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  // Wait between transactions
  console.log('Waiting 15 seconds for confirmation...\n');
  await new Promise(resolve => setTimeout(resolve, 15000));

  // Test 2: Authorize minter
  console.log('Test 2: Authorizing minter...');
  try {
    const result = await callContract(
      'haven-mint',
      'authorize-minter',
      [
        standardPrincipalCV(address)
      ],
      senderKey
    );
    
    if (result.error) {
      console.log(`❌ Failed: ${result.error}`);
    } else {
      console.log(`✓ TX: ${result.txid}`);
      console.log(`  View: https://explorer.hiro.so/txid/${result.txid}?chain=testnet\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('Waiting 20 seconds for authorization...\n');
  await new Promise(resolve => setTimeout(resolve, 20000));

  // Test 3: Mint an NFT
  console.log('Test 3: Minting NFT to collection 1...');
  try {
    const result = await callContract(
      'haven-mint',
      'mint',
      [
        uintCV(1),
        standardPrincipalCV(contractAddress)  // Mint to deployer address so it can list
      ],
      senderKey
    );
    
    if (result.error) {
      console.log(`❌ Failed: ${result.error}`);
    } else {
      console.log(`✓ TX: ${result.txid}`);
      console.log(`  View: https://explorer.hiro.so/txid/${result.txid}?chain=testnet\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('Waiting 30 seconds for NFT mint confirmation...\n');
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Test 4: Set metadata
  console.log('Test 4: Setting metadata for token #1...');
  try {
    const result = await callContract(
      'haven-metadata',
      'set-token-uri',
      [
        uintCV(1),
        stringAsciiCV('https://haven.io/metadata/1')
      ],
      senderKey
    );
    
    if (result.error) {
      console.log(`❌ Failed: ${result.error}`);
    } else {
      console.log(`✓ TX: ${result.txid}`);
      console.log(`  View: https://explorer.hiro.so/txid/${result.txid}?chain=testnet\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('Waiting 30 seconds for metadata confirmation...\n');
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Test 5: List on market
  console.log('Test 5: Listing NFT #1 on market for 1 STX...');
  try {
    const result = await callContract(
      'haven-market',
      'list-token',
      [
        uintCV(1),
        uintCV(1000000) // 1 STX
      ],
      senderKey
    );
    
    if (result.error) {
      console.log(`❌ Failed: ${result.error}`);
    } else {
      console.log(`✓ TX: ${result.txid}`);
      console.log(`  View: https://explorer.hiro.so/txid/${result.txid}?chain=testnet\n`);
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}\n`);
  }

  console.log('\n=== Testing Complete ===');
  console.log('Check transactions on explorer:');
  console.log(`https://explorer.hiro.so/address/${contractAddress}?chain=testnet`);
};

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
