import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "haven-market: token owner can list NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let listBlock = chain.mineBlock([
      Tx.contractCall('haven-market', 'list-token', [
        types.uint(1),
        types.uint(1000000)
      ], wallet1.address)
    ]);
    
    listBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-market: can retrieve listing data",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-market', 'list-token', [types.uint(1), types.uint(1000000)], wallet1.address)
    ]);
    
    let getBlock = chain.mineBlock([
      Tx.contractCall('haven-market', 'get-listing', [types.uint(1)], deployer.address)
    ]);
    
    const result = getBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(result['seller'], wallet1.address);
    assertEquals(result['price'], types.uint(1000000));
  },
});

Clarinet.test({
  name: "haven-market: owner can unlist token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-market', 'list-token', [types.uint(1), types.uint(1000000)], wallet1.address),
      Tx.contractCall('haven-market', 'unlist-token', [types.uint(1)], wallet1.address)
    ]);
    
    let checkBlock = chain.mineBlock([
      Tx.contractCall('haven-market', 'is-listed', [types.uint(1)], deployer.address)
    ]);
    
    checkBlock.receipts[0].result.expectOk().expectBool(false);
  },
});

Clarinet.test({
  name: "haven-market: can update listing price",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-market', 'list-token', [types.uint(1), types.uint(1000000)], wallet1.address),
      Tx.contractCall('haven-market', 'update-listing-price', [types.uint(1), types.uint(2000000)], wallet1.address)
    ]);
    
    let checkBlock = chain.mineBlock([
      Tx.contractCall('haven-market', 'get-listing', [types.uint(1)], deployer.address)
    ]);
    
    const result = checkBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(result['price'], types.uint(2000000));
  },
});

Clarinet.test({
  name: "haven-market: non-owner cannot list token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let listBlock = chain.mineBlock([
      Tx.contractCall('haven-market', 'list-token', [types.uint(1), types.uint(1000000)], wallet2.address)
    ]);
    
    listBlock.receipts[0].result.expectErr().expectUint(600);
  },
});

Clarinet.test({
  name: "haven-market: non-owner cannot unlist token",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-market', 'list-token', [types.uint(1), types.uint(1000000)], wallet1.address)
    ]);
    
    let unlistBlock = chain.mineBlock([
      Tx.contractCall('haven-market', 'unlist-token', [types.uint(1)], wallet2.address)
    ]);
    
    unlistBlock.receipts[0].result.expectErr().expectUint(600);
  },
});
