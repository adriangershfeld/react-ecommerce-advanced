import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { getUserData } from '../services/authService';
import { UserData } from '../utils/userTypes';

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
        try {
          const userData = await getUserData(user.uid);
          setAuthState({
            user,
            userData,
            loading: false,
          });
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          setAuthState({
            user,
            userData: null,
            loading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          userData: null,
          loading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
};

// try/catch block fixes infinite loading if userData fetch fails (e.g. 404 on first login)