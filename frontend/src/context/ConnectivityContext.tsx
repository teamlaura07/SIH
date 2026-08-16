import React, { createContext, useContext, useState, useEffect } from 'react';
import type { NetworkStatus } from '../types/incident';
import { commManager } from '../services/adaptiveCommManager';
import { syncEngine } from '../services/syncEngine';

interface ConnectivityContextType {
  networkStatus: NetworkStatus;
  setNetworkStatus: (status: NetworkStatus) => void;
  pendingSyncCount: number;
  isSyncing: boolean;
  lastSyncedAt?: string;
  triggerManualSync: () => Promise<number>;
  activeCommPath: string;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkStatus, setNetworkState] = useState<NetworkStatus>('ONLINE');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(undefined);

  useEffect(() => {
    commManager.setNetworkStatus(networkStatus);
  }, [networkStatus]);

  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((state) => {
      setIsSyncing(state.isSyncing);
      setPendingSyncCount(state.pendingCount);
      if (state.lastSyncedAt) setLastSyncedAt(state.lastSyncedAt);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const setNetworkStatus = (status: NetworkStatus) => {
    setNetworkState(status);
    commManager.setNetworkStatus(status);
    if (status === 'ONLINE') {
      console.log('[ConnectivityContext] Network restored to ONLINE. Flushing queue...');
      syncEngine.triggerSync();
    }
  };

  const triggerManualSync = async () => {
    return await syncEngine.triggerSync();
  };

  const activeCommPath = commManager.getActivePrimaryPath();

  return (
    <ConnectivityContext.Provider
      value={{
        networkStatus,
        setNetworkStatus,
        pendingSyncCount,
        isSyncing,
        lastSyncedAt,
        triggerManualSync,
        activeCommPath
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (!context) throw new Error('useConnectivity must be used within ConnectivityProvider');
  return context;
};
