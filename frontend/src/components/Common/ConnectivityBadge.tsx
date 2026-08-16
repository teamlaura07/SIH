import React from 'react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import type { NetworkStatus } from '../../types/incident';

export const ConnectivityBadge: React.FC = () => {
  const { networkStatus, setNetworkStatus } = useConnectivity();

  const getBadgeStyle = () => {
    switch (networkStatus) {
      case 'ONLINE':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-600/50 shadow-emerald-900/20';
      case 'WEAK':
        return 'bg-amber-950/80 text-amber-400 border-amber-600/50 shadow-amber-900/20';
      case 'OFFLINE':
        return 'bg-rose-950/80 text-rose-400 border-rose-600/50 shadow-rose-900/20';
    }
  };

  const getIcon = () => {
    switch (networkStatus) {
      case 'ONLINE':
        return <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />;
      case 'WEAK':
        return <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />;
      case 'OFFLINE':
        return <WifiOff className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all shadow-lg ${getBadgeStyle()}`}>
        {getIcon()}
        <span>
          {networkStatus === 'ONLINE' && 'ONLINE'}
          {networkStatus === 'WEAK' && 'WEAK NETWORK'}
          {networkStatus === 'OFFLINE' && 'ZERO CONNECTIVITY (OFFLINE)'}
        </span>
      </div>

      <div className="hidden md:flex bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg text-[10px]">
        {(['ONLINE', 'WEAK', 'OFFLINE'] as NetworkStatus[]).map((st) => (
          <button
            key={st}
            onClick={() => setNetworkStatus(st)}
            className={`px-2 py-1 rounded font-medium transition-all ${
              networkStatus === st
                ? st === 'ONLINE'
                  ? 'bg-emerald-600 text-white'
                  : st === 'WEAK'
                  ? 'bg-amber-600 text-white'
                  : 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  );
};
