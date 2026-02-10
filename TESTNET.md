# Testnet Configuration Template

Copy this template to `settings/Testnet.toml` and fill in your testnet credentials:

```toml
[network]
name = "testnet"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "<YOUR TESTNET MNEMONIC HERE>"
balance = 100_000_000_000

[accounts.wallet_1]
mnemonic = "<YOUR TESTNET WALLET 1 MNEMONIC HERE>"
balance = 100_000_000_000

[accounts.wallet_2]
mnemonic = "<YOUR TESTNET WALLET 2 MNEMONIC HERE>"
balance = 100_000_000_000
```

## Testnet Environment Variables

Create a `.env` file in the project root with:

```env
TESTNET_MNEMONIC=your testnet mnemonic phrase here
TESTNET_NETWORK=testnet
STACKS_API_URL=https://api.testnet.hiro.so
```

## Deployment Instructions

1. Get testnet STX from the faucet: https://explorer.hiro.so/sandbox/faucet
2. Configure your mnemonic in settings/Testnet.toml or .env
3. Run deployment: `npm run deploy`
4. Monitor deployment at: https://explorer.hiro.so/?chain=testnet

## Network Information

- Network: Stacks Testnet
- API URL: https://api.testnet.hiro.so
- Explorer: https://explorer.hiro.so/?chain=testnet
- Faucet: https://explorer.hiro.so/sandbox/faucet
