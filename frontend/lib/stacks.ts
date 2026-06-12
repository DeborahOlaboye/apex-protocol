import {
  fetchCallReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  standardPrincipalCV,
  uintCV,
  boolCV,
  cvToValue,
  type ClarityValue,
} from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { DEPLOYER, NETWORK } from './constants';

export const network = NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

export async function readOnly<T>(
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[],
  senderAddress: string = DEPLOYER,
): Promise<T> {
  const result = await fetchCallReadOnlyFunction({
    contractAddress: DEPLOYER,
    contractName,
    functionName,
    functionArgs,
    senderAddress,
    network: NETWORK as 'mainnet' | 'testnet',
  });
  return cvToValue(result) as T;
}

export async function contractCall(
  contractName: string,
  functionName: string,
  functionArgs: ClarityValue[],
  senderKey: string,
) {
  const tx = await makeContractCall({
    contractAddress: DEPLOYER,
    contractName,
    functionName,
    functionArgs,
    senderKey,
    network: NETWORK as 'mainnet' | 'testnet',
  });
  return broadcastTransaction({ transaction: tx, network: NETWORK as 'mainnet' | 'testnet' });
}

// Read-only helpers
export async function getMarket(marketId: number) {
  return readOnly('clearing-house', 'get-market', [uintCV(marketId)]);
}

export async function getPosition(userAddress: string, marketId: number) {
  return readOnly('clearing-house', 'get-position', [
    standardPrincipalCV(userAddress),
    uintCV(marketId),
  ]);
}

export async function getUnrealizedPnl(userAddress: string, marketId: number) {
  return readOnly('clearing-house', 'get-unrealized-pnl', [
    standardPrincipalCV(userAddress),
    uintCV(marketId),
  ]);
}

export async function getMarginRatio(userAddress: string, marketId: number) {
  return readOnly('clearing-house', 'get-margin-ratio', [
    standardPrincipalCV(userAddress),
    uintCV(marketId),
  ]);
}

export async function getPrice(assetId: number) {
  return readOnly('oracle', 'get-price', [uintCV(assetId)]);
}

export async function getLatestPrice(assetId: number) {
  return readOnly('oracle', 'get-latest-price', [uintCV(assetId)]);
}

export async function getBalance(userAddress: string, assetId: number) {
  return readOnly('margin-manager', 'get-balance', [
    standardPrincipalCV(userAddress),
    uintCV(assetId),
  ]);
}

export async function getAvailableBalance(userAddress: string, assetId: number) {
  return readOnly('margin-manager', 'get-available-balance', [
    standardPrincipalCV(userAddress),
    uintCV(assetId),
  ]);
}

export async function isLiquidatable(userAddress: string, marketId: number) {
  return readOnly('liquidation-engine', 'is-liquidatable', [
    standardPrincipalCV(userAddress),
    uintCV(marketId),
  ]);
}

export async function getCumulativeRate(marketId: number) {
  return readOnly('funding-rate', 'get-cumulative-rate', [uintCV(marketId)]);
}

// Transaction builders (used with @stacks/connect openContractCall)
export function buildOpenPosition(
  marketId: number,
  isLong: boolean,
  size: number,
  margin: number,
  collateralAssetId: number,
): { contractName: string; functionName: string; functionArgs: ClarityValue[] } {
  return {
    contractName: 'clearing-house',
    functionName: 'open-position',
    functionArgs: [
      uintCV(marketId),
      boolCV(isLong),
      uintCV(size),
      uintCV(margin),
      uintCV(collateralAssetId),
    ],
  };
}

export function buildClosePosition(marketId: number) {
  return {
    contractName: 'clearing-house',
    functionName: 'close-position',
    functionArgs: [uintCV(marketId)],
  };
}

export function buildAddMargin(marketId: number, amount: number) {
  return {
    contractName: 'clearing-house',
    functionName: 'add-margin',
    functionArgs: [uintCV(marketId), uintCV(amount)],
  };
}

export function buildDepositStx(amount: number) {
  return {
    contractName: 'margin-manager',
    functionName: 'deposit-stx',
    functionArgs: [uintCV(amount)],
  };
}

export function buildDepositSbtc(amount: number) {
  return {
    contractName: 'margin-manager',
    functionName: 'deposit-sbtc',
    functionArgs: [uintCV(amount)],
  };
}

export function buildWithdraw(assetId: number, amount: number) {
  return {
    contractName: 'margin-manager',
    functionName: 'withdraw',
    functionArgs: [uintCV(assetId), uintCV(amount)],
  };
}

export function buildLiquidate(targetUser: string, marketId: number) {
  return {
    contractName: 'liquidation-engine',
    functionName: 'liquidate',
    functionArgs: [standardPrincipalCV(targetUser), uintCV(marketId)],
  };
}
