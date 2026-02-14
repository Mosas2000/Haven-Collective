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
const DEPLOYER_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';

const getWallet = async () => {
  const wallet = await generateWallet({
    secretKey: MAINNET_MNEMONIC,
    password: ''
  });
  return {
    privateKey: wallet.accounts[0].stxPrivateKey,
    address: wallet.accounts[0].address
  };
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runNewWalletTests = async () => {
  console.log('\n🆕 Haven Collective - New Wallet Transactions');
  console.log('='.repeat(70));
  
  const wallet = await getWallet();
  console.log(`\n📍 Contract Address: ${DEPLOYER_ADDRESS}`);
  console.log(`👤 Your Wallet: ${wallet.address}`);
  console.log(`⚠️  REAL MAINNET - STX WILL BE SPENT!\n`);
  console.log(`Starting in 5 seconds...\n`);
  
  await sleep(5000);
  
  const senderKey = wallet.privateKey;
  const results = [];
  let txCount = 0;
  
  // ===== CREATE NEW COLLECTION =====
  console.log('━'.repeat(70));
  console.log('📚 CREATING YOUR COLLECTION');
  console.log('━'.repeat(70));
  
  console.log('\n1️⃣  Creating "My NFT Collection"...');
  try {
    const tx = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: 'haven-registry',
      functionName: 'create-collection',
      functionArgs: [
        stringAsciiCV('My NFT Collection'),
        stringAsciiCV('MYNFT')
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
  
  // ===== AUTHORIZE YOURSELF AS MINTER =====
  console.log('\n' + '━'.repeat(70));
  console.log('🎨 AUTHORIZING AS MINTER');
  console.log('━'.repeat(70));
  
  console.log('\n2️⃣  Authorizing yourself to mint...');
  try {
    const tx = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: 'haven-mint',
      functionName: 'authorize-minter',
      functionArgs: [
        uintCV(4), // Assuming collection ID 4
        standardPrincipalCV(wallet.address)
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
      results.push({ contract: 'haven-mint', function: 'authorize-minter', txid: result.txid });
      await sleep(30000);
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // ===== MINT YOUR NFTs =====
  console.log('\n' + '━'.repeat(70));
  console.log('🎨 MINTING YOUR NFTs');
  console.log('━'.repeat(70));
  
  for (let i = 7; i <= 10; i++) {
    console.log(`\n3️⃣  Minting NFT #${i}...`);
    try {
      const tx = await makeContractCall({
        contractAddress: DEPLOYER_ADDRESS,
        contractName: 'haven-mint',
        functionName: 'mint',
        functionArgs: [uintCV(4), standardPrincipalCV(wallet.address)],
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
  
  // ===== SET METADATA =====
  console.log('\n' + '━'.repeat(70));
  console.log('📝 SETTING METADATA');
  console.log('━'.repeat(70));
  
  const metadata = [
    { id: 7, uri: 'ipfs://QmMyNFT7Diamond' },
    { id: 8, uri: 'ipfs://QmMyNFT8Platinum' },
    { id: 9, uri: 'ipfs://QmMyNFT9Gold' },
    { id: 10, uri: 'ipfs://QmMyNFT10Silver' }
  ];
  
  for (const meta of metadata) {
    console.log(`\n7️⃣  Setting metadata for NFT #${meta.id}...`);
    try {
      const tx = await makeContractCall({
        contractAddress: DEPLOYER_ADDRESS,
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
  
  // ===== SET TRAITS =====
  console.log('\n' + '━'.repeat(70));
  console.log('🎯 SETTING TRAITS');
  console.log('━'.repeat(70));
  
  const traits = [
    { 
      id: 7, 
      traits: [
        { type: 'Background', value: 'Diamond' },
        { type: 'Rarity', value: 'Mythic' }
      ]
    },
    { 
      id: 8, 
      traits: [
        { type: 'Background', value: 'Platinum' },
        { type: 'Rarity', value: 'Legendary' }
      ]
    },
    { 
      id: 9, 
      traits: [
        { type: 'Background', value: 'Gold' },
        { type: 'Rarity', value: 'Epic' }
      ]
    },
    { 
      id: 10, 
      traits: [
        { type: 'Background', value: 'Silver' },
        { type: 'Rarity', value: 'Rare' }
      ]
    }
  ];
  
  for (const item of traits) {
    console.log(`\n1️⃣1️⃣  Setting traits for NFT #${item.id}...`);
    try {
      const tx = await makeContractCall({
        contractAddress: DEPLOYER_ADDRESS,
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
  
  // ===== SET ROYALTY =====
  console.log('\n' + '━'.repeat(70));
  console.log('💰 SETTING ROYALTY');
  console.log('━'.repeat(70));
  
  console.log('\n1️⃣5️⃣  Setting 7.5% royalty for your collection...');
  try {
    const tx = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: 'haven-royalty',
      functionName: 'set-royalty',
      functionArgs: [
        uintCV(4),
        listCV([standardPrincipalCV(wallet.address)]),
        listCV([uintCV(750)]) // 7.5%
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
  
  // ===== LIST NFTs ON MARKET =====
  console.log('\n' + '━'.repeat(70));
  console.log('🏪 LISTING NFTs ON MARKETPLACE');
  console.log('━'.repeat(70));
  
  const listings = [
    { id: 7, price: 500 },
    { id: 8, price: 300 },
    { id: 9, price: 150 },
    { id: 10, price: 100 }
  ];
  
  for (const listing of listings) {
    console.log(`\n1️⃣6️⃣  Listing NFT #${listing.id} for ${listing.price} STX...`);
    try {
      const tx = await makeContractCall({
        contractAddress: DEPLOYER_ADDRESS,
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
  
  // ===== MAKE OFFERS ON EXISTING NFTs =====
  console.log('\n' + '━'.repeat(70));
  console.log('💵 MAKING OFFERS ON EXISTING NFTs');
  console.log('━'.repeat(70));
  
  const offers = [
    { nft: 2, amount: 70 },
    { nft: 4, amount: 100 },
    { nft: 6, amount: 35 }
  ];
  
  for (const offer of offers) {
    console.log(`\n2️⃣0️⃣  Making ${offer.amount} STX offer on NFT #${offer.nft}...`);
    try {
      const tx = await makeContractCall({
        contractAddress: DEPLOYER_ADDRESS,
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
  
  // ===== UPDATE LISTING PRICES =====
  console.log('\n' + '━'.repeat(70));
  console.log('💲 UPDATING YOUR LISTING PRICES');
  console.log('━'.repeat(70));
  
  const priceUpdates = [
    { nft: 7, price: 450 },
    { nft: 10, price: 110 }
  ];
  
  for (const update of priceUpdates) {
    console.log(`\n2️⃣3️⃣  Updating NFT #${update.nft} to ${update.price} STX...`);
    try {
      const tx = await makeContractCall({
        contractAddress: DEPLOYER_ADDRESS,
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
  
  // ===== FREEZE METADATA FOR PREMIUM NFT =====
  console.log('\n' + '━'.repeat(70));
  console.log('🔒 FREEZING METADATA');
  console.log('━'.repeat(70));
  
  console.log('\n2️⃣5️⃣  Freezing metadata for NFT #7 (Diamond)...');
  try {
    const tx = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: 'haven-metadata',
      functionName: 'freeze-metadata',
      functionArgs: [uintCV(7)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 50000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ contract: 'haven-metadata', function: 'freeze-metadata', nft: 7, txid: result.txid });
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 NEW WALLET ACTIVITY SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n✅ Total Transactions: ${txCount}`);
  console.log(`💸 Estimated Cost: ~${(txCount * 0.05).toFixed(2)} STX\n`);
  
  console.log('🎉 Your Activity:');
  console.log('   • Created "My NFT Collection"');
  console.log('   • Authorized as minter');
  console.log('   • Minted 4 NFTs (#7-#10)');
  console.log('   • Set metadata for all 4 NFTs');
  console.log('   • Set traits for all 4 NFTs');
  console.log('   • Configured 7.5% royalty');
  console.log('   • Listed 4 NFTs on marketplace');
  console.log('   • Made 3 offers on existing NFTs');
  console.log('   • Updated 2 listing prices');
  console.log('   • Froze metadata for premium NFT\n');
  
  console.log('💎 Your NFTs:');
  console.log('   • NFT #7: 450 STX (Diamond/Mythic) 🔒');
  console.log('   • NFT #8: 300 STX (Platinum/Legendary)');
  console.log('   • NFT #9: 150 STX (Gold/Epic)');
  console.log('   • NFT #10: 110 STX (Silver/Rare)\n');
  
  console.log('='.repeat(70) + '\n');
  
  // Save results
  const resultsPath = path.join(__dirname, '..', 'new-wallet-transactions.json');
  fs.writeFileSync(resultsPath, JSON.stringify({ 
    wallet: wallet.address,
    transactions: results 
  }, null, 2));
  console.log(`💾 Results saved to: new-wallet-transactions.json\n`);
};

runNewWalletTests().catch(console.error);
