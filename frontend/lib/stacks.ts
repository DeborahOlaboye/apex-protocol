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
