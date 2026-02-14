const { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, uintCV, standardPrincipalCV } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');

const network = new StacksTestnet();
const contractAddress = 'ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VPPJ66ZM';
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

const transferNFT = async () => {
  console.log('=== Transfer NFT from wallet to deployer ===\n');
  
  const { senderKey, address } = await getWallet();
  console.log(`Wallet address (SP...): ${address}`);
  console.log(`Deployer address (ST...): ${contractAddress}\n`);

  // Transfer NFT from SP31... to ST31...
  console.log('Transferring token #1 from wallet to deployer...');
  
  const txOptions = {
    contractAddress,
    contractName: 'haven-token',
    functionName: 'transfer',
    functionArgs: [
      uintCV(1),
      standardPrincipalCV(address),  // from: wallet
      standardPrincipalCV(contractAddress)  // to: deployer
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 50000,
    postConditionMode: PostConditionMode.Allow
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, network);
    
    if (result.error) {
      console.log(`❌ Transfer failed: ${result.error}`);
    } else {
      console.log(`✓ Transfer TX: ${result.txid}`);
      console.log(`  View: https://explorer.hiro.so/txid/${result.txid}?chain=testnet\n`);
      console.log('✅ After transfer confirms, token #1 will be owned by ST31...');
      console.log('   Then list-token will work because tx-sender will match token owner!');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
};

transferNFT().catch(console.error);
