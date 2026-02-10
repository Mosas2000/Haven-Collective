import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "haven-mint: authorized minter can mint NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(100)
      ], deployer.address)
    ]);
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-mint', 'mint', [
        types.uint(1),
        types.principal(wallet1.address)
      ], deployer.address)
    ]);
    
    mintBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-mint: tracks minted count per collection",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(100)
      ], deployer.address)
    ]);
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-mint', 'mint', [types.uint(1), types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-mint', 'mint', [types.uint(1), types.principal(wallet2.address)], deployer.address)
    ]);
    
    let countCheck = chain.mineBlock([
      Tx.contractCall('haven-mint', 'get-minted-count', [types.uint(1)], deployer.address)
    ]);
    
    countCheck.receipts[0].result.expectOk().expectUint(2);
  },
});

Clarinet.test({
  name: "haven-mint: cannot exceed collection supply",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(1)
      ], deployer.address)
    ]);
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-mint', 'mint', [types.uint(1), types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-mint', 'mint', [types.uint(1), types.principal(wallet1.address)], deployer.address)
    ]);
    
    mintBlock.receipts[0].result.expectOk();
    mintBlock.receipts[1].result.expectErr().expectUint(401);
  },
});

Clarinet.test({
  name: "haven-mint: unauthorized user cannot mint",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(100)
      ], deployer.address)
    ]);
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-mint', 'mint', [
        types.uint(1),
        types.principal(wallet1.address)
      ], wallet1.address)
    ]);
    
    mintBlock.receipts[0].result.expectErr().expectUint(400);
  },
});

Clarinet.test({
  name: "haven-mint: can authorize new minter",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(100)
      ], deployer.address),
      Tx.contractCall('haven-mint', 'authorize-minter', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-mint', 'mint', [
        types.uint(1),
        types.principal(wallet2.address)
      ], wallet1.address)
    ]);
    
    mintBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-mint: can revoke minter authorization",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(100)
      ], deployer.address),
      Tx.contractCall('haven-mint', 'authorize-minter', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-mint', 'revoke-minter', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-mint', 'mint', [
        types.uint(1),
        types.principal(wallet2.address)
      ], wallet1.address)
    ]);
    
    mintBlock.receipts[0].result.expectErr().expectUint(400);
  },
});
