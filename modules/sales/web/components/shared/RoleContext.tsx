import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SalesRole = 'sales_staff' | 'sales_manager' | 'sales_director' | 'admin';

interface RoleContextType {
  role: SalesRole;
  setRole: (role: SalesRole) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  // Demo mode: Mặc định bật admin hoặc sales_director
  const [role, setRole] = useState<SalesRole>('admin');

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useSalesRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useSalesRole must be used within a RoleProvider');
  }
  return context;
}
