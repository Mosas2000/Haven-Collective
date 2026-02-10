const { makeContractCall, broadcastTransaction, AnchorMode, listCV, principalCV, uintCV } = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
require('dotenv').config();

const batchMint = async (collectionId, recipients) => {
  const isMainnet = process.env.NETWORK === 'mainnet';
  const network = isMainnet ? new StacksMainnet() : new StacksTestnet();
  const senderKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!senderKey || !contractAddress) {
    console.error('Error: PRIVATE_KEY or CONTRACT_ADDRESS not set');
    process.exit(1);
  }

  const recipientCVs = recipients.map(addr => principalCV(addr));

  const txOptions = {
    contractAddress,
    contractName: 'haven-mint',
    functionName: 'batch-mint',
    functionArgs: [
      uintCV(collectionId),
      listCV(recipientCVs)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, network);
  
  return result;
};

const executeBatchMint = async () => {
  const collectionId = parseInt(process.env.COLLECTION_ID || '1');
  
  const recipients = [
    'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
    'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
  ];

  try {
    console.log(`Batch minting ${recipients.length} NFTs for collection ${collectionId}...`);
    const result = await batchMint(collectionId, recipients);
    
    if (result.error) {
      console.error('Batch mint failed:', result.error);
    } else {
      console.log('Batch mint successful:', result.txid);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

executeBatchMint().catch(console.error);
