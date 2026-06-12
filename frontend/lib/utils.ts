import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BASIS_POINTS } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
}

export function formatCurrency(amount: number, symbol = 'STX', decimals = 4): string {
  const val = amount / 1_000_000;
  return `${formatNumber(val, decimals)} ${symbol}`;
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(bps: number, decimals = 2): string {
  return `${((bps / BASIS_POINTS) * 100).toFixed(decimals)}%`;
}

export function bpsToPercent(bps: number): number {
  return (bps / BASIS_POINTS) * 100;
}

export function microToMacro(micro: number): number {
  return micro / 1_000_000;
}

export function macroToMicro(macro: number): number {
  return Math.floor(macro * 1_000_000);
}

export function formatPnl(pnl: number): string {
  const formatted = formatCurrency(Math.abs(pnl));
  return pnl >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function truncateAddress(addr: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function calcLeverage(size: number, price: number, margin: number): number {
  if (!margin) return 0;
  return (size * price) / margin;
}

export function calcRequiredMargin(size: number, price: number, leverage: number): number {
  return (size * price) / leverage;
}
