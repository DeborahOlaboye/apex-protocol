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

export const MARKETS = {
  1: { id: 1, name: 'BTC/USD', baseAsset: 'BTC', quoteAsset: 'USD', assetId: ASSET_IDS.SBTC },
  2: { id: 2, name: 'STX/USD', baseAsset: 'STX', quoteAsset: 'USD', assetId: ASSET_IDS.STX },
} as const;
