# Haven Collective - Architecture Documentation

## System Overview

Haven Collective is a modular NFT platform built on Stacks blockchain, designed for cost efficiency, parallel execution, and sustained contract activity.

## Contract Architecture

### Core Layer

```
haven-core (Admin & Config)
    ↓
haven-token (NFT Base) ← haven-registry (Collections)
    ↓
haven-mint (Minting Engine)
```

### Metadata Layer

```
haven-metadata (URI Storage)
    ↓
haven-traits (On-chain Attributes)
```

### Marketplace Layer

```
haven-market (Listings & Sales)
    ↓
haven-royalty (Creator Splits) ← haven-registry
    ↓
haven-offers (Bid System)
```

## Contract Specifications

### 1. haven-core.clar
**Purpose:** Platform-wide configuration and admin controls

**State Variables:**
- `admin`: Principal of platform administrator
- `platform-fee-percentage`: Fee charged on sales (default 100 = 1%)
- `platform-paused`: Emergency pause mechanism

**Key Functions:**
- `set-platform-fee(new-fee uint)` - Update platform fee (max 10%)
- `authorize-contract(contract principal)` - Authorize contract for operations
- `toggle-pause()` - Emergency pause/unpause
- `transfer-admin(new-admin principal)` - Transfer admin rights

**Access Control:** Admin-only functions

### 2. haven-token.clar
**Purpose:** Core NFT implementation (SIP-009 compliant)

**Data Structures:**
- `haven-nft`: Non-fungible token definition
- `token-count`: Total minted tokens
- `token-owner`: Map of token ID to owner principal

**Key Functions:**
- `mint(recipient principal)` - Mint new NFT
- `transfer(token-id, sender, recipient)` - Transfer ownership
- `get-owner(token-id)` - Query token owner
- `get-last-token-id()` - Get total minted count

**Design:** Minimal storage, delegates metadata to other contracts

### 3. haven-registry.clar
**Purpose:** Collection management and creator registry

**Data Structures:**
- `collections`: Map of collection ID to metadata
- `creator-collections`: Map of creator to their collection IDs

**Key Functions:**
- `create-collection(name, symbol, max-supply)` - Create new collection
- `update-collection-supply(collection-id, new-supply)` - Increase supply
- `get-collection(collection-id)` - Retrieve collection data
- `get-creator-collections(creator)` - List creator's collections

**Limits:** 50 collections per creator

### 4. haven-mint.clar
**Purpose:** Controlled NFT minting with supply limits

**Data Structures:**
- `collection-minted`: Track minted count per collection
- `authorized-minters`: Map of authorized minter principals

**Key Functions:**
- `mint(collection-id, recipient)` - Mint single NFT
- `batch-mint(collection-id, recipients)` - Mint up to 50 NFTs
- `authorize-minter(minter)` - Grant minting permission
- `revoke-minter(minter)` - Remove minting permission

**Integration:** Validates against registry supply limits

### 5. haven-metadata.clar
**Purpose:** Upgradeable metadata storage

**Data Structures:**
- `token-metadata`: Map of token ID to URI and timestamp
- `metadata-frozen`: Map of tokens with frozen metadata
- `authorized-updaters`: Principals allowed to update metadata

**Key Functions:**
- `set-token-uri(token-id, uri)` - Update metadata URI
- `batch-set-metadata(metadata)` - Batch update up to 50 tokens
- `freeze-metadata(token-id)` - Make metadata immutable
- `authorize-updater(updater)` - Grant update permission

**Features:** Timestamps, freeze mechanism, batch operations

### 6. haven-market.clar
**Purpose:** NFT marketplace with listings and sales

**Data Structures:**
- `listings`: Map of token ID to listing data (seller, price, timestamp)
- `platform-fee`: Percentage fee on sales

**Key Functions:**
- `list-token(token-id, price)` - Create marketplace listing
- `unlist-token(token-id)` - Remove listing
- `purchase-token(token-id)` - Buy listed NFT
- `update-listing-price(token-id, new-price)` - Change price

**Fee Structure:** 1% default platform fee, configurable

### 7. haven-royalty.clar
**Purpose:** Multi-party royalty distribution

**Data Structures:**
- `royalty-config`: Map of collection ID to recipient list and percentages
- `default-royalty`: Fallback royalty (5%)

**Key Functions:**
- `set-royalty(collection-id, recipients, percentages)` - Configure splits
- `calculate-royalty(collection-id, sale-amount)` - Calculate royalty amount
- `distribute-royalty(collection-id, sale-amount)` - Execute distributions

**Limits:** Up to 5 recipients per collection, max 100% total

### 8. haven-offers.clar
**Purpose:** Bid/offer system for unlisted NFTs

**Data Structures:**
- `offers`: Map of token ID to list of offers (bidder, amount, expiration)
- `active-offer-count`: Count of active offers per token

**Key Functions:**
- `make-offer(token-id, amount, duration)` - Create bid
- `cancel-offer(token-id, offer-index)` - Cancel own bid
- `accept-offer(token-id, offer-index)` - Accept bid (owner only)

**Limits:** 20 offers per token, time-based expiration

### 9. haven-traits.clar
**Purpose:** On-chain trait/attribute management

**Data Structures:**
- `token-traits`: Map of token ID to trait list (type, value pairs)
- `collection-trait-types`: Map of collection ID to valid trait types

**Key Functions:**
- `set-token-traits(token-id, traits)` - Set up to 10 traits
- `add-collection-trait-type(collection-id, trait-type)` - Register trait type
- `authorize-setter(setter)` - Grant trait update permission

**Limits:** 10 traits per token, 20 trait types per collection

## Data Flow

### Minting Flow
```
User → haven-mint.mint()
  ↓
Check collection supply (haven-registry)
  ↓
Create NFT (haven-token)
  ↓
Update minted count (haven-mint)
  ↓
Set metadata (haven-metadata)
  ↓
Add traits (haven-traits)
```

### Marketplace Flow
```
Owner → haven-market.list-token()
  ↓
Buyer → haven-market.purchase-token()
  ↓
Calculate platform fee
  ↓
Calculate royalties (haven-royalty)
  ↓
Transfer STX to seller
  ↓
Transfer NFT to buyer (haven-token)
  ↓
Remove listing
```

### Offer Flow
```
Bidder → haven-offers.make-offer()
  ↓
Store offer with expiration
  ↓
Owner → haven-offers.accept-offer()
  ↓
Transfer STX from bidder to owner
  ↓
Transfer NFT from owner to bidder (haven-token)
  ↓
Remove accepted offer
```

## Gas Optimization Strategies

### Storage Optimization
- Minimal data in core contracts
- Separate metadata storage
- Compact data structures
- Efficient map keys

### Batch Operations
- Up to 50 items per batch
- Single transaction overhead
- Parallel execution support
- Reduced per-item cost

### Query Efficiency
- Read-only functions
- No unnecessary storage reads
- Cached frequently accessed data
- Minimal contract-to-contract calls

## Security Model

### Authorization Layers
1. **Contract Owner:** Initial deployer
2. **Admin:** Platform administrator
3. **Authorized Users:** Minters, updaters, setters
4. **Token Owners:** NFT holders
5. **Collection Creators:** Collection admins

### Permission Checks
- Owner verification via tx-sender
- Token ownership validation
- Authorization map lookups
- Creator validation via registry

### Safety Mechanisms
- Supply limit enforcement
- Metadata freeze option
- Emergency pause (haven-core)
- Percentage validation (royalties)

## Integration Points

### External Integrations
- Stacks wallets (Hiro, Xverse)
- NFT marketplaces
- IPFS for metadata storage
- Off-chain rarity calculators

### Contract Interactions
```
External Call → haven-core (auth check)
                    ↓
                haven-token (ownership)
                    ↓
                haven-registry (collection data)
                    ↓
                Business logic contract
```

## Upgrade Strategy

### Upgradeable Components
- Metadata URIs (via haven-metadata)
- Trait definitions (via haven-traits)
- Platform configuration (via haven-core)

### Non-Upgradeable Components
- Core NFT logic (haven-token)
- Collection registry (haven-registry)
- Ownership records

### Migration Path
1. Deploy new contract version
2. Authorize new contract in haven-core
3. Migrate data if needed
4. Update frontend integrations
5. Deprecate old contract

## Performance Characteristics

### Transaction Costs (Testnet)
- Contract deployment: ~0.05-0.1 STX each
- Single mint: ~0.002 STX
- Batch mint (50): ~0.01 STX
- Marketplace listing: ~0.001 STX
- NFT purchase: ~0.003 STX

### Throughput
- Parallel minting: 50+ per block
- Independent marketplace operations
- Concurrent metadata updates
- No blocking dependencies

### Scalability
- Supports unlimited collections
- Unlimited NFTs per collection
- Multiple simultaneous operations
- Horizontal scaling via batching

## Testing Strategy

### Unit Tests
- Function-level testing
- Success and failure cases
- Authorization validation
- Edge case handling

### Integration Tests
- Cross-contract interactions
- End-to-end flows
- State consistency
- Error propagation

### Load Tests
- Batch operation limits
- Parallel execution
- Gas cost validation
- Performance benchmarks

## Maintenance Guidelines

### Regular Monitoring
- Transaction success rates
- Gas cost trends
- Error patterns
- Usage analytics

### Optimization Opportunities
- Batch size tuning
- Fee adjustment
- Storage optimization
- Query caching

### Upgrade Triggers
- Security vulnerabilities
- Performance issues
- Feature requests
- Cost optimization
