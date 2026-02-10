import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "haven-registry: can create collection",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectUint(1);
  },
});

Clarinet.test({
  name: "haven-registry: collection count increments",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Collection 1"),
        types.ascii("COL1"),
        types.uint(500)
      ], deployer.address),
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Collection 2"),
        types.ascii("COL2"),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectUint(1);
    block.receipts[1].result.expectOk().expectUint(2);
    
    let countCheck = chain.mineBlock([
      Tx.contractCall('haven-registry', 'get-collection-count', [], deployer.address)
    ]);
    
    countCheck.receipts[0].result.expectOk().expectUint(2);
  },
});

Clarinet.test({
  name: "haven-registry: can retrieve collection data",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let createBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    let retrieveBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'get-collection', [types.uint(1)], deployer.address)
    ]);
    
    const result = retrieveBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(result['creator'], deployer.address);
    assertEquals(result['name'], "Test Collection");
    assertEquals(result['symbol'], "TEST");
    assertEquals(result['total-supply'], types.uint(1000));
  },
});

Clarinet.test({
  name: "haven-registry: creator can update collection supply",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let createBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    let updateBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'update-collection-supply', [
        types.uint(1),
        types.uint(2000)
      ], deployer.address)
    ]);
    
    updateBlock.receipts[0].result.expectOk().expectBool(true);
    
    let retrieveBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'get-collection', [types.uint(1)], deployer.address)
    ]);
    
    const result = retrieveBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(result['total-supply'], types.uint(2000));
  },
});

Clarinet.test({
  name: "haven-registry: non-creator cannot update collection supply",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let createBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    let updateBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'update-collection-supply', [
        types.uint(1),
        types.uint(2000)
      ], wallet1.address)
    ]);
    
    updateBlock.receipts[0].result.expectErr().expectUint(300);
  },
});

Clarinet.test({
  name: "haven-registry: cannot create collection with zero supply",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(0)
      ], deployer.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(302);
  },
});

Clarinet.test({
  name: "haven-registry: tracks creator collections",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let createBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Collection 1"),
        types.ascii("COL1"),
        types.uint(500)
      ], deployer.address),
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Collection 2"),
        types.ascii("COL2"),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    let retrieveBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'get-creator-collections', [types.principal(deployer.address)], deployer.address)
    ]);
    
    const result = retrieveBlock.receipts[0].result.expectOk().expectList();
    assertEquals(result.length, 2);
  },
});
