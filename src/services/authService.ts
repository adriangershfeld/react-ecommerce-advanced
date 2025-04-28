import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    UserCredential,
    updateProfile,
    User
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
  import { auth, db } from '../firebaseConfig';
  
  export interface UserData {
    uid: string;
    email: string;
    displayName?: string;
    address?: string;
    phoneNumber?: string;
  }
  
  export const registerUser = async (
    email: string, 
    password: string, 
    displayName?: string
  ): Promise<UserData> => {
    try {
      // Create authentication user
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name if provided
      if (displayName && user) {
        await updateProfile(user, { displayName });
      }
      
      // Create user document in Firestore with default values
      const userData: UserData = {
        uid: user.uid,
        email: user.email || email,
        displayName: displayName || '',
        address: '', // Default empty address
        phoneNumber: '', // Default empty phone number
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      return userData;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };
  
  export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  };
  
  export const logoutUser = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };
  
  export const getUserData = async (uid: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserData;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  };
  
  export const updateUserData = async (uid: string, data: Partial<UserData>): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', uid), data);
      
      // Update auth profile if display name is provided
      if (data.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName
        });
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };
  
  export const deleteUserAccount = async (uid: string): Promise<void> => {
    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', uid));
      
      // Delete user authentication account
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  };
  