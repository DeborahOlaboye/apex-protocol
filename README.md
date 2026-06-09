# Apex Protocol

**Decentralized Perpetual Futures on Bitcoin**

Apex Protocol is a non-custodial perpetual futures trading protocol built on the Stacks blockchain. It enables leveraged trading of Bitcoin-native assets using sBTC and STX as collateral, with Bitcoin-final settlement through the Nakamoto upgrade.

---

## Table of Contents

1. [Overview](#overview)
2. [Why Perpetuals on Stacks](#why-perpetuals-on-stacks)
3. [Architecture](#architecture)
4. [Contracts](#contracts)
5. [Oracle System](#oracle-system)
6. [Margin and Collateral](#margin-and-collateral)
7. [Funding Rate Mechanism](#funding-rate-mechanism)
8. [Position Lifecycle](#position-lifecycle)
9. [Liquidation Mechanics](#liquidation-mechanics)
10. [Technical Specifications](#technical-specifications)
11. [Getting Started](#getting-started)
12. [Usage Examples](#usage-examples)
13. [Roadmap](#roadmap)
14. [Contributing](#contributing)
15. [License](#license)

---

## Overview

Apex Protocol brings institutional-grade perpetual futures to Bitcoin Layer 2. Traders can open leveraged long or short positions on BTC/USD and STX/USD with up to 20x leverage, using sBTC (Bitcoin-backed 1:1) or STX as collateral.

**Core features:**
- Up to 20x leverage on BTC and STX perpetuals
- sBTC and STX as collateral assets
- 8-hour funding rate mechanism aligned to spot prices
- Permissionless liquidations with bonus incentives
- Bitcoin-final settlement via Stacks Nakamoto upgrade

---

## Why Perpetuals on Stacks

### The Gap

Bitcoin has $1T+ in market cap but zero native derivatives. Existing BTC perpetuals run on Ethereum (dYdX, GMX) or CEXs — neither gives Bitcoin-native collateral or Bitcoin-final settlement.

### Stacks Advantages

| Feature | Stacks | Ethereum L2 |
|---|---|---|
| Collateral | sBTC (real Bitcoin) | WBTC (bridged) |
| Settlement | Bitcoin finality | Optimistic or ZK rollup |
| Block time | 5-10s (post-Nakamoto) | ~2s |
| Smart contracts | Clarity (decidable) | Solidity (Turing-complete) |
| Identity | BNS .btc names | ENS |

### sBTC as Collateral

sBTC is a 1:1 Bitcoin-backed asset on Stacks, with $545M TVL. Using sBTC as margin means your collateral is real Bitcoin secured by the Bitcoin network, not a bridged synthetic with custodian risk.

### Clarity Safety

Clarity is intentionally Turing-incomplete. You can statically analyze whether a contract will run out of gas, whether arithmetic will overflow, and what state transitions are possible. This is ideal for financial contracts where predictability is critical.

---

## Architecture

```
+-------------------------------------------------------------------+
|                        Apex Protocol                              |
|                                                                   |
|  +-----------+    +------------------+    +-------------------+  |
|  |  Oracle   |--->|  Clearing House  |--->| Liquidation Engine|  |
|  |           |    |                  |    |                   |  |
|  | BTC/USD   |    | open-position    |    | is-liquidatable   |  |
|  | STX/USD   |    | close-position   |    | liquidate         |  |
|  | staleness |    | unrealized-pnl   |    | insurance fund    |  |
|  +-----------+    | margin-ratio     |    +-------------------+  |
|                   +--------+---------+                            |
|                            |                                      |
|  +-------------------------v---------------------------------+    |
|  |                   Margin Manager                          |    |
|  |                                                           |    |
|  | deposit-stx / deposit-sbtc    lock-collateral             |    |
|  | withdraw                      unlock-collateral           |    |
|  | transfer-collateral (P&L)     per-user balances           |    |
|  +-----------------------------------------------------------+    |
|                                                                   |
|  +-----------------------------------------------------------+   |
|  |                    Funding Rate                            |   |
|  | calculate-funding-rate (mark vs index)                    |   |
|  | apply-funding every 150 blocks (~8 hours)                 |   |
|  | cumulative rate tracking for per-position P&L             |   |
|  +-----------------------------------------------------------+   |
+-------------------------------------------------------------------+
```

**Data flow for open-position:**
1. Trader calls `clearing-house::open-position`
2. Clearing house fetches live price from `oracle::get-price`
3. Validates leverage: `notional / margin <= max-leverage`
4. Calls `margin-manager::lock-collateral` to freeze margin
5. Records entry price and entry funding rate cumulative in positions map
6. Updates market open interest (long or short bucket)

---

## Contracts

### `oracle.clar`

Price feed management with staleness protection. Authorized oracles submit prices on-chain. Any price older than `STALE-THRESHOLD` (150 blocks, ~25 minutes) is rejected to prevent stale-price exploits.

**Key functions:** `submit-price`, `get-price` (with staleness guard), `add-oracle`, `remove-oracle`

---

### `margin-manager.clar`

Custodian for all user collateral. Tracks `{amount, locked}` per user per asset. Authorized contracts (clearing house, liquidation engine) can lock, unlock, and transfer balances atomically — the balance never leaves the contract until an explicit withdraw.

**Key functions:** `deposit-stx`, `deposit-sbtc`, `withdraw`, `lock-collateral`, `unlock-collateral`, `transfer-collateral`

---

### `funding-rate.clar`

8-hour periodic funding between longs and shorts. Rate = `(mark - index) / index` in basis points, clamped to +/-1%. Applied cumulatively — each position tracks its entry cumulative rate and pays or receives the delta on close.

**Key functions:** `calculate-funding-rate`, `apply-funding`, `get-funding-payment`, `init-market`

---

### `clearing-house.clar`

The core trading engine. Manages markets, opens and closes leveraged positions, tracks open interest, and computes unrealized P&L and margin ratios.

**Key functions:** `open-position`, `close-position`, `add-margin`, `create-market`, `get-unrealized-pnl`, `get-margin-ratio`

---

### `liquidation-engine.clar`

Permissionless liquidator. Anyone can call `liquidate` on an undercollateralized position. The liquidator receives a 5% bonus; 20% goes to the insurance fund; the rest returns to the trader.

**Key functions:** `liquidate`, `is-liquidatable`, `set-insurance-fund`

---
## Funding Rate Mechanism

The funding rate aligns the perpetual mark price to the spot index price, preventing long-term divergence.

### Formula

```
premium = (mark_price - index_price) / index_price  [in basis points]
rate = clamp(premium, -100 bps, +100 bps)
```

### Cumulative Accumulation

Every `FUNDING-INTERVAL` blocks (~150 blocks = 8 hours):
```
cumulative_rate += current_rate
```

### Per-Position Payment at Close

```
funding_payment = position_size x (current_cumulative - entry_cumulative) / 10000
```

- **Longs pay** when rate > 0 (mark > index, market is overheated)
- **Shorts receive** when rate > 0
- Inverted when rate < 0 (market is underpriced relative to spot)

This creates equilibrium: longs and shorts are balanced when funding rate approaches zero.

---

## Position Lifecycle

```
1. Deposit STX or sBTC -> margin-manager (deposit-stx / deposit-sbtc)

2. open-position(market_id, is_long, size, margin, collateral_asset)
   |-- oracle: fetch fresh price (fails if stale)
   |-- assert: margin >= notional / max_leverage
   |-- margin-manager: lock margin
   |-- record: entry_price, entry_funding_cumulative
   |-- update: open interest (long or short bucket)

3. Position live: unrealized P&L = size x (current - entry) x direction

4. close-position(market_id)
   |-- oracle: fetch closing price
   |-- raw_pnl = size x (close - entry) x direction
   |-- funding_payment = size x (cumulative_now - entry_cumulative) / 10000
   |-- net_pnl = raw_pnl - funding_payment
   |-- margin-manager: unlock margin
   |-- if net_pnl > 0: transfer profit to trader
   |-- update: open interest

5. Withdraw -> margin-manager (withdraw)
```

---

## Liquidation Mechanics

A position becomes liquidatable when its **effective margin ratio** falls below the market maintenance margin rate (default 5%).

### Margin Ratio Formula

```
effective_margin = deposited_margin + unrealized_pnl
margin_ratio = effective_margin / (size x entry_price)
liquidatable when: margin_ratio < maintenance_margin_rate
```

### Liquidation Distribution

```
seized_margin = position margin
  |-- 5%  -> liquidator (LIQUIDATION-BONUS = 500 bps)
  |-- 20% -> insurance fund (INSURANCE-CUT = 2000 bps)
  |-- 75% -> returned to trader (partial recovery)
```

### Insurance Fund

The insurance fund absorbs bad debt when a position's losses exceed its collateral due to extreme volatility (gap risk). Without an insurance fund, losses would be socialized across all traders. The 20% cut from every liquidation builds the fund proportionally to protocol activity.

### Why Permissionless Liquidation?

Liquidators earn a 5% bonus — this creates a competitive market of liquidation bots that constantly monitor positions. No trusted admin needed. The protocol stays solvent through economic incentives, not access control.

---

## Technical Specifications

| Parameter | Value |
|---|---|
| Max leverage | 20x |
| Maintenance margin | 5% (500 bps) |
| Funding interval | 150 blocks (~8 hours) |
| Max funding rate | +/-1% per interval (100 bps) |
| Liquidation bonus | 5% (500 bps) |
| Insurance fund cut | 20% of seized margin (2000 bps) |
| Price staleness threshold | 150 blocks (~25 minutes) |
| Collateral assets | STX (asset-id 1), sBTC (asset-id 2) |
| Contract language | Clarity 3, Epoch 3.0 |
| Basis points denominator | 10000 |

---

## Getting Started

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) v2.x
- Node.js v18+ with `@stacks/transactions`
- [Leather wallet](https://leather.io/) for sBTC

### Installation

```bash
git clone https://github.com/DeborahOlaboye/apex-protocol
cd apex-protocol
clarinet check
clarinet devnet start
```

### Deploy Order

Deploy in this order to satisfy inter-contract dependencies:

1. `oracle` — no dependencies
2. `margin-manager` — no dependencies
3. `funding-rate` — no dependencies
4. `clearing-house` — depends on oracle, margin-manager, funding-rate
5. `liquidation-engine` — depends on clearing-house, margin-manager

### Post-Deploy Wiring

```bash
# Wire clearing-house dependencies
clarinet call clearing-house set-oracle <oracle-contract>
clarinet call clearing-house set-margin-manager <margin-manager-contract>
clarinet call clearing-house set-funding-rate <funding-rate-contract>

# Authorize clearing-house and liquidation-engine to manage collateral
clarinet call margin-manager authorize-contract <clearing-house-contract>
clarinet call margin-manager authorize-contract <liquidation-engine-contract>

# Authorize clearing-house to apply funding rates
clarinet call funding-rate authorize-contract <clearing-house-contract>
```

---

## Usage Examples

### Deposit Collateral

```typescript
import { makeContractCall, uintCV, broadcastTransaction } from '@stacks/transactions';

const tx = await makeContractCall({
  contractAddress: DEPLOYER,
  contractName: 'margin-manager',
  functionName: 'deposit-stx',
  functionArgs: [uintCV(100_000_000)], // 100 STX
  senderKey: privateKey,
  network: 'mainnet',
});
await broadcastTransaction({ transaction: tx, network: 'mainnet' });
```

### Open a Long Position

```typescript
const tx = await makeContractCall({
  contractAddress: DEPLOYER,
  contractName: 'clearing-house',
  functionName: 'open-position',
  functionArgs: [
    uintCV(1),      // market-id (BTC/USD = 1)
    boolCV(true),   // is-long
    uintCV(100),    // size
    uintCV(5_000_000), // margin (5 STX)
    uintCV(1),      // collateral-asset-id (STX)
  ],
  senderKey: privateKey,
  network: 'mainnet',
});
```

### Query Unrealized P&L

```typescript
import { callReadOnlyFunction, standardPrincipalCV, uintCV, cvToValue } from '@stacks/transactions';

const result = await callReadOnlyFunction({
  contractAddress: DEPLOYER,
  contractName: 'clearing-house',
  functionName: 'get-unrealized-pnl',
  functionArgs: [
    standardPrincipalCV('SP_TRADER_ADDRESS'),
    uintCV(1), // market-id
  ],
  network: 'mainnet',
  senderAddress: DEPLOYER,
});
console.log('Unrealized PnL:', cvToValue(result));
```

### Liquidate an Undercollateralized Position

```typescript
// Check first
const check = await callReadOnlyFunction({
  contractName: 'liquidation-engine',
  functionName: 'is-liquidatable',
  functionArgs: [standardPrincipalCV(targetUser), uintCV(1)],
  network: 'mainnet',
  senderAddress: DEPLOYER,
});

if (cvToValue(check)) {
  const tx = await makeContractCall({
    contractName: 'liquidation-engine',
    functionName: 'liquidate',
    functionArgs: [standardPrincipalCV(targetUser), uintCV(1)],
    senderKey: liquidatorKey,
    network: 'mainnet',
  });
  await broadcastTransaction({ transaction: tx, network: 'mainnet' });
}
```
