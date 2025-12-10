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
  // Start with loading state to prevent premature redirects
  const [authState, setAuthState] = useState<AuthState>(() => {
    const initialState = authService.getAuthState();
    // Ensure we start with loading if not yet initialized
    if (!initialState.isLoading && !initialState.isAuthenticated && !initialState.user) {
      return { ...initialState, isLoading: true };
    }
    return initialState;
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(setAuthState);
    
    // Force a re-check of authentication state on mount to ensure we have the latest state
    // This is important for page refreshes
    const checkAuth = async () => {
      try {
        // Get the current state from the service
        let currentState = authService.getAuthState();
        
        // If not loading and not authenticated, we might still be initializing
        // Set loading to true to prevent premature redirects
        if (!currentState.isLoading && !currentState.isAuthenticated && !currentState.user) {
          currentState = { ...currentState, isLoading: true };
          setAuthState(currentState);
        } else {
          setAuthState(currentState);
        }
        
        // If still loading, set up a polling mechanism to wait for initialization
        if (currentState.isLoading) {
          const checkInterval = setInterval(() => {
            const updatedState = authService.getAuthState();
            setAuthState(updatedState);
            
            // Stop polling once loading is complete
            if (!updatedState.isLoading) {
              clearInterval(checkInterval);
            }
          }, 100);
          
          // Cleanup interval after 5 seconds max (shouldn't take that long)
          setTimeout(() => clearInterval(checkInterval), 5000);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        // On error, mark as not loading so we don't hang forever
        setAuthState(prev => ({ ...prev, isLoading: false }));
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
