'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { connect, disconnect as stacksDisconnect, isConnected, request } from '@stacks/connect';

interface WalletContextValue {
  connected: boolean;
  address: string | null;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  connected: false,
  address: null,
  connect: () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('apex_address');
  });

  const handleConnect = useCallback(async () => {
    try {
      const result = await connect();
      // result.addresses is an array of AddressEntry: { symbol?, address, publicKey }
      // STX addresses start with 'SP' (mainnet) or 'ST' (testnet)
      const stxEntry = result.addresses.find(
        (a) => a.address.startsWith('SP') || a.address.startsWith('ST'),
      );
      if (stxEntry) {
        setAddress(stxEntry.address);
        localStorage.setItem('apex_address', stxEntry.address);
      }
    } catch {
      // user cancelled
    }
  }, []);
