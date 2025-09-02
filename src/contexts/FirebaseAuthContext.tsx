
import { createContext, useContext, type ReactNode } from 'react';
import { useFirebaseAuth, type AuthState, type AuthActions } from '../hooks/useFirebaseAuth';

type FirebaseAuthContextType = AuthState & AuthActions;

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();

  return (
    <FirebaseAuthContext.Provider value={auth}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within a FirebaseAuthProvider');
  }
  return context;
}
