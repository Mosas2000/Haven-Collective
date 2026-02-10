import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "haven-royalty: creator can set royalty configuration",
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
    
    let royaltyBlock = chain.mineBlock([
      Tx.contractCall('haven-royalty', 'set-royalty', [
        types.uint(1),
        types.list([types.principal(wallet1.address), types.principal(wallet2.address)]),
        types.list([types.uint(300), types.uint(200)])
      ], deployer.address)
    ]);
    
    royaltyBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-royalty: can retrieve royalty configuration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(100)
      ], deployer.address),
      Tx.contractCall('haven-royalty', 'set-royalty', [
        types.uint(1),
        types.list([types.principal(wallet1.address)]),
        types.list([types.uint(500)])
      ], deployer.address)
    ]);
    
    let getBlock = chain.mineBlock([
      Tx.contractCall('haven-royalty', 'get-royalty-config', [types.uint(1)], deployer.address)
    ]);
    
    const result = getBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(result['recipients'].length, 1);
  },
});

Clarinet.test({
  name: "haven-royalty: calculates royalty correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(100)
      ], deployer.address),
      Tx.contractCall('haven-royalty', 'set-royalty', [
        types.uint(1),
        types.list([types.principal(wallet1.address)]),
        types.list([types.uint(500)])
      ], deployer.address)
    ]);
    
    let calcBlock = chain.mineBlock([
      Tx.contractCall('haven-royalty', 'calculate-royalty', [
        types.uint(1),
        types.uint(1000000)
      ], deployer.address)
    ]);
    
    calcBlock.receipts[0].result.expectOk().expectUint(50000);
  },
});

Clarinet.test({
  name: "haven-royalty: non-creator cannot set royalty",
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
    
    let royaltyBlock = chain.mineBlock([
      Tx.contractCall('haven-royalty', 'set-royalty', [
        types.uint(1),
        types.list([types.principal(wallet1.address)]),
        types.list([types.uint(500)])
      ], wallet1.address)
    ]);
    
    royaltyBlock.receipts[0].result.expectErr().expectUint(700);
  },
});

Clarinet.test({
  name: "haven-royalty: cannot set royalty above 100%",
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
    
    let royaltyBlock = chain.mineBlock([
      Tx.contractCall('haven-royalty', 'set-royalty', [
        types.uint(1),
        types.list([types.principal(wallet1.address)]),
        types.list([types.uint(10001)])
      ], deployer.address)
    ]);
    
    royaltyBlock.receipts[0].result.expectErr().expectUint(701);
  },
});

Clarinet.test({
  name: "haven-royalty: returns default royalty if not configured",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(100)
      ], deployer.address)
    ]);
    
    let calcBlock = chain.mineBlock([
      Tx.contractCall('haven-royalty', 'calculate-royalty', [
        types.uint(1),
        types.uint(1000000)
      ], deployer.address)
    ]);
    
    calcBlock.receipts[0].result.expectOk().expectUint(50000);
  },
});
