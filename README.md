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
