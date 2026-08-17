import React from 'react';
import { useRole } from '../../context/RoleContext';
import { ConnectivityBadge } from './ConnectivityBadge';
import { SyncQueueBadge } from './SyncQueueBadge';
import { IndianEmblem } from './IndianEmblem';
import { LayoutDashboard, Smartphone, Radio, TestTube2 } from 'lucide-react';
import type { ViewRole } from '../../types/incident';

export const Navbar: React.FC = () => {
  const { activeRole, setActiveRole } = useRole();

  const navItems: { id: ViewRole; label: string; icon: React.ReactNode }[] = [
    {
      id: 'CONTROL_ROOM',
      label: 'Control Room',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'TOURIST_PWA',
      label: 'Tourist Mobile App',
      icon: <Smartphone className="w-4 h-4" />
    },
    {
      id: 'RESCUE_TEAM',
      label: 'Field Unit Terminal',
      icon: <Radio className="w-4 h-4" />
    },
    {
      id: 'DEMO_GUIDE',
      label: 'Scenario Runner',
      icon: <TestTube2 className="w-4 h-4" />
    }
  ];

  return (
    <header className="bg-zinc-900 border-b border-zinc-700/80 sticky top-0 z-40 px-4 lg:px-8 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-zinc-950 border border-zinc-700 rounded-lg flex items-center justify-center">
            <IndianEmblem className="w-7 h-8 text-zinc-200" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-zinc-100 uppercase">
                National Incident Response System
              </h1>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 border border-zinc-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                NIRS-v2.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Meghalaya & NE Regional Command Center • Operations Unit 04
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SyncQueueBadge />
          <ConnectivityBadge />
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-2 flex gap-1.5 border-t border-zinc-800 pt-2 overflow-x-auto text-xs">
        {navItems.map((item) => {
          const isActive = activeRole === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveRole(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-orange-500 text-zinc-950 font-bold shadow'
                  : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/70 hover:bg-zinc-750 hover:text-zinc-100'
              }`}
            >
              <span className={isActive ? 'text-zinc-950' : 'text-orange-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
