const { makeContractDeploy, broadcastTransaction, AnchorMode, PostConditionMode } = require('@stacks/transactions');
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

const getWallet = async () => {
  const wallet = await generateWallet({
    secretKey: MAINNET_MNEMONIC,
    password: ''
  });
  return wallet.accounts[0].stxPrivateKey;
};

const deployHavenTraits = async () => {
  console.log('\n🔧 Deploying haven-traits (fixed) to Mainnet\n');
  
  const senderKey = await getWallet();
  const contractPath = path.join(__dirname, '..', 'contracts', 'optimized', 'haven-traits.clar');
  const codeBody = fs.readFileSync(contractPath, 'utf8');
  
  console.log(`   Size: ${codeBody.length} bytes`);
  console.log(`   Fee: 30000 microSTX (0.03 STX)\n`);
  
  try {
    const txOptions = {
      contractName: 'haven-traits',
      codeBody,
      senderKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 30000,
      postConditionMode: PostConditionMode.Allow
    };

    const transaction = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction(transaction, network);
    
    if (result.error) {
      console.log(`❌ Failed: ${result.error}`);
      console.log(`   Reason: ${result.reason || 'Unknown'}`);
      
      if (result.error.includes('ConflictingNonceInMempool') || result.error.includes('exists')) {
        console.log('\n💡 Contract may already exist or there is a nonce conflict.');
        console.log('   Checking if contract is deployed...\n');
        
        // Check if contract exists
        const checkUrl = 'https://api.testnet.hiro.so/v2/contracts/interface/ST3382F8A75J4XF2VVNHTFTRZ0MNDX9J97NSNK2FD/haven-traits';
        const checkResult = await fetch(checkUrl);
        
        if (checkResult.status === 200) {
          console.log('✅ Contract already exists and is accessible!');
          console.log('   No redeployment needed.');
        } else {
          console.log('⚠️  Contract not found. May need to wait or try again.');
        }
      }
    } else {
      console.log(`✅ Success!`);
      console.log(`   TX: ${result.txid}`);
      console.log(`   View: https://explorer.hiro.so/txid/${result.txid}?chain=testnet\n`);
      console.log('   ⏳ Wait 30-60 seconds for confirmation...');
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
};

deployHavenTraits().catch(console.error);
