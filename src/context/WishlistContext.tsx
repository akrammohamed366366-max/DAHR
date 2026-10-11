import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { userStoreApi } from '../api/userStoreApi';
import { WishlistItem } from '../types/backend';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => boolean; // returns true if now in wishlist, false if removed
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  isLoadingWishlist: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'dahr_luxury_wishlist_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (err) {
        console.warn('Could not read saved wishlist from localStorage:', err);
      }
    }
    return ['prod-oud-al-waqt'];
  });

  const [isLoadingWishlist, setIsLoadingWishlist] = useState<boolean>(false);
  const hasSyncedUserWishlist = useRef<string | null>(null);

  // Sync with Firestore when user logs in
  useEffect(() => {
    let isMounted = true;

    async function syncUserWishlist() {
      if (user && hasSyncedUserWishlist.current !== user.uid) {
        hasSyncedUserWishlist.current = user.uid;
        try {
          setIsLoadingWishlist(true);
          const remoteWishlist = await userStoreApi.getWishlist(user.uid);
          if (isMounted) {
            if (remoteWishlist && remoteWishlist.items && remoteWishlist.items.length > 0) {
              const ids = remoteWishlist.items.map((it) => it.productId);
              setWishlistIds(ids);
            } else if (wishlistIds.length > 0) {
              // Upload local wishlist to Firestore
              const items: WishlistItem[] = wishlistIds.map((id) => ({
                productId: id,
                addedAt: new Date().toISOString(),
              }));
              await userStoreApi.saveWishlist(user.uid, items);
            }
          }
        } catch (err) {
          console.warn('Could not sync user wishlist from Firestore:', err);
        } finally {
          if (isMounted) setIsLoadingWishlist(false);
        }
      } else if (!user) {
        hasSyncedUserWishlist.current = null;
      }
    }

    syncUserWishlist();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Persist to localStorage & Firestore whenever wishlistIds changes
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch (err) {
      console.warn('Could not persist wishlist to localStorage:', err);
    }

    // Persist to Firestore if signed in
    if (user && hasSyncedUserWishlist.current === user.uid) {
      const items: WishlistItem[] = wishlistIds.map((id) => ({
        productId: id,
        addedAt: new Date().toISOString(),
      }));
      userStoreApi.saveWishlist(user.uid, items).catch((err) => {
        console.warn('Firestore wishlist update warning:', err);
      });
    }
  }, [wishlistIds, user]);

  const toggleWishlist = (productId: string): boolean => {
    const isCurrentlyWishlisted = wishlistIds.includes(productId);
    const updatedIds = isCurrentlyWishlisted
      ? wishlistIds.filter((id) => id !== productId)
      : [...wishlistIds, productId];

    setWishlistIds(updatedIds);
    return !isCurrentlyWishlisted;
  };

  const isWishlisted = (productId: string): boolean => {
    return wishlistIds.includes(productId);
  };

  const clearWishlist = () => {
    setWishlistIds([]);
    if (user) {
      userStoreApi.saveWishlist(user.uid, []).catch((err) => {
        console.warn('Firestore clearWishlist warning:', err);
      });
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        clearWishlist,
        isLoadingWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
