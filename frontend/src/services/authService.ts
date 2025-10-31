import { signIn, signOut, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

export interface User {
  id: string;
  email: string;
  username: string;
  groups: string[];
  role: 'admin' | 'teacher' | 'student';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signInStep?: string | null; // e.g., CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED
}

class AuthService {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    signInStep: null,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.initializeAuth();
    this.setupAuthHub();
  }

  private async initializeAuth() {
    try {
      const user = await getCurrentUser();
      if (user) {
        // Mark as authenticated immediately; load details in background
        this.updateAuthState({ isAuthenticated: true, isLoading: true, error: null });
        this.loadUserData();
      } else {
        this.updateAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.log('No authenticated user');
      this.updateAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }

  private setupAuthHub() {
    Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          // Immediately flip to authenticated to unblock routing, then enrich
          this.updateAuthState({ isAuthenticated: true, isLoading: true, error: null, signInStep: null });
          this.loadUserData();
          break;
        case 'signedOut':
          this.updateAuthState({ user: null, isAuthenticated: false, isLoading: false, signInStep: null });
          break;
        case 'tokenRefresh':
          this.loadUserData();
          break;
        case 'tokenRefresh_failure':
          this.updateAuthState({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: 'Session expired. Please sign in again.' 
          });
          break;
      }
    });
  }

  private async loadUserData() {
    try {
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken;
      
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const payload = accessToken.payload;
      
      // Extract user information from Cognito token
      const userData: User = {
        id: payload.sub as string,
        email: payload.email as string,
        username: payload.username as string,
        groups: payload['cognito:groups'] as string[] || [],
        role: this.determineRole(payload['cognito:groups'] as string[] || []),
      };

      this.updateAuthState({ 
        user: userData, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      this.updateAuthState({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: 'Failed to load user data' 
      });
    }
  }

  private determineRole(groups: string[]): 'admin' | 'teacher' | 'student' {
    const normalized = (groups || []).map(g => g.toLowerCase());
    if (normalized.includes('admin')) return 'admin';
    if (normalized.includes('teacher') || normalized.includes('teachers')) return 'teacher';
    if (normalized.includes('student') || normalized.includes('students')) return 'student';
    return 'student'; // default role
  }

  private updateAuthState(updates: Partial<AuthState>) {
    this.authState = { ...this.authState, ...updates };
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Public methods
  async signIn(email: string, password: string) {
    try {
      this.updateAuthState({ isLoading: true, error: null });
      const result = await signIn({ username: email, password });

      // Amplify v6 returns isSignedIn or nextStep
      if ((result as any)?.isSignedIn) {
        // User data will be loaded via Auth Hub
        this.updateAuthState({ signInStep: null });
        return;
      }

      const nextStep = (result as any)?.nextStep?.signInStep as string | undefined;
      if (nextStep) {
        // Store next step (e.g., CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED)
        this.updateAuthState({ isLoading: false, isAuthenticated: false, signInStep: nextStep });
        return;
      }
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      this.updateAuthState({ 
        isLoading: false, 
        error: errorMessage,
        signInStep: null,
      });
      throw new Error(errorMessage);
    }
  }

  async completeNewPassword(newPassword: string) {
    try {
      this.updateAuthState({ isLoading: true, error: null });
      // In NEW_PASSWORD_REQUIRED, confirmSignIn expects the new password as challengeResponse
      await confirmSignIn({ challengeResponse: newPassword });
      // After success, load user data
      await this.loadUserData();
      this.updateAuthState({ isAuthenticated: true, isLoading: false, signInStep: null });
    } catch (error: any) {
      const message = this.getErrorMessage(error);
      this.updateAuthState({ isLoading: false, error: message });
      throw new Error(message);
    }
  }

  async signOut() {
    try {
      await signOut();
      // Auth state will be updated via Auth Hub
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  getAuthState(): AuthState {
    return this.authState;
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private getErrorMessage(error: any): string {
    if (error.name === 'NotAuthorizedException') {
      return 'Invalid email or password';
    } else if (error.name === 'UserNotConfirmedException') {
      return 'Please confirm your email address before signing in';
    } else if (error.name === 'TooManyRequestsException') {
      return 'Too many login attempts. Please try again later';
    } else if (error.message) {
      return error.message;
    }
    return 'An error occurred during sign in';
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
