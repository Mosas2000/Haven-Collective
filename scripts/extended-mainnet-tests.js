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

const runExtendedTests = async () => {
  console.log('\n🚀 Haven Collective - Extended Mainnet Tests (Round 2)');
  console.log('='.repeat(70));
  console.log(`\n📍 Contract Address: ${MAINNET_ADDRESS}`);
  console.log(`⚠️  REAL MAINNET - MORE STX WILL BE SPENT!\n`);
  console.log(`Starting in 5 seconds...\n`);
  
  await sleep(5000);
  
  const senderKey = await getWallet();
  const results = [];
  let txCount = 0;
  
  // ===== MORE MINTING =====
  console.log('━'.repeat(70));
  console.log('🎨 MINTING MORE NFTs');
  console.log('━'.repeat(70));
  
  // Mint NFTs 4, 5, 6
  for (let i = 4; i <= 6; i++) {
    console.log(`\n${i}️⃣  Minting NFT #${i}...`);
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
        results.push({ contract: 'haven-mint', function: 'mint', nft: i, txid: result.txid });
        await sleep(25000);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // ===== METADATA FOR NEW NFTs =====
  console.log('\n' + '━'.repeat(70));
  console.log('📝 SETTING METADATA FOR NEW NFTs');
  console.log('━'.repeat(70));
  
  const metadata = [
    { id: 4, uri: 'ipfs://QmHavenNFT4Rare' },
    { id: 5, uri: 'ipfs://QmHavenNFT5Epic' },
    { id: 6, uri: 'ipfs://QmHavenNFT6Common' }
  ];
  
  for (const meta of metadata) {
    console.log(`\n7️⃣  Setting metadata for NFT #${meta.id}...`);
    try {
      const tx = await makeContractCall({
        contractAddress: MAINNET_ADDRESS,
        contractName: 'haven-metadata',
        functionName: 'set-token-uri',
        functionArgs: [uintCV(meta.id), stringAsciiCV(meta.uri)],
        senderKey, network,
        anchorMode: AnchorMode.Any,
        fee: 50000,
        postConditionMode: PostConditionMode.Allow
      });
      const result = await broadcastTransaction(tx, network);
      if (result.txid) {
        console.log(`   ✅ TX: ${result.txid}`);
        txCount++;
        results.push({ contract: 'haven-metadata', function: 'set-token-uri', nft: meta.id, txid: result.txid });
        await sleep(25000);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // ===== SET TRAITS FOR NEW NFTs =====
  console.log('\n' + '━'.repeat(70));
  console.log('🎯 SETTING TRAITS FOR NEW NFTs');
  console.log('━'.repeat(70));
  
  const traits = [
    { 
      id: 4, 
      traits: [
        { type: 'Background', value: 'Red' },
        { type: 'Rarity', value: 'Rare' }
      ]
    },
    { 
      id: 5, 
      traits: [
        { type: 'Background', value: 'Gold' },
        { type: 'Rarity', value: 'Epic' }
      ]
    },
    { 
      id: 6, 
      traits: [
        { type: 'Background', value: 'Gray' },
        { type: 'Rarity', value: 'Common' }
      ]
    }
  ];
  
  for (const item of traits) {
    console.log(`\n1️⃣0️⃣  Setting traits for NFT #${item.id}...`);
    try {
      const tx = await makeContractCall({
        contractAddress: MAINNET_ADDRESS,
        contractName: 'haven-traits',
        functionName: 'set-token-traits',
        functionArgs: [
          uintCV(item.id),
          listCV(item.traits.map(t => tupleCV({
            'trait-type': stringAsciiCV(t.type),
            'trait-value': stringAsciiCV(t.value)
          })))
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
        results.push({ contract: 'haven-traits', function: 'set-token-traits', nft: item.id, txid: result.txid });
        await sleep(25000);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // ===== LIST NEW NFTs ON MARKET =====
  console.log('\n' + '━'.repeat(70));
  console.log('🏪 LISTING NEW NFTs ON MARKETPLACE');
  console.log('━'.repeat(70));
  
  const listings = [
    { id: 4, price: 120 },
    { id: 5, price: 200 },
    { id: 6, price: 30 }
  ];
  
  for (const listing of listings) {
    console.log(`\n1️⃣3️⃣  Listing NFT #${listing.id} for ${listing.price} STX...`);
    try {
      const tx = await makeContractCall({
        contractAddress: MAINNET_ADDRESS,
        contractName: 'haven-market',
        functionName: 'list-token',
        functionArgs: [uintCV(listing.id), uintCV(listing.price * 1000000)],
        senderKey, network,
        anchorMode: AnchorMode.Any,
        fee: 50000,
        postConditionMode: PostConditionMode.Allow
      });
      const result = await broadcastTransaction(tx, network);
      if (result.txid) {
        console.log(`   ✅ TX: ${result.txid}`);
        txCount++;
        results.push({ contract: 'haven-market', function: 'list-token', nft: listing.id, price: listing.price, txid: result.txid });
        await sleep(25000);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // ===== UNLIST AND RELIST =====
  console.log('\n' + '━'.repeat(70));
  console.log('🔄 UNLIST AND RELIST OPERATIONS');
  console.log('━'.repeat(70));
  
  console.log('\n1️⃣6️⃣  Unlisting NFT #2...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-market',
      functionName: 'unlist-token',
      functionArgs: [uintCV(2)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-market', function: 'unlist-token', nft: 2, txid: result.txid });
      await sleep(25000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  console.log('\n1️⃣7️⃣  Relisting NFT #2 at 85 STX...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-market',
      functionName: 'list-token',
      functionArgs: [uintCV(2), uintCV(85000000)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-market', function: 'list-token', nft: 2, price: 85, txid: result.txid });
      await sleep(25000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== MORE OFFERS =====
  console.log('\n' + '━'.repeat(70));
  console.log('💵 MAKING MORE OFFERS');
  console.log('━'.repeat(70));
  
  const offers = [
    { nft: 3, amount: 60 },
    { nft: 5, amount: 180 }
  ];
  
  for (const offer of offers) {
    console.log(`\n1️⃣8️⃣  Making ${offer.amount} STX offer on NFT #${offer.nft}...`);
    try {
      const tx = await makeContractCall({
        contractAddress: MAINNET_ADDRESS,
        contractName: 'haven-offers',
        functionName: 'make-offer',
        functionArgs: [
          uintCV(offer.nft),
          uintCV(offer.amount * 1000000),
          uintCV(4320)
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
        results.push({ contract: 'haven-offers', function: 'make-offer', nft: offer.nft, amount: offer.amount, txid: result.txid });
        await sleep(25000);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // ===== FREEZE METADATA =====
  console.log('\n' + '━'.repeat(70));
  console.log('🔒 FREEZING METADATA');
  console.log('━'.repeat(70));
  
  console.log('\n2️⃣0️⃣  Freezing metadata for NFT #1...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-metadata',
      functionName: 'freeze-metadata',
      functionArgs: [uintCV(1)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-metadata', function: 'freeze-metadata', nft: 1, txid: result.txid });
      await sleep(25000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== CREATE THIRD COLLECTION =====
  console.log('\n' + '━'.repeat(70));
  console.log('📚 CREATING THIRD COLLECTION');
  console.log('━'.repeat(70));
  
  console.log('\n2️⃣1️⃣  Creating "Rare Editions" collection...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-registry',
      functionName: 'create-collection',
      functionArgs: [
        stringAsciiCV('Rare Editions'),
        stringAsciiCV('RARE')
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
      results.push({ contract: 'haven-registry', function: 'create-collection', collection: 'Rare Editions', txid: result.txid });
      await sleep(25000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== SET ROYALTY FOR NEW COLLECTION =====
  console.log('\n' + '━'.repeat(70));
  console.log('💰 CONFIGURING ROYALTIES');
  console.log('━'.repeat(70));
  
  console.log('\n2️⃣2️⃣  Setting 5% royalty for collection #2...');
  try {
    const tx = await makeContractCall({
      contractAddress: MAINNET_ADDRESS,
      contractName: 'haven-royalty',
      functionName: 'set-royalty',
      functionArgs: [
        uintCV(2),
        listCV([standardPrincipalCV(MAINNET_ADDRESS)]),
        listCV([uintCV(500)])
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
      results.push({ contract: 'haven-royalty', function: 'set-royalty', collection: 2, txid: result.txid });
      await sleep(25000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== ADD MORE TRAIT TYPES =====
  console.log('\n' + '━'.repeat(70));
  console.log('🎯 ADDING MORE TRAIT TYPES');
  console.log('━'.repeat(70));
  
  const traitTypes = ['Clothing', 'Eyes', 'Accessory'];
  
  for (let i = 0; i < traitTypes.length; i++) {
    console.log(`\n2️⃣3️⃣  Adding "${traitTypes[i]}" trait type...`);
    try {
      const tx = await makeContractCall({
        contractAddress: MAINNET_ADDRESS,
        contractName: 'haven-traits',
        functionName: 'add-collection-trait-type',
        functionArgs: [uintCV(1), stringAsciiCV(traitTypes[i])],
        senderKey, network,
        anchorMode: AnchorMode.Any,
        fee: 50000,
        postConditionMode: PostConditionMode.Allow
      });
      const result = await broadcastTransaction(tx, network);
      if (result.txid) {
        console.log(`   ✅ TX: ${result.txid}`);
        txCount++;
        results.push({ contract: 'haven-traits', function: 'add-collection-trait-type', trait: traitTypes[i], txid: result.txid });
        await sleep(25000);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // ===== UPDATE MORE PRICES =====
  console.log('\n' + '━'.repeat(70));
  console.log('💲 UPDATING PRICES');
  console.log('━'.repeat(70));
  
  const priceUpdates = [
    { nft: 3, price: 90 },
    { nft: 6, price: 40 }
  ];
  
  for (const update of priceUpdates) {
    console.log(`\n2️⃣6️⃣  Updating NFT #${update.nft} to ${update.price} STX...`);
    try {
      const tx = await makeContractCall({
        contractAddress: MAINNET_ADDRESS,
        contractName: 'haven-market',
        functionName: 'update-listing-price',
        functionArgs: [uintCV(update.nft), uintCV(update.price * 1000000)],
        senderKey, network,
        anchorMode: AnchorMode.Any,
        fee: 50000,
        postConditionMode: PostConditionMode.Allow
      });
      const result = await broadcastTransaction(tx, network);
      if (result.txid) {
        console.log(`   ✅ TX: ${result.txid}`);
        txCount++;
        results.push({ contract: 'haven-market', function: 'update-listing-price', nft: update.nft, price: update.price, txid: result.txid });
        await sleep(25000);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 EXTENDED TEST SUMMARY (ROUND 2)');
  console.log('='.repeat(70));
  console.log(`\n✅ Total New Transactions: ${txCount}`);
  console.log(`💸 Estimated Cost: ~${(txCount * 0.05).toFixed(2)} STX\n`);
  
  console.log('📦 Additional Activity:');
  console.log('   • 3 more NFTs minted (total: 6)');
  console.log('   • 3 more NFTs with metadata');
  console.log('   • 3 more NFTs with traits');
  console.log('   • 3 more marketplace listings');
  console.log('   • 1 unlist & relist operation');
  console.log('   • 2 more offers placed');
  console.log('   • 1 metadata frozen');
  console.log('   • 1 new collection created (total: 3)');
  console.log('   • Royalties configured for collection #2');
  console.log('   • 3 new trait types added');
  console.log('   • 2 price updates\n');
  
  console.log('🎉 Current Platform Status:');
  console.log('   • 3 Collections total');
  console.log('   • 6 NFTs minted');
  console.log('   • 6 NFTs listed on marketplace');
  console.log('   • Active offers on 3 NFTs');
  console.log('   • 4 trait types available');
  console.log('   • Metadata frozen for genesis NFT\n');
  
  console.log('='.repeat(70) + '\n');
  
  // Save results
  const resultsPath = path.join(__dirname, '..', 'extended-mainnet-tests.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`💾 Results saved to: extended-mainnet-tests.json\n`);
};

runExtendedTests().catch(console.error);
