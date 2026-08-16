import React, { createContext, useContext, useState } from 'react';
import type { ViewRole } from '../types/incident';

interface RoleContextType {
  activeRole: ViewRole;
  setActiveRole: (role: ViewRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<ViewRole>('CONTROL_ROOM');

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
};
