export const DEPLOYER = 'SP3PEDBPAAV5ZE0YY4R5Q2P7ZHPB0TQ8161KK0ZWS';

export const CONTRACTS = {
  oracle: `${DEPLOYER}.oracle`,
  marginManager: `${DEPLOYER}.margin-manager`,
  fundingRate: `${DEPLOYER}.funding-rate`,
  clearingHouse: `${DEPLOYER}.clearing-house`,
  liquidationEngine: `${DEPLOYER}.liquidation-engine`,
} as const;

export const ASSET_IDS = {
  STX: 1,
  SBTC: 2,
} as const;
