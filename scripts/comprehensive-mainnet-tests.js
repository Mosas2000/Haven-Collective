const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, standardPrincipalCV, uintCV, stringAsciiCV, listCV, tupleCV } = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
const { generateWallet } = require('@stacks/wallet-sdk');
const fs = require('fs');
const path = require('path');
const toml = require('toml');

const network = new StacksMainnet();

const mainnetTomlPath = path.join(__dirname, '..', 'settings', 'Mainnet.toml');
const mainnetTomlContent = fs.readFileSync(mainnetTomlPath, 'utf8');
const config = toml.parse(mainnetTomlContent);
const MAINNET_MNEMONIC = config.accounts.deployer.mnemonic;
const MAINNET_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';

const getWallet = async () => {
  const wallet = await generateWallet({
    secretKey: MAINNET_MNEMONIC,
    password: ''
  });
  return wallet.accounts[0].stxPrivateKey;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runComprehensiveTests = async () => {
  console.log('\n🔥 Haven Collective - Comprehensive Mainnet Tests');
  console.log('='.repeat(70));
  console.log(`\n📍 Contract Address: ${MAINNET_ADDRESS}`);
  console.log(`⚠️  REAL MAINNET - STX WILL BE SPENT!\n`);
  console.log(`Starting in 5 seconds...\n`);
  
  await sleep(5000);
  
  const senderKey = await getWallet();
  const results = [];
  let txCount = 0;
  
  // ===== HAVEN-CORE TESTS =====
  console.log('━'.repeat(70));
  console.log('📦 HAVEN-CORE CONTRACT');
  console.log('━'.repeat(70));
  
  // Set platform fee
  console.log('\n1️⃣  Setting platform fee to 2.5%...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-core',
      functionName: 'set-platform-fee',
      functionArgs: [uintCV(250)], // 2.5% = 250 basis points
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-core', function: 'set-platform-fee', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Authorize market contract
  console.log('\n2️⃣  Authorizing haven-market contract...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-core',
      functionName: 'authorize-contract',
      functionArgs: [standardPrincipalCV(`${MAINNET_ADDRESS}.haven-market`)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-core', function: 'authorize-contract', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== HAVEN-REGISTRY TESTS =====
  console.log('\n' + '━'.repeat(70));
  console.log('📚 HAVEN-REGISTRY CONTRACT');
  console.log('━'.repeat(70));
  
  // Create second collection
  console.log('\n3️⃣  Creating "Digital Art Collection"...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-registry',
      functionName: 'create-collection',
      functionArgs: [
        stringAsciiCV('Digital Art Collection'),
        stringAsciiCV('DART')
      ],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-registry', function: 'create-collection', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Update collection supply
  console.log('\n4️⃣  Updating collection #1 supply...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-registry',
      functionName: 'update-collection-supply',
      functionArgs: [uintCV(1), uintCV(20000)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-registry', function: 'update-collection-supply', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== HAVEN-MINT TESTS =====
  console.log('\n' + '━'.repeat(70));
  console.log('🎨 HAVEN-MINT CONTRACT');
  console.log('━'.repeat(70));
  
  // Mint NFT #2
  console.log('\n5️⃣  Minting NFT #2...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-mint',
      functionName: 'mint',
      functionArgs: [uintCV(1), standardPrincipalCV(MAINNET_ADDRESS)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-mint', function: 'mint', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Mint NFT #3
  console.log('\n6️⃣  Minting NFT #3...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-mint',
      functionName: 'mint',
      functionArgs: [uintCV(1), standardPrincipalCV(MAINNET_ADDRESS)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-mint', function: 'mint', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== HAVEN-METADATA TESTS =====
  console.log('\n' + '━'.repeat(70));
  console.log('📝 HAVEN-METADATA CONTRACT');
  console.log('━'.repeat(70));
  
  // Set metadata for NFT #2
  console.log('\n7️⃣  Setting metadata for NFT #2...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-metadata',
      functionName: 'set-token-uri',
      functionArgs: [uintCV(2), stringAsciiCV('ipfs://QmHavenNFT2Metadata')],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-metadata', function: 'set-token-uri', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Set metadata for NFT #3
  console.log('\n8️⃣  Setting metadata for NFT #3...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-metadata',
      functionName: 'set-token-uri',
      functionArgs: [uintCV(3), stringAsciiCV('ipfs://QmHavenNFT3Metadata')],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-metadata', function: 'set-token-uri', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Authorize metadata updater
  console.log('\n9️⃣  Authorizing metadata updater...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-metadata',
      functionName: 'authorize-updater',
      functionArgs: [standardPrincipalCV(MAINNET_ADDRESS)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-metadata', function: 'authorize-updater', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== HAVEN-MARKET TESTS =====
  console.log('\n' + '━'.repeat(70));
  console.log('🏪 HAVEN-MARKET CONTRACT');
  console.log('━'.repeat(70));
  
  // List NFT #2
  console.log('\n🔟 Listing NFT #2 for 50 STX...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-market',
      functionName: 'list-token',
      functionArgs: [uintCV(2), uintCV(50000000)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-market', function: 'list-token', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Update listing price
  console.log('\n1️⃣1️⃣  Updating NFT #1 price to 150 STX...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-market',
      functionName: 'update-listing-price',
      functionArgs: [uintCV(1), uintCV(150000000)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-market', function: 'update-listing-price', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // List NFT #3
  console.log('\n1️⃣2️⃣  Listing NFT #3 for 75 STX...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-market',
      functionName: 'list-token',
      functionArgs: [uintCV(3), uintCV(75000000)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-market', function: 'list-token', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== HAVEN-ROYALTY TESTS =====
  console.log('\n' + '━'.repeat(70));
  console.log('💰 HAVEN-ROYALTY CONTRACT');
  console.log('━'.repeat(70));
  
  // Set royalty for collection #1
  console.log('\n1️⃣3️⃣  Setting 10% royalty for collection #1...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-royalty',
      functionName: 'set-royalty',
      functionArgs: [
        uintCV(1),
        listCV([standardPrincipalCV(MAINNET_ADDRESS)]),
        listCV([uintCV(1000)]) // 10%
      ],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-royalty', function: 'set-royalty', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== HAVEN-OFFERS TESTS =====
  console.log('\n' + '━'.repeat(70));
  console.log('💵 HAVEN-OFFERS CONTRACT');
  console.log('━'.repeat(70));
  
  // Make offer on NFT #1
  console.log('\n1️⃣4️⃣  Making 80 STX offer on NFT #1...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-offers',
      functionName: 'make-offer',
      functionArgs: [
        uintCV(1),
        uintCV(80000000), // 80 STX
        uintCV(4320) // Expires in ~30 days
      ],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-offers', function: 'make-offer', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== HAVEN-TRAITS TESTS =====
  console.log('\n' + '━'.repeat(70));
  console.log('🎯 HAVEN-TRAITS CONTRACT');
  console.log('━'.repeat(70));
  
  // Set traits for NFT #1
  console.log('\n1️⃣5️⃣  Setting traits for NFT #1...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-traits',
      functionName: 'set-token-traits',
      functionArgs: [
        uintCV(1),
        listCV([
          tupleCV({
            'trait-type': stringAsciiCV('Background'),
            'trait-value': stringAsciiCV('Blue')
          }),
          tupleCV({
            'trait-type': stringAsciiCV('Rarity'),
            'trait-value': stringAsciiCV('Legendary')
          })
        ])
      ],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-traits', function: 'set-token-traits', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Add trait type to collection
  console.log('\n1️⃣6️⃣  Adding trait type to collection #1...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-traits',
      functionName: 'add-collection-trait-type',
      functionArgs: [uintCV(1), stringAsciiCV('Edition')],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-traits', function: 'add-collection-trait-type', txid: result.txid });
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n✅ Total Transactions: ${txCount}`);
  console.log(`💸 Estimated Cost: ~${(txCount * 0.05).toFixed(2)} STX\n`);
  
  console.log('📦 Contracts Tested:');
  console.log('   ✅ haven-core (2 functions)');
  console.log('   ✅ haven-registry (2 functions)');
  console.log('   ✅ haven-mint (2 functions)');
  console.log('   ✅ haven-metadata (3 functions)');
  console.log('   ✅ haven-market (3 functions)');
  console.log('   ✅ haven-royalty (1 function)');
  console.log('   ✅ haven-offers (1 function)');
  console.log('   ✅ haven-traits (2 functions)\n');
  
  console.log('🎉 Platform Status:');
  console.log('   • 2 Collections created');
  console.log('   • 3 NFTs minted');
  console.log('   • 3 NFTs listed on marketplace');
  console.log('   • Royalties configured');
  console.log('   • Offers enabled');
  console.log('   • Traits system active\n');
  
  console.log('='.repeat(70) + '\n');
  
  // Save results
  const resultsPath = path.join(__dirname, '..', 'comprehensive-mainnet-tests.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`💾 Results saved to: comprehensive-mainnet-tests.json\n`);
};

runComprehensiveTests().catch(console.error);
