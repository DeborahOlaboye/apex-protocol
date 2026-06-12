'use client';

import { createContext, useContext, type ReactNode } from 'react';

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
  return (
    <WalletContext.Provider value={{ connected: false, address: null, connect: () => {}, disconnect: () => {} }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
