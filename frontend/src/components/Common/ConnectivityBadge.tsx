import React from 'react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import type { NetworkStatus } from '../../types/incident';

export const ConnectivityBadge: React.FC = () => {
  const { networkStatus, setNetworkStatus } = useConnectivity();

  const getBadgeStyle = () => {
    switch (networkStatus) {
      case 'ONLINE':
        return 'bg-zinc-800 text-orange-400 border-orange-500/60';
      case 'WEAK':
        return 'bg-zinc-800 text-amber-400 border-amber-500/60';
      case 'OFFLINE':
        return 'bg-zinc-800 text-zinc-300 border-zinc-600';
    }
  };

  const getIcon = () => {
    switch (networkStatus) {
      case 'ONLINE':
        return <Wifi className="w-3.5 h-3.5 text-orange-400" />;
      case 'WEAK':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'OFFLINE':
        return <WifiOff className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[11px] font-semibold transition-all ${getBadgeStyle()}`}>
        {getIcon()}
        <span>
          {networkStatus === 'ONLINE' && 'Network: Online'}
          {networkStatus === 'WEAK' && 'Network: Degraded'}
          {networkStatus === 'OFFLINE' && 'Network: Offline (IndexedDB Active)'}
        </span>
      </div>

      <div className="hidden md:flex bg-zinc-900 border border-zinc-700/80 p-0.5 rounded-lg text-[10px]">
        {(['ONLINE', 'WEAK', 'OFFLINE'] as NetworkStatus[]).map((st) => (
          <button
            key={st}
            onClick={() => setNetworkStatus(st)}
            className={`px-2 py-0.5 rounded font-medium transition-all ${
              networkStatus === st
                ? st === 'ONLINE'
                  ? 'bg-orange-500 text-zinc-950 font-bold'
                  : st === 'WEAK'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'bg-zinc-700 text-white font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  );
};
