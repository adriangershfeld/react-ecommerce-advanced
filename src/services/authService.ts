import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  UserCredential,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { UserData } from '../utils/userTypes'; // Import from central type file

// Generic error handler
const handleError = (operation: string, error: unknown) => {
  console.error(`Error ${operation}:`, error);
  throw error;
};

export const registerUser = async (
  email: string, 
  password: string, 
  displayName?: string
): Promise<UserData> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    const userData: UserData = {
      uid: user.uid,
      email: user.email || email,
      displayName: displayName || undefined,
      isAdmin: false, // Ensure this is always included
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    return userData;
  } catch (error) {
    return handleError('registering user', error);
  }
};

export const loginUser = (email: string, password: string): Promise<UserCredential> =>
  signInWithEmailAndPassword(auth, email, password)
    .catch(error => handleError('logging in', error));

export const logoutUser = (): Promise<void> => 
  signOut(auth).catch(error => handleError('logging out', error));

export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as UserData : null;
  } catch (error) {
    return handleError('getting user data', error);
  }
};

export const updateUserData = async (uid: string, data: Partial<UserData>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), data);
    
    if (data.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.displayName });
    }
  } catch (error) {
    handleError('updating user data', error);
  }
};

export const deleteUserAccount = async (uid: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', uid));
    
    if (auth.currentUser) {
      await auth.currentUser.delete();
    } else {
      throw new Error('No authenticated user found');
    }
  } catch (error) {
    handleError('deleting user account', error);
  }
};