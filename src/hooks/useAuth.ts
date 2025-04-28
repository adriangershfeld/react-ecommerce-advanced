import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { getUserData, UserData } from '../services/authService';

interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userData: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const userData = await getUserData(user.uid);
        setAuthState({
          user,
          userData,
          loading: false,
        });
      } else {
        // User is signed out
        setAuthState({
          user: null,
          userData: null,
          loading: false,
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return authState;
};