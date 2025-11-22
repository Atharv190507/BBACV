import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/mockAuth'; // Renamed but still using the service interface
import { auth, db } from '../services/firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  login: (type: 'INSTITUTION' | 'STUDENT' | 'ADMIN', identifier: string, password?: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session using Firebase Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch details from Firestore
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
             setUser({ ...userDoc.data(), id: firebaseUser.uid } as User);
          }
        } catch (e) {
          console.error("Error fetching user profile", e);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (type: 'INSTITUTION' | 'STUDENT' | 'ADMIN', identifier: string, password = 'password') => {
    try {
      const result = await authService.login(identifier, password);
      
      if (result.error) {
        return { success: false, error: result.error };
      }

      if (result.user) {
        // Basic role validation
        if (type === 'STUDENT' && result.user.role !== UserRole.STUDENT) {
           return { success: false, error: "Not a student account." };
        }
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: "Unknown error" };
    } catch (e) {
      return { success: false, error: "Login failed" };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};