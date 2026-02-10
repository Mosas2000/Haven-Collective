const { makeContractCall, broadcastTransaction, AnchorMode, listCV, tupleCV, uintCV, stringAsciiCV } = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
require('dotenv').config();

const setTokenTraits = async (tokenId, traits) => {
  const isMainnet = process.env.NETWORK === 'mainnet';
  const network = isMainnet ? new StacksMainnet() : new StacksTestnet();
  const senderKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!senderKey || !contractAddress) {
    console.error('Error: PRIVATE_KEY or CONTRACT_ADDRESS not set');
    process.exit(1);
  }

  const traitCVs = traits.map(trait => 
    tupleCV({
      'trait-type': stringAsciiCV(trait.type),
      'trait-value': stringAsciiCV(trait.value)
    })
  );

  const txOptions = {
    contractAddress,
    contractName: 'haven-traits',
    functionName: 'set-token-traits',
    functionArgs: [
      uintCV(tokenId),
      listCV(traitCVs)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, network);
  
  return result;
};

const executeBatchTraits = async () => {
  const tokenTraits = [
    { 
      tokenId: 1, 
      traits: [
        { type: 'Background', value: 'Blue' },
        { type: 'Eyes', value: 'Laser' },
        { type: 'Mouth', value: 'Smile' }
      ]
    },
    { 
      tokenId: 2, 
      traits: [
        { type: 'Background', value: 'Red' },
        { type: 'Eyes', value: 'Normal' },
        { type: 'Mouth', value: 'Grin' }
      ]
    },
    { 
      tokenId: 3, 
      traits: [
        { type: 'Background', value: 'Green' },
        { type: 'Eyes', value: 'Closed' },
        { type: 'Mouth', value: 'Neutral' }
      ]
    },
  ];

  try {
    console.log(`Setting traits for ${tokenTraits.length} tokens...`);
    
    const results = await Promise.all(
      tokenTraits.map(async (tt) => {
        try {
          const result = await setTokenTraits(tt.tokenId, tt.traits);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return { tokenId: tt.tokenId, result };
        } catch (error) {
          return { tokenId: tt.tokenId, error: error.message };
        }
      })
    );

    console.log('\n--- Traits Summary ---');
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

executeBatchTraits().catch(console.error);
