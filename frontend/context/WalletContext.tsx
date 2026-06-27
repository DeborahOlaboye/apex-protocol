'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

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
      const { connect } = await import('@stacks/connect');
      const result = await connect();
      const stxEntry = result.addresses.find(
        (a: { address: string }) => a.address.startsWith('SP') || a.address.startsWith('ST'),
      );
      if (stxEntry) {
        setAddress(stxEntry.address);
        localStorage.setItem('apex_address', stxEntry.address);
      }
    } catch {
      // user cancelled
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      const { disconnect } = await import('@stacks/connect');
      disconnect();
    } catch {
      // ignore
    }
    setAddress(null);
    localStorage.removeItem('apex_address');
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connected: !!address,
        address,
        connect: handleConnect,
        disconnect: handleDisconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
