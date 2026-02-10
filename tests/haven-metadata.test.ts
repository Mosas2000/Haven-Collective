import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "haven-metadata: token owner can set metadata URI",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let metadataBlock = chain.mineBlock([
      Tx.contractCall('haven-metadata', 'set-token-uri', [
        types.uint(1),
        types.ascii("ipfs://QmTest123")
      ], wallet1.address)
    ]);
    
    metadataBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-metadata: can retrieve token metadata",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let metadataBlock = chain.mineBlock([
      Tx.contractCall('haven-metadata', 'set-token-uri', [
        types.uint(1),
        types.ascii("ipfs://QmTest123")
      ], wallet1.address)
    ]);
    
    let retrieveBlock = chain.mineBlock([
      Tx.contractCall('haven-metadata', 'get-token-uri', [types.uint(1)], deployer.address)
    ]);
    
    const result = retrieveBlock.receipts[0].result.expectOk().expectSome();
    assertEquals(result['uri'], "ipfs://QmTest123");
  },
});

Clarinet.test({
  name: "haven-metadata: non-owner cannot set metadata",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let mintBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let metadataBlock = chain.mineBlock([
      Tx.contractCall('haven-metadata', 'set-token-uri', [
        types.uint(1),
        types.ascii("ipfs://QmTest123")
      ], wallet2.address)
    ]);
    
    metadataBlock.receipts[0].result.expectErr().expectUint(500);
  },
});

Clarinet.test({
  name: "haven-metadata: authorized updater can set metadata",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-metadata', 'authorize-updater', [types.principal(wallet2.address)], deployer.address)
    ]);
    
    let metadataBlock = chain.mineBlock([
      Tx.contractCall('haven-metadata', 'set-token-uri', [
        types.uint(1),
        types.ascii("ipfs://QmTest123")
      ], wallet2.address)
    ]);
    
    metadataBlock.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-metadata: can freeze metadata",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-metadata', 'set-token-uri', [
        types.uint(1),
        types.ascii("ipfs://QmTest123")
      ], wallet1.address),
      Tx.contractCall('haven-metadata', 'freeze-metadata', [types.uint(1)], wallet1.address)
    ]);
    
    let frozenCheck = chain.mineBlock([
      Tx.contractCall('haven-metadata', 'is-metadata-frozen', [types.uint(1)], deployer.address)
    ]);
    
    frozenCheck.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-metadata: cannot update frozen metadata",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('haven-metadata', 'set-token-uri', [
        types.uint(1),
        types.ascii("ipfs://QmTest123")
      ], wallet1.address),
      Tx.contractCall('haven-metadata', 'freeze-metadata', [types.uint(1)], wallet1.address)
    ]);
    
    let updateBlock = chain.mineBlock([
      Tx.contractCall('haven-metadata', 'set-token-uri', [
        types.uint(1),
        types.ascii("ipfs://QmNewHash")
      ], wallet1.address)
    ]);
    
    updateBlock.receipts[0].result.expectErr().expectUint(501);
  },
});

Clarinet.test({
  name: "haven-metadata: only owner can freeze metadata",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    let setupBlock = chain.mineBlock([
      Tx.contractCall('haven-token', 'mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    let freezeBlock = chain.mineBlock([
      Tx.contractCall('haven-metadata', 'freeze-metadata', [types.uint(1)], wallet2.address)
    ]);
    
    freezeBlock.receipts[0].result.expectErr().expectUint(500);
  },
});
