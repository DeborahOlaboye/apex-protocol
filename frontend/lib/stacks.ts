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
