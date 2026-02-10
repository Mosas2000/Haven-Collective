const { makeContractCall, broadcastTransaction, AnchorMode, uintCV } = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
require('dotenv').config();

const createListing = async (tokenId, price) => {
  const isMainnet = process.env.NETWORK === 'mainnet';
  const network = isMainnet ? new StacksMainnet() : new StacksTestnet();
  const senderKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!senderKey || !contractAddress) {
    console.error('Error: PRIVATE_KEY or CONTRACT_ADDRESS not set');
    process.exit(1);
  }

  const txOptions = {
    contractAddress,
    contractName: 'haven-market',
    functionName: 'list-token',
    functionArgs: [
      uintCV(tokenId),
      uintCV(price)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, network);
  
  return result;
};

const executeBatchListings = async () => {
  const listings = [
    { tokenId: 1, price: 1000000 },
    { tokenId: 2, price: 2000000 },
    { tokenId: 3, price: 1500000 },
  ];

  try {
    console.log(`Creating ${listings.length} marketplace listings...`);
    
    const results = await Promise.all(
      listings.map(async (listing) => {
        try {
          const result = await createListing(listing.tokenId, listing.price);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { tokenId: listing.tokenId, result };
        } catch (error) {
          return { tokenId: listing.tokenId, error: error.message };
        }
      })
    );

    console.log('\n--- Listing Summary ---');
    results.forEach(({ tokenId, result, error }) => {
      if (error) {
        console.log(`✗ Token ${tokenId}: ${error}`);
      } else if (result.error) {
        console.log(`✗ Token ${tokenId}: ${result.error}`);
      } else {
        console.log(`✓ Token ${tokenId}: ${result.txid}`);
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
};

executeBatchListings().catch(console.error);
