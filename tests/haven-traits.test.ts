import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "haven-traits: token owner can set traits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let traitsBlock = chain.mineBlock([
      Tx.contractCall('haven-traits', 'set-token-traits', [
        types.uint(1),
        types.list([
          types.tuple({
            'trait-type': types.ascii("Background"),
            'trait-value': types.ascii("Blue")
          })
        ])
      ], wallet1.address)
    ]);
    
    traitsBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-traits: can retrieve token traits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-traits', 'set-token-traits', [
        types.uint(1),
        types.list([
          types.tuple({
            'trait-type': types.ascii("Background"),
            'trait-value': types.ascii("Blue")
          })
        ])
      ], wallet1.address)
    ]);
    
    let getBlock = chain.mineBlock([
      Tx.contractCall('haven-traits', 'get-token-traits', [types.uint(1)], deployer.address)
    ]);
    
    const result = getBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(result.length, 1);
  },
});

Clarinet.test({
  name: "haven-traits: non-owner cannot set traits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let traitsBlock = chain.mineBlock([
      Tx.contractCall('haven-traits', 'set-token-traits', [
        types.uint(1),
        types.list([
          types.tuple({
            'trait-type': types.ascii("Background"),
            'trait-value': types.ascii("Blue")
          })
        ])
      ], wallet2.address)
    ]);
    
    traitsBlock.receipts[0].result.expectErr().expectUint(900);
  },
});

Clarinet.test({
  name: "haven-traits: authorized setter can set traits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-traits', 'authorize-setter', [types.principal(wallet2.address)], deployer.address)
    ]);
    
    let traitsBlock = chain.mineBlock([
      Tx.contractCall('haven-traits', 'set-token-traits', [
        types.uint(1),
        types.list([
          types.tuple({
            'trait-type': types.ascii("Background"),
            'trait-value': types.ascii("Blue")
          })
        ])
      ], wallet2.address)
    ]);
    
    traitsBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-traits: creator can add collection trait types",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(100)
      ], deployer.address)
    ]);
    
    let traitTypeBlock = chain.mineBlock([
      Tx.contractCall('haven-traits', 'add-collection-trait-type', [
        types.uint(1),
        types.ascii("Background")
      ], deployer.address)
    ]);
    
    traitTypeBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-traits: can retrieve collection trait types",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-registry', 'create-collection', [
        types.ascii("Test Collection"),
        types.ascii("TEST"),
        types.uint(100)
      ], deployer.address),
      Tx.contractCall('haven-traits', 'add-collection-trait-type', [
        types.uint(1),
        types.ascii("Background")
      ], deployer.address),
      Tx.contractCall('haven-traits', 'add-collection-trait-type', [
        types.uint(1),
        types.ascii("Eyes")
      ], deployer.address)
    ]);
    
    let getBlock = chain.mineBlock([
      Tx.contractCall('haven-traits', 'get-collection-trait-types', [types.uint(1)], deployer.address)
    ]);
    
    const result = getBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(result.length, 2);
  },
});

Clarinet.test({
  name: "haven-traits: non-creator cannot add trait types",
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
    
    let traitTypeBlock = chain.mineBlock([
      Tx.contractCall('haven-traits', 'add-collection-trait-type', [
        types.uint(1),
        types.ascii("Background")
      ], wallet1.address)
    ]);
    
    traitTypeBlock.receipts[0].result.expectErr().expectUint(900);
  },
});

Clarinet.test({
  name: "haven-traits: can set multiple traits on token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let traitsBlock = chain.mineBlock([
      Tx.contractCall('haven-traits', 'set-token-traits', [
        types.uint(1),
        types.list([
          types.tuple({
            'trait-type': types.ascii("Background"),
            'trait-value': types.ascii("Blue")
          }),
          types.tuple({
            'trait-type': types.ascii("Eyes"),
            'trait-value': types.ascii("Laser")
          }),
          types.tuple({
            'trait-type': types.ascii("Mouth"),
            'trait-value': types.ascii("Smile")
          })
        ])
      ], wallet1.address)
    ]);
    
    traitsBlock.receipts[0].result.expectOk().expectBool(true);
    
    let getBlock = chain.mineBlock([
      Tx.contractCall('haven-traits', 'get-token-traits', [types.uint(1)], deployer.address)
    ]);
    
    const result = getBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(result.length, 3);
  },
});
