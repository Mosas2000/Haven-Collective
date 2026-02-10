import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "haven-offers: can make offer on token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let offerBlock = chain.mineBlock([
      Tx.contractCall('haven-offers', 'make-offer', [
        types.uint(1),
        types.uint(1000000),
        types.uint(100)
      ], wallet2.address)
    ]);
    
    offerBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-offers: can retrieve offers for token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-offers', 'make-offer', [
        types.uint(1),
        types.uint(1000000),
        types.uint(100)
      ], wallet2.address)
    ]);
    
    let getBlock = chain.mineBlock([
      Tx.contractCall('haven-offers', 'get-offers', [types.uint(1)], deployer.address)
    ]);
    
    const result = getBlock.receipts[0].result.expectOk().expectList();
    assertEquals(result.length, 1);
  },
});

Clarinet.test({
  name: "haven-offers: bidder can cancel own offer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-offers', 'make-offer', [
        types.uint(1),
        types.uint(1000000),
        types.uint(100)
      ], wallet2.address)
    ]);
    
    let cancelBlock = chain.mineBlock([
      Tx.contractCall('haven-offers', 'cancel-offer', [
        types.uint(1),
        types.uint(0)
      ], wallet2.address)
    ]);
    
    cancelBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-offers: non-bidder cannot cancel offer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    const wallet3 = accounts.get('wallet_3')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-offers', 'make-offer', [
        types.uint(1),
        types.uint(1000000),
        types.uint(100)
      ], wallet2.address)
    ]);
    
    let cancelBlock = chain.mineBlock([
      Tx.contractCall('haven-offers', 'cancel-offer', [
        types.uint(1),
        types.uint(0)
      ], wallet3.address)
    ]);
    
    cancelBlock.receipts[0].result.expectErr().expectUint(800);
  },
});

Clarinet.test({
  name: "haven-offers: tracks offer count",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    const wallet3 = accounts.get('wallet_3')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-offers', 'make-offer', [types.uint(1), types.uint(1000000), types.uint(100)], wallet2.address),
      Tx.contractCall('haven-offers', 'make-offer', [types.uint(1), types.uint(1500000), types.uint(100)], wallet3.address)
    ]);
    
    let countBlock = chain.mineBlock([
      Tx.contractCall('haven-offers', 'get-offer-count', [types.uint(1)], deployer.address)
    ]);
    
    countBlock.receipts[0].result.expectOk().expectUint(2);
  },
});

Clarinet.test({
  name: "haven-offers: cannot make offer with zero amount",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let offerBlock = chain.mineBlock([
      Tx.contractCall('haven-offers', 'make-offer', [
        types.uint(1),
        types.uint(0),
        types.uint(100)
      ], wallet2.address)
    ]);
    
    offerBlock.receipts[0].result.expectErr().expectUint(803);
  },
});
