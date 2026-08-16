import React from 'react';
import { useRole } from '../../context/RoleContext';
import { ConnectivityBadge } from './ConnectivityBadge';
import { SyncQueueBadge } from './SyncQueueBadge';
import { Shield, Smartphone, Radio, Zap, Activity } from 'lucide-react';
import type { ViewRole } from '../../types/incident';

export const Navbar: React.FC = () => {
  const { activeRole, setActiveRole } = useRole();

  const navItems: { id: ViewRole; label: string; icon: React.ReactNode }[] = [
    {
      id: 'CONTROL_ROOM',
      label: 'Control Room Dashboard',
      icon: <Shield className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'TOURIST_PWA',
      label: 'Tourist Mobile PWA',
      icon: <Smartphone className="w-4 h-4 text-blue-400" />
    },
    {
      id: 'RESCUE_TEAM',
      label: 'Rescue Team Terminal',
      icon: <Radio className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'DEMO_GUIDE',
      label: 'Interactive Demo Suite',
      icon: <Zap className="w-4 h-4 text-purple-400" />
    }
  ];

  return (
    <header className="bg-slate-950/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-rose-600 to-red-700 rounded-xl text-white shadow-lg shadow-rose-950/50">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white">
                SIH25002 <span className="text-rose-500 font-normal">| Hybrid Incident Response</span>
              </h1>
              <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                NE INDIA SCENARIO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              "Network loss should change the communication path, not stop the rescue response."
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SyncQueueBadge />
          <ConnectivityBadge />
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-3 flex gap-2 border-t border-slate-800/80 pt-2 overflow-x-auto text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveRole(item.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeRole === item.id
                ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
