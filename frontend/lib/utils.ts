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
