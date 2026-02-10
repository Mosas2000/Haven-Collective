# Haven Collective Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Configure the following variables:

```env
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_stacks_address_here
NETWORK=testnet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Validate Contracts

```bash
clarinet check
```

All 9 contracts should pass validation.

### 4. Run Tests (Optional)

```bash
clarinet test
```

## Deployment Options

### Option 1: Testnet Deployment

**Step 1: Configure Environment**
```bash
export NETWORK=testnet
```

**Step 2: Deploy Contracts**
```bash
node scripts/deploy-contracts.js
```

**Expected Output:**
- 9 successful contract deployments
- Transaction IDs for each contract
- Total cost: ~0.5-1 STX on testnet

**Step 3: Verify Deployments**
Check each transaction on Stacks Explorer:
```
https://explorer.hiro.so/txid/{transaction-id}?chain=testnet
```

### Option 2: Mainnet Deployment

**Step 1: Prepare Wallet**
- Ensure wallet has 2-3 STX for deployment costs
- Backup private key securely
- Verify wallet address

**Step 2: Configure Environment**
```bash
export NETWORK=mainnet
export PRIVATE_KEY=your_mainnet_private_key
export CONTRACT_ADDRESS=your_mainnet_address
```

**Step 3: Deploy Contracts**
```bash
node scripts/deploy-contracts.js
```

**Step 4: Record Contract Addresses**
Save all deployed contract addresses for future reference.

## Post-Deployment Setup

### 1. Initialize Platform

**Create First Collection:**
```javascript
// Use Stacks.js or contract call
contractCall({
  contractAddress: YOUR_ADDRESS,
  contractName: 'haven-registry',
  functionName: 'create-collection',
  functionArgs: [
    stringAsciiCV("Genesis Collection"),
    stringAsciiCV("GENESIS"),
    uintCV(10000)
  ]
});
```

**Authorize Minters:**
```javascript
contractCall({
  contractAddress: YOUR_ADDRESS,
  contractName: 'haven-mint',
  functionName: 'authorize-minter',
  functionArgs: [principalCV(MINTER_ADDRESS)]
});
```

### 2. Batch Operations

**Mint Initial NFTs:**
```bash
export COLLECTION_ID=1
node scripts/batch-mint.js
```

**Set Metadata:**
```bash
node scripts/batch-metadata.js
```

**Configure Traits:**
```bash
node scripts/batch-traits.js
```

**Create Listings:**
```bash
node scripts/batch-listings.js
```

## Cost Estimates

### Testnet
- Contract Deployment: ~0.5-1 STX total
- Per-contract average: ~0.05-0.1 STX
- Batch minting (50 NFTs): ~0.01 STX
- Metadata updates: ~0.005 STX per batch

### Mainnet
- Contract Deployment: 1-2 STX total
- Per-contract average: ~0.1-0.2 STX
- Batch minting (50 NFTs): ~0.02 STX
- Metadata updates: ~0.01 STX per batch

## Contract Deployment Order

1. haven-core (admin controls)
2. haven-token (NFT base)
3. haven-registry (collections)
4. haven-mint (minting engine)
5. haven-metadata (metadata storage)
6. haven-market (marketplace)
7. haven-royalty (royalty distribution)
8. haven-offers (offer system)
9. haven-traits (trait management)

## Monitoring & Verification

### Check Contract Status
```bash
clarinet console
```

### Verify on Explorer
- Testnet: https://explorer.hiro.so/?chain=testnet
- Mainnet: https://explorer.hiro.so/

### Query Contract Data
```clarity
;; Get collection count
(contract-call? .haven-registry get-collection-count)

;; Get last token ID
(contract-call? .haven-token get-last-token-id)

;; Check platform fee
(contract-call? .haven-core get-platform-fee)
```

## Troubleshooting

### Deployment Failed
1. Check STX balance
2. Verify network configuration
3. Ensure private key is correct
4. Check nonce conflicts

### Transaction Pending
- Wait 10-15 minutes for confirmation
- Check mempool status
- Verify transaction on explorer

### Contract Call Failed
- Verify contract is deployed
- Check function arguments
- Ensure proper authorization
- Validate sender has permissions

## Security Considerations

### Private Key Management
- Never commit private keys to git
- Use environment variables
- Store securely (hardware wallet recommended)
- Use different keys for testnet/mainnet

### Admin Operations
- Transfer admin role after deployment
- Use multi-sig for mainnet admin
- Document all admin actions
- Regular security audits

### Rate Limiting
- Batch operations: 2-3 second delays
- Avoid rapid sequential transactions
- Monitor gas costs
- Use parallel execution wisely

## Maintenance

### Regular Updates
- Monitor contract activity
- Track gas costs
- Update metadata as needed
- Manage authorized users

### Backup Procedures
- Export contract code
- Save deployment addresses
- Document configuration changes
- Maintain transaction history

## Support Resources

- Stacks Documentation: https://docs.stacks.co/
- Clarinet Guide: https://docs.hiro.so/clarinet
- Stacks Explorer: https://explorer.hiro.so/
- GitHub Repository: https://github.com/Mosas2000/Haven-Collective

## Next Steps

1. Deploy to testnet for testing
2. Execute batch operations
3. Monitor transaction costs
4. Optimize based on results
5. Deploy to mainnet when ready
6. Generate sustained activity
7. Track leaderboard metrics
