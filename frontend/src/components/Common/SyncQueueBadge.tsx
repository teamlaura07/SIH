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
        title="Flush local IndexedDB queue"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
          isSyncing
            ? 'bg-zinc-800 border-orange-500/70 text-orange-300'
            : pendingSyncCount > 0
            ? 'bg-amber-950/80 border-amber-500/70 text-amber-300'
            : 'bg-zinc-850 border-zinc-700/80 text-zinc-300 hover:border-zinc-500'
        }`}
      >
        {isSyncing ? (
          <RefreshCw className="w-3 h-3 animate-spin text-orange-400" />
        ) : pendingSyncCount > 0 ? (
          <CloudOff className="w-3 h-3 text-amber-400" />
        ) : (
          <CheckCircle2 className="w-3 h-3 text-orange-400" />
        )}

        <span>
          {isSyncing
            ? 'Syncing...'
            : pendingSyncCount > 0
            ? `Sync Queue (${pendingSyncCount})`
            : 'Synced'}
        </span>
      </button>

      {lastSyncedAt && (
        <span className="hidden xl:inline text-[10px] text-zinc-400 font-mono">
          Last sync: {lastSyncedAt}
        </span>
      )}
    </div>
  );
};
