import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AdminRole, AdminUser } from '../types/backend';

interface AuthContextType {
  user: User | null;
  adminProfile: AdminUser | null;
  role: AdminRole | null; // 'fullAdmin' | 'staff' | null
  isFullAdmin: boolean;
  isStaffOrAdmin: boolean;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAdminProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminDoc = async (currentUser: User) => {
    const isAdminEmail =
      currentUser.email === 'akrammohamed366366@gmail.com' ||
      currentUser.uid === 'ZulQ8SXy9fh1zmKj3GFnz1fpRl43';

    try {
      const adminDocRef = doc(db, 'adminUsers', currentUser.uid);
      let adminDoc = await getDoc(adminDocRef);

      // One-time bootstrap for primary fullAdmin account
      if (!adminDoc.exists() && isAdminEmail) {
        const adminPayload: AdminUser = {
          uid: currentUser.uid,
          email: currentUser.email || 'akrammohamed366366@gmail.com',
          role: 'fullAdmin',
          displayName: currentUser.displayName || 'DAHR Admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(adminDocRef, adminPayload);
          adminDoc = await getDoc(adminDocRef);
        } catch (writeErr) {
          console.warn('Could not write admin bootstrap doc:', writeErr);
        }
      }

      if (adminDoc && adminDoc.exists()) {
        setAdminProfile(adminDoc.data() as AdminUser);
      } else {
        setAdminProfile(null);
      }
    } catch (error) {
      console.warn('Network or offline status while fetching admin user role:', error);
      setAdminProfile(null);
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (currentUser) {
        await fetchAdminDoc(currentUser);

        // Real-time listener for instant role/status revocation and promotions
        try {
          const adminDocRef = doc(db, 'adminUsers', currentUser.uid);
          unsubscribeSnapshot = onSnapshot(
            adminDocRef,
            (snap) => {
              if (snap.exists()) {
                setAdminProfile(snap.data() as AdminUser);
              } else {
                setAdminProfile(null);
              }
            },
            (err) => {
              console.debug('adminUsers snapshot notice:', err);
              setAdminProfile(null);
            }
          );
        } catch (e) {
          console.debug('Snapshot listener setup notice:', e);
        }
      } else {
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const refreshAdminProfile = async () => {
    if (auth.currentUser) {
      await fetchAdminDoc(auth.currentUser);
    }
  };

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUp = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setAdminProfile(null);
  };

  // User is only recognized as staff/admin if their adminUsers document exists AND has status === 'active'
  const isAccountActive = Boolean(adminProfile && adminProfile.status === 'active');
  const role: AdminRole | null = isAccountActive ? (adminProfile?.role || null) : null;
  const isFullAdmin = isAccountActive && role === 'fullAdmin';
  const isStaffOrAdmin = isAccountActive && (role === 'fullAdmin' || role === 'staff');

  return (
    <AuthContext.Provider
      value={{
        user,
        adminProfile,
        role,
        isFullAdmin,
        isStaffOrAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        refreshAdminProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
