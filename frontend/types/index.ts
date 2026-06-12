export interface Market {
  id: number;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  assetId: number;
  isActive?: boolean;
  maxLeverage?: number;
  maintenanceMarginRate?: number;
  openInterestLong?: number;
  openInterestShort?: number;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
}

export interface Position {
  marketId: number;
  size: number;
  isLong: boolean;
  entryPrice: number;
  margin: number;
  collateralAssetId: number;
  entryFundingRate: number;
  lastUpdated: number;
  unrealizedPnl?: number;
  marginRatio?: number;
}

export interface CollateralBalance {
  amount: number;
  locked: number;
  available: number;
}

export interface PriceData {
  price: number;
  timestamp: number;
}

export interface FundingRate {
  rate: number;
  cumulativeRate: number;
  nextFundingBlock: number;
}

export type CollateralAsset = 'STX' | 'SBTC';

export interface TradeFormData {
  marketId: number;
  isLong: boolean;
  size: string;
  margin: string;
  leverage: number;
  collateralAsset: CollateralAsset;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: string;
}
