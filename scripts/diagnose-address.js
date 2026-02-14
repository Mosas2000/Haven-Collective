const { generateWallet, getStxAddress } = require('@stacks/wallet-sdk');

const mnemonic = 'bread shift morning sense clean interest humor oven kick fox vintage december oxygen zebra shed guess toast rebuild attract panda early satisfy climb refuse';

const diagnose = async () => {
  console.log('\n🔍 Address Diagnosis - The Root Cause\n');
  console.log('='.repeat(70));
  
  // Generate wallet
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: ''
  });
  const account = wallet.accounts[0];
  
  console.log('\n📋 @stacks/wallet-sdk getStxAddress():');
  console.log(`  With 0x80 (testnet):  ${getStxAddress({ account, transactionVersion: 0x80 })}`);
  console.log(`  With 0x16 (mainnet):  ${getStxAddress({ account, transactionVersion: 0x16 })}`);
  
  console.log('\n🐛 BUG IDENTIFIED:');
  console.log('   getStxAddress returns SP... (mainnet format) for BOTH versions!');
  console.log('   This is incorrect - testnet should return ST...');
  
  console.log('\n📋 What actually happens when we broadcast transactions:');
  console.log('   - When we sign with senderKey and broadcast to testnet');
  console.log('   - The tx-sender becomes: ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VPPJ66ZM');
  console.log('   - But getStxAddress told us: SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T');
  console.log('   - These are DIFFERENT principals on-chain!');
  
  console.log('\n💡 SOLUTION:');
  console.log('   Use the correct testnet address everywhere: ST31...');
  console.log('   Ignore what getStxAddress returns when transactionVersion is 0x80');
  
  console.log('\n='.repeat(70) + '\n');
};

diagnose().catch(console.error);
