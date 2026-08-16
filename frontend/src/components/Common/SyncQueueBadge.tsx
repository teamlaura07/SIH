import React from 'react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { RefreshCw, CheckCircle2, CloudOff } from 'lucide-react';

export const SyncQueueBadge: React.FC = () => {
  const { pendingSyncCount, isSyncing, lastSyncedAt, triggerManualSync, networkStatus } = useConnectivity();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => triggerManualSync()}
        disabled={isSyncing || networkStatus === 'OFFLINE'}
        title="Trigger manual sync flush"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
          isSyncing
            ? 'bg-blue-950/90 border-blue-600/50 text-blue-300'
            : pendingSyncCount > 0
            ? 'bg-amber-950/90 border-amber-600/50 text-amber-300 animate-pulse'
            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
        }`}
      >
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
        ) : pendingSyncCount > 0 ? (
          <CloudOff className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        )}

        <span>
          {isSyncing
            ? 'SYNCING...'
            : pendingSyncCount > 0
            ? `${pendingSyncCount} QUEUED FOR SYNC`
            : 'ALL DATA SYNCED'}
        </span>
      </button>

      {lastSyncedAt && (
        <span className="hidden xl:inline text-[11px] text-slate-400 font-mono">
          Last synced: {lastSyncedAt}
        </span>
      )}
    </div>
  );
};
