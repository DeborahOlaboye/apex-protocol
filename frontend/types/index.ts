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
