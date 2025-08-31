import { createContext, useContext, type ReactNode } from 'react';
import { useAuth, type AuthState, type AuthActions } from '../hooks/useAuth';

type SupabaseAuthContextType = AuthState & AuthActions;

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <SupabaseAuthContext.Provider value={auth}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

// Export principal - usar useSupabaseAuth en lugar de useAuthContext
// export const useAuthContext = useSupabaseAuth;