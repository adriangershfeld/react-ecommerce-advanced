// Import necessary React utilities and types
import React, { createContext, useContext, ReactNode } from 'react';
// Import Firebase user type and custom hooks/services
import { User } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { UserData } from '../services/authService';

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;         // Firebase auth user object
  userData: UserData | null;  // Custom user data from your database/service
  loading: boolean;           // Loading state indicator
}

// Create context with safe undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * 
 * Wraps the application to provide authentication state to all child components.
 * Uses the custom useAuth hook to manage authentication state.
 * 
 * @param children - Child components that will have access to the auth context
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authState = useAuth();  // Get authentication state from custom hook
  
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for accessing authentication context
 * 
 * @returns AuthContextType - Authentication context value
 * @throws Error if used outside of AuthProvider
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  // Ensure the hook is used within a provider
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};