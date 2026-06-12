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
