import React from 'react';
import { useConnectivity } from '../../context/ConnectivityContext';
import { commManager } from '../../services/adaptiveCommManager';
import { Radio, ShieldCheck, Database, Cpu, ChevronRight } from 'lucide-react';

export const CommPathVisualizer: React.FC = () => {
  const { networkStatus } = useConnectivity();
  const channels = commManager.getAvailableChannels();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Adaptive Communication Layer Architecture
          </h3>
        </div>
        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded font-mono">
          Dynamic Path Selection Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {channels.map((ch, idx) => {
          const isPrimaryActive = ch.type === 'PRIMARY_INTERNET' && (networkStatus === 'ONLINE' || networkStatus === 'WEAK');
          const isOfflineFallback = ch.type === 'LOCAL_INDEXEDDB' && networkStatus === 'OFFLINE';

          return (
            <div
              key={ch.id}
              className={`relative p-3 rounded-lg border text-xs transition-all ${
                isPrimaryActive
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200 ring-1 ring-emerald-500/30'
                  : isOfflineFallback
                  ? 'bg-amber-950/40 border-amber-600/50 text-amber-200 ring-1 ring-amber-500/30'
                  : ch.type.startsWith('LORA') || ch.type.startsWith('BLE')
                  ? 'bg-purple-950/20 border-purple-800/40 text-purple-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-semibold">
                  {ch.type === 'PRIMARY_INTERNET' && <Radio className="w-3.5 h-3.5 text-emerald-400" />}
                  {ch.type === 'LOCAL_INDEXEDDB' && <Database className="w-3.5 h-3.5 text-amber-400" />}
                  {ch.type === 'LORA_GATEWAY' && <Cpu className="w-3.5 h-3.5 text-purple-400" />}
                  {ch.type === 'BLE_MESH_RELAY' && <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
                  <span className="truncate">{ch.name}</span>
                </div>
                {idx < channels.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-slate-700 w-4 h-4 z-10" />
                )}
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                {ch.description}
              </p>

              <div className="flex items-center justify-between text-[10px] border-t border-slate-800/80 pt-1.5 mt-auto">
                <span className="font-mono text-slate-400">Latency: {ch.latencyMs}ms</span>
                <span className={`px-1.5 py-0.5 rounded font-mono font-medium ${
                  isPrimaryActive
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : isOfflineFallback
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isPrimaryActive ? 'ACTIVE PATH' : isOfflineFallback ? 'LOCAL QUEUE' : 'HARDWARE EXT'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 bg-slate-950 border border-slate-800/80 rounded-lg p-2 flex items-center justify-between text-xs text-slate-300">
        <span className="text-[11px] text-slate-400">
          Core Principle: <strong className="text-emerald-400 font-normal">"Network loss should change the communication path, not stop the rescue response."</strong>
        </span>
        <span className="text-[10px] text-indigo-400 bg-indigo-950/80 border border-indigo-800/40 px-2 py-0.5 rounded font-mono">
          Zero Data Loss Strategy
        </span>
      </div>
    </div>
  );
};
