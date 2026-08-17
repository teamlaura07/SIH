import React from 'react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { commManager } from '../../services/adaptiveCommManager';
import { Radio, ShieldCheck, Database, Cpu, ChevronRight } from 'lucide-react';

export const CommPathVisualizer: React.FC = () => {
  const { networkStatus } = useConnectivity();
  const channels = commManager.getAvailableChannels();

  return (
    <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl p-3.5 shadow-sm font-sans">
      <div className="flex items-center justify-between mb-2.5 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-orange-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Hybrid Connectivity Interfaces & Telemetry Pipeline
          </h3>
        </div>
        <span className="text-[10px] bg-zinc-800 text-orange-400 border border-zinc-700 px-2 py-0.5 rounded font-mono font-bold">
          Adaptive Routing Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
        {channels.map((ch, idx) => {
          const isPrimaryActive = ch.type === 'PRIMARY_INTERNET' && (networkStatus === 'ONLINE' || networkStatus === 'WEAK');
          const isOfflineFallback = ch.type === 'LOCAL_INDEXEDDB' && networkStatus === 'OFFLINE';

          return (
            <div
              key={ch.id}
              className={`relative p-2.5 rounded-lg border text-xs transition-all ${
                isPrimaryActive
                  ? 'bg-orange-950/40 border-orange-500/60 text-orange-200 shadow-sm'
                  : isOfflineFallback
                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-sm'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-bold">
                  {ch.type === 'PRIMARY_INTERNET' && <Radio className="w-3.5 h-3.5 text-orange-400" />}
                  {ch.type === 'LOCAL_INDEXEDDB' && <Database className="w-3.5 h-3.5 text-amber-400" />}
                  {ch.type === 'LORA_GATEWAY' && <Cpu className="w-3.5 h-3.5 text-zinc-400" />}
                  {ch.type === 'BLE_MESH_RELAY' && <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />}
                  <span className="truncate">{ch.name}</span>
                </div>
                {idx < channels.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-zinc-700 w-3.5 h-3.5 z-10" />
                )}
              </div>

              <p className="text-[10px] text-zinc-400 leading-relaxed mb-2">
                {ch.description}
              </p>

              <div className="flex items-center justify-between text-[10px] border-t border-zinc-800/80 pt-1.5 mt-auto">
                <span className="font-mono text-zinc-400">Latency: {ch.latencyMs}ms</span>
                <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] ${
                  isPrimaryActive
                    ? 'bg-orange-500/20 text-orange-300'
                    : isOfflineFallback
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {isPrimaryActive ? 'ACTIVE LINK' : isOfflineFallback ? 'OFFLINE QUEUE' : 'HARDWARE EXT'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
