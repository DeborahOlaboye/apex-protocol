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
