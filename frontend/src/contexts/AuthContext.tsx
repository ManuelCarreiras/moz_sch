import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import authService, { type User, type AuthState } from '../services/authService';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  completeNewPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(setAuthState);
    
    // Force a re-check of authentication state on mount
    const checkAuth = async () => {
      try {
        const currentState = authService.getAuthState();
        if (currentState.isLoading) {
          // If still loading, wait a bit and check again
          setTimeout(() => {
            const updatedState = authService.getAuthState();
            setAuthState(updatedState);
          }, 100);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };
    
    checkAuth();
    
    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const getAccessToken = async () => {
    return await authService.getAccessToken();
  };

  const completeNewPassword = async (newPassword: string) => {
    await authService.completeNewPassword(newPassword);
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    getAccessToken,
    completeNewPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Custom hooks for specific auth states
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === 'admin';
}

export function useIsTeacher(): boolean {
  const { user } = useAuth();
  return user?.role === 'teacher';
}

export function useIsStudent(): boolean {
  const { user } = useAuth();
  return user?.role === 'student';
}
