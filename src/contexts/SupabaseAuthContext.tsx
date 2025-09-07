import { createContext, useContext, type ReactNode } from 'react';
import { useAuth, type AuthState, type AuthActions } from '../hooks/useAuth';

// Renombrado para reflejar que ahora usa autenticación local
type LocalAuthContextType = AuthState & AuthActions;

const LocalAuthContext = createContext<LocalAuthContextType | undefined>(undefined);

// Mantener el nombre SupabaseAuthProvider para compatibilidad
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <LocalAuthContext.Provider value={auth}>
      {children}
    </LocalAuthContext.Provider>
  );
}

// Mantener el nombre useSupabaseAuth para compatibilidad
export function useSupabaseAuth() {
  const context = useContext(LocalAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

// Alias para compatibilidad
export const useAuthContext = useSupabaseAuth;
export const useLocalAuth = useSupabaseAuth;