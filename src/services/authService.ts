import { auth } from "@/firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";

export const authService = {
  // Sign in with email and password
  login: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Register new user
  register: async (
    email: string,
    password: string,
    displayName: string
  ): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the user profile
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      }

      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Sign out the current user
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  // Get the current authenticated user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Subscribe to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
};
