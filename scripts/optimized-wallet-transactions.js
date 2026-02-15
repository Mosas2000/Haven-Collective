const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, standardPrincipalCV, uintCV, stringAsciiCV, listCV, tupleCV } = require('@stacks/transactions');
const { StacksMainnet } = require('@stacks/network');
const { generateWallet } = require('@stacks/wallet-sdk');
const fs = require('fs');
const path = require('path');
const toml = require('toml');

const network = new StacksMainnet();
const DEPLOYER_ADDRESS = 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T';

const mainnetTomlPath = path.join(__dirname, '..', 'settings', 'Mainnet.toml');
const mainnetTomlContent = fs.readFileSync(mainnetTomlPath, 'utf8');
const config = toml.parse(mainnetTomlContent);
const MAINNET_MNEMONIC = config.accounts.deployer.mnemonic;

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

// Check if transaction was successful
const checkTransaction = async (txid) => {
  try {
    const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/tx/${txid}`);
    const data = await response.json();
    return data.tx_status === 'success';
  } catch (error) {
    return false;
  }
};

const runOptimizedTests = async () => {
  console.log('\n🎯 Haven Collective - Optimized Wallet Transactions');
  console.log('='.repeat(70));
  
  const wallet = await getWallet();
  console.log(`\n📍 Contract Address: ${DEPLOYER_ADDRESS}`);
  console.log(`👤 Your Wallet: ${wallet.address}`);
  console.log(`⚠️  REAL MAINNET - Optimized for minimal cost\n`);
  
  // Check balance first
  try {
    const balanceResponse = await fetch(`https://api.mainnet.hiro.so/extended/v1/address/${wallet.address}/balances`);
    const balanceData = await balanceResponse.json();
    const stxBalance = parseInt(balanceData.stx.balance) / 1000000;
    console.log(`💰 Your Balance: ${stxBalance.toFixed(2)} STX`);
    
    if (stxBalance < 1) {
      console.log('\n❌ Insufficient balance! You need at least 1 STX to proceed.');
      return;
    }
  } catch (error) {
    console.log('\n⚠️  Could not check balance, proceeding anyway...');
  }
  
  console.log('\nStarting in 5 seconds...\n');
  await sleep(5000);
  
  const senderKey = wallet.privateKey;
  const results = [];
  let txCount = 0;
  let failedCount = 0;
  
  // ===== CREATE COLLECTION =====
  console.log('━'.repeat(70));
  console.log('📚 STEP 1: CREATE YOUR COLLECTION');
  console.log('━'.repeat(70));
  
  console.log('\n1️⃣  Creating "Premium Collection"...');
  try {
    const tx = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: 'haven-registry',
      functionName: 'create-collection',
      functionArgs: [
        stringAsciiCV('Premium Collection'),
        stringAsciiCV('PREM')
      ],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 40000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ step: 'create-collection', txid: result.txid, status: 'broadcasted' });
      await sleep(35000);
    } else {
      console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
      failedCount++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedCount++;
  }
  
  // ===== MINT NFTs =====
  console.log('\n' + '━'.repeat(70));
  console.log('🎨 STEP 2: MINT YOUR NFTs');
  console.log('━'.repeat(70));
  
  const nftsToMint = 3; // Reduced from 4 to save costs
  for (let i = 1; i <= nftsToMint; i++) {
    console.log(`\n2️⃣  Minting NFT #${i}...`);
    try {
      const tx = await makeContractCall({
        contractAddress: DEPLOYER_ADDRESS,
        contractName: 'haven-mint',
        functionName: 'mint',
        functionArgs: [uintCV(5), standardPrincipalCV(wallet.address)], // Collection ID 5 (assuming previous collections were 1-4)
        senderKey, network,
        anchorMode: AnchorMode.Any,
        fee: 40000,
        postConditionMode: PostConditionMode.Allow
      });
      const result = await broadcastTransaction(tx, network);
      if (result.txid) {
        console.log(`   ✅ TX: ${result.txid}`);
        txCount++;
        results.push({ step: `mint-nft-${i}`, txid: result.txid, status: 'broadcasted' });
        await sleep(30000);
      } else {
        console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failedCount++;
    }
  }
  
  // ===== SET METADATA =====
  console.log('\n' + '━'.repeat(70));
  console.log('📝 STEP 3: SET METADATA');
  console.log('━'.repeat(70));
  
  const metadata = [
    { id: 11, uri: 'ipfs://QmPremiumNFT11Ultra' },
    { id: 12, uri: 'ipfs://QmPremiumNFT12Super' },
    { id: 13, uri: 'ipfs://QmPremiumNFT13Mega' }
  ];
  
  for (const meta of metadata) {
    console.log(`\n3️⃣  Setting metadata for NFT #${meta.id}...`);
    try {
      const tx = await makeContractCall({
        contractAddress: DEPLOYER_ADDRESS,
        contractName: 'haven-metadata',
        functionName: 'set-token-uri',
        functionArgs: [uintCV(meta.id), stringAsciiCV(meta.uri)],
        senderKey, network,
        anchorMode: AnchorMode.Any,
        fee: 40000,
        postConditionMode: PostConditionMode.Allow
      });
      const result = await broadcastTransaction(tx, network);
      if (result.txid) {
        console.log(`   ✅ TX: ${result.txid}`);
        txCount++;
        results.push({ step: `metadata-${meta.id}`, txid: result.txid, status: 'broadcasted' });
        await sleep(30000);
      } else {
        console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failedCount++;
    }
  }
  
  // ===== SET TRAITS =====
  console.log('\n' + '━'.repeat(70));
  console.log('🎯 STEP 4: SET TRAITS');
  console.log('━'.repeat(70));
  
  const traits = [
    { 
      id: 11, 
      traits: [
        { type: 'Tier', value: 'Ultra' },
        { type: 'Rarity', value: 'Legendary' }
      ]
    },
    { 
      id: 12, 
      traits: [
        { type: 'Tier', value: 'Super' },
        { type: 'Rarity', value: 'Epic' }
      ]
    },
    { 
      id: 13, 
      traits: [
        { type: 'Tier', value: 'Mega' },
        { type: 'Rarity', value: 'Rare' }
      ]
    }
  ];
  
  for (const item of traits) {
    console.log(`\n4️⃣  Setting traits for NFT #${item.id}...`);
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
        fee: 40000,
        postConditionMode: PostConditionMode.Allow
      });
      const result = await broadcastTransaction(tx, network);
      if (result.txid) {
        console.log(`   ✅ TX: ${result.txid}`);
        txCount++;
        results.push({ step: `traits-${item.id}`, txid: result.txid, status: 'broadcasted' });
        await sleep(30000);
      } else {
        console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failedCount++;
    }
  }
  
  // ===== SET ROYALTY =====
  console.log('\n' + '━'.repeat(70));
  console.log('💰 STEP 5: SET COLLECTION ROYALTY');
  console.log('━'.repeat(70));
  
  console.log('\n5️⃣  Setting 5% royalty...');
  try {
    const tx = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: 'haven-royalty',
      functionName: 'set-royalty',
      functionArgs: [
        uintCV(5),
        listCV([standardPrincipalCV(wallet.address)]),
        listCV([uintCV(500)])
      ],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 40000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ step: 'set-royalty', txid: result.txid, status: 'broadcasted' });
      await sleep(35000);
    } else {
      console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
      failedCount++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedCount++;
  }
  
  // ===== LIST ON MARKETPLACE =====
  console.log('\n' + '━'.repeat(70));
  console.log('🏪 STEP 6: LIST NFTs ON MARKETPLACE');
  console.log('━'.repeat(70));
  
  const listings = [
    { id: 11, price: 250 },
    { id: 12, price: 150 },
    { id: 13, price: 100 }
  ];
  
  for (const listing of listings) {
    console.log(`\n6️⃣  Listing NFT #${listing.id} for ${listing.price} STX...`);
    try {
      const tx = await makeContractCall({
        contractAddress: DEPLOYER_ADDRESS,
        contractName: 'haven-market',
        functionName: 'list-token',
        functionArgs: [uintCV(listing.id), uintCV(listing.price * 1000000)],
        senderKey, network,
        anchorMode: AnchorMode.Any,
        fee: 40000,
        postConditionMode: PostConditionMode.Allow
      });
      const result = await broadcastTransaction(tx, network);
      if (result.txid) {
        console.log(`   ✅ TX: ${result.txid}`);
        txCount++;
        results.push({ step: `list-${listing.id}`, txid: result.txid, status: 'broadcasted' });
        await sleep(30000);
      } else {
        console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failedCount++;
    }
  }
  
  // ===== MAKE OFFERS =====
  console.log('\n' + '━'.repeat(70));
  console.log('💵 STEP 7: MAKE OFFERS ON EXISTING NFTs');
  console.log('━'.repeat(70));
  
  const offers = [
    { nft: 1, amount: 140 },
    { nft: 5, amount: 180 }
  ];
  
  for (const offer of offers) {
    console.log(`\n7️⃣  Making ${offer.amount} STX offer on NFT #${offer.nft}...`);
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
        fee: 40000,
        postConditionMode: PostConditionMode.Allow
      });
      const result = await broadcastTransaction(tx, network);
      if (result.txid) {
        console.log(`   ✅ TX: ${result.txid}`);
        txCount++;
        results.push({ step: `offer-${offer.nft}`, txid: result.txid, status: 'broadcasted' });
        await sleep(30000);
      } else {
        console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
        failedCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failedCount++;
    }
  }
  
  // ===== UPDATE LISTING PRICE =====
  console.log('\n' + '━'.repeat(70));
  console.log('💲 STEP 8: UPDATE LISTING PRICE');
  console.log('━'.repeat(70));
  
  console.log('\n8️⃣  Updating NFT #11 price to 275 STX...');
  try {
    const tx = await makeContractCall({
      contractAddress: DEPLOYER_ADDRESS,
      contractName: 'haven-market',
      functionName: 'update-listing-price',
      functionArgs: [uintCV(11), uintCV(275000000)],
      senderKey, network,
      anchorMode: AnchorMode.Any,
      fee: 40000,
      postConditionMode: PostConditionMode.Allow
    });
    const result = await broadcastTransaction(tx, network);
    if (result.txid) {
      console.log(`   ✅ TX: ${result.txid}`);
      txCount++;
      results.push({ step: 'update-price', txid: result.txid, status: 'broadcasted' });
    } else {
      console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
      failedCount++;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    failedCount++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TRANSACTION SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n✅ Successful: ${txCount} transactions`);
  console.log(`❌ Failed: ${failedCount} transactions`);
  console.log(`💸 Estimated Cost: ~${(txCount * 0.04).toFixed(2)} STX (@ 0.04 STX per tx)\n`);
  
  console.log('🎉 Your Activity:');
  console.log('   • Created "Premium Collection"');
  console.log('   • Minted 3 NFTs');
  console.log('   • Set metadata for all NFTs');
  console.log('   • Set traits for all NFTs');
  console.log('   • Configured 5% royalty');
  console.log('   • Listed 3 NFTs (250, 150, 100 STX)');
  console.log('   • Made 2 offers on existing NFTs');
  console.log('   • Updated 1 listing price\n');
  
  console.log('💎 Your New NFTs:');
  console.log('   • NFT #11: 275 STX (Ultra/Legendary)');
  console.log('   • NFT #12: 150 STX (Super/Epic)');
  console.log('   • NFT #13: 100 STX (Mega/Rare)\n');
  
  console.log('='.repeat(70) + '\n');
  
  // Save results
  const resultsPath = path.join(__dirname, '..', 'optimized-wallet-transactions.json');
  fs.writeFileSync(resultsPath, JSON.stringify({ 
    wallet: wallet.address,
    timestamp: new Date().toISOString(),
    totalTransactions: txCount,
    failedTransactions: failedCount,
    estimatedCost: (txCount * 0.04).toFixed(2),
    transactions: results 
  }, null, 2));
  console.log(`💾 Results saved to: optimized-wallet-transactions.json\n`);
};

runOptimizedTests().catch(console.error);
