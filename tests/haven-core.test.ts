import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "haven-core: admin can set platform fee",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-core', 'set-platform-fee', [types.uint(200)], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    
    let feeCheck = chain.mineBlock([
      Tx.contractCall('haven-core', 'get-platform-fee', [], deployer.address)
    ]);
    
    feeCheck.receipts[0].result.expectOk().expectUint(200);
  },
});

Clarinet.test({
  name: "haven-core: non-admin cannot set platform fee",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-core', 'set-platform-fee', [types.uint(200)], wallet1.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(100);
  },
});

Clarinet.test({
  name: "haven-core: cannot set fee above maximum",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-core', 'set-platform-fee', [types.uint(1001)], deployer.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(101);
  },
});

Clarinet.test({
  name: "haven-core: admin can authorize contract",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-core', 'authorize-contract', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    
    let authCheck = chain.mineBlock([
      Tx.contractCall('haven-core', 'is-contract-authorized', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    authCheck.receipts[0].result.expectOk().expectBool(true);
  },
});

Clarinet.test({
  name: "haven-core: admin can toggle pause",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('haven-core', 'toggle-pause', [], deployer.address)
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    
    let pauseCheck = chain.mineBlock([
      Tx.contractCall('haven-core', 'is-platform-paused', [], deployer.address)
    ]);
    
    pauseCheck.receipts[0].result.expectOk().expectBool(true);
  },
});


Clarinet.test({
  name: "haven-core: two-step admin transfer works correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;

    // Step 1: current admin initiates transfer
    let initiate = chain.mineBlock([
      Tx.contractCall(
        'haven-core',
        'initiate-admin-transfer',
        [types.principal(wallet1.address)],
        deployer.address
      )
    ]);

    initiate.receipts[0].result.expectOk().expectBool(true);

    // Step 2: wrong account cannot accept
    let wrongAccept = chain.mineBlock([
      Tx.contractCall(
        'haven-core',
        'accept-admin-role',
        [],
        wallet2.address
      )
    ]);

    wrongAccept.receipts[0].result.expectErr().expectUint(100);

    // Step 3: pending admin accepts
    let accept = chain.mineBlock([
      Tx.contractCall(
        'haven-core',
        'accept-admin-role',
        [],
        wallet1.address
      )
    ]);

    accept.receipts[0].result.expectOk().expectBool(true);

    // Step 4: verify new admin
    let adminCheck = chain.mineBlock([
      Tx.contractCall('haven-core', 'get-admin', [], deployer.address)
    ]);

    adminCheck.receipts[0].result.expectOk().expectPrincipal(wallet1.address);
  },
});

