import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "haven-token: can mint NFT to recipient",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectUint(1);
  },
});

Clarinet.test({
  name: "haven-token: token count increments correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet2.address)], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectUint(1);
    block.receipts[1].result.expectOk().expectUint(2);
    
    let countCheck = chain.mineBlock([
      Tx.contractCall('haven-token', 'get-last-token-id', [], deployer.address)
    ]);
    
    countCheck.receipts[0].result.expectOk().expectUint(2);
  },
});

Clarinet.test({
  name: "haven-token: owner can transfer token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    mintBlock.receipts[0].result.expectOk().expectUint(1);
    
    let transferBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'transfer', [
        types.uint(1),
        types.principal(wallet1.address),
        types.principal(wallet2.address)
      ], wallet1.address)
    ]);
    
    transferBlock.receipts[0].result.expectOk().expectBool(true);
    
    let ownerCheck = chain.mineBlock([
      Tx.contractCall('haven-token', 'get-owner', [types.uint(1)], deployer.address)
    ]);
    
    ownerCheck.receipts[0].result.expectOk().expectSome().expectPrincipal(wallet2.address);
  },
});

Clarinet.test({
  name: "haven-token: non-owner cannot transfer token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let transferBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'transfer', [
        types.uint(1),
        types.principal(wallet1.address),
        types.principal(wallet2.address)
      ], wallet2.address)
    ]);
    
    transferBlock.receipts[0].result.expectErr().expectUint(200);
  },
});

Clarinet.test({
  name: "haven-token: get-token-uri returns metadata URI",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-token', 'get-token-uri', [types.uint(1)], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectSome();
  },
});
