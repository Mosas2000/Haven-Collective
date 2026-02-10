const { makeContractCall, broadcastTransaction, AnchorMode, listCV, tupleCV, uintCV, stringAsciiCV } = require('@stacks/transactions');
const { StacksTestnet, StacksMainnet } = require('@stacks/network');
require('dotenv').config();

const batchSetMetadata = async (metadataList) => {
  const isMainnet = process.env.NETWORK === 'mainnet';
  const network = isMainnet ? new StacksMainnet() : new StacksTestnet();
  const senderKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!senderKey || !contractAddress) {
    console.error('Error: PRIVATE_KEY or CONTRACT_ADDRESS not set');
    process.exit(1);
  }

  const metadataCVs = metadataList.map(meta => 
    tupleCV({
      'token-id': uintCV(meta.tokenId),
      'uri': stringAsciiCV(meta.uri)
    })
  );

  const txOptions = {
    contractAddress,
    contractName: 'haven-metadata',
    functionName: 'batch-set-metadata',
    functionArgs: [listCV(metadataCVs)],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, network);
  
  return result;
};

const executeMetadataUpdate = async () => {
  const metadata = [
    { tokenId: 1, uri: 'ipfs://QmHash1' },
    { tokenId: 2, uri: 'ipfs://QmHash2' },
    { tokenId: 3, uri: 'ipfs://QmHash3' },
  ];

  try {
    console.log(`Batch updating metadata for ${metadata.length} tokens...`);
    const result = await batchSetMetadata(metadata);
    
    if (result.error) {
      console.error('Batch metadata update failed:', result.error);
    } else {
      console.log('Batch metadata update successful:', result.txid);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

executeMetadataUpdate().catch(console.error);
