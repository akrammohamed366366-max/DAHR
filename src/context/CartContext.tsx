import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { userStoreApi } from '../api/userStoreApi';
import { CartItemRecord } from '../types/backend';

export interface CartItem {
  id: string; // unique cart item id (e.g. productId-size)
  productId: string;
  nameEn: string;
  nameAr: string;
  concentrationEn: string;
  concentrationAr: string;
  volumeEn: string;
  volumeAr: string;
  price: number;
  quantity: number;
  size: string;
  image?: string;
}

export interface AddToCartInput {
  productId: string;
  nameEn: string;
  nameAr: string;
  concentrationEn?: string;
  concentrationAr?: string;
  volumeEn?: string;
  volumeAr?: string;
  price: number;
  quantity?: number;
  size?: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotal: number;
  isLoadingCart: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dahr_luxury_cart_v1';

export const INITIAL_SEEDED_CART_ITEMS: CartItem[] = [
  {
    id: 'prod-oud-al-waqt-100ml',
    productId: 'prod-oud-al-waqt',
    nameEn: 'Oud Al-Waqt (Time & Agarwood)',
    nameAr: 'عود الوقت',
    concentrationEn: 'Extrait de Parfum (38%)',
    concentrationAr: 'خلاصة عطرية مركزة (38%)',
    volumeEn: '100ml / 3.4 fl oz',
    volumeAr: '100 مل / 3.4 أونصة',
    price: 340,
    quantity: 1,
    size: '100ml',
  },
  {
    id: 'prod-taif-dawn-50ml',
    productId: 'prod-taif-dawn',
    nameEn: 'Taif Dawn Rose',
    nameAr: 'ورد الطائف فجراً',
    concentrationEn: 'Extrait de Parfum (30%)',
    concentrationAr: 'خلاصة عطرية مركزة (30%)',
    volumeEn: '50ml / 1.7 fl oz',
    volumeAr: '50 مل / 1.7 أونصة',
    price: 210,
    quantity: 1,
    size: '50ml',
  },
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (err) {
        console.warn('Could not read saved cart from localStorage:', err);
      }
    }
    return INITIAL_SEEDED_CART_ITEMS;
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoadingCart, setIsLoadingCart] = useState<boolean>(false);
  const hasSyncedUserCart = useRef<string | null>(null);

  // Sync with Firestore when user logs in
  useEffect(() => {
    let isMounted = true;

    async function syncUserCart() {
      if (user && hasSyncedUserCart.current !== user.uid) {
        hasSyncedUserCart.current = user.uid;
        try {
          setIsLoadingCart(true);
          const remoteCart = await userStoreApi.getCart(user.uid);
          if (isMounted) {
            if (remoteCart && remoteCart.items && remoteCart.items.length > 0) {
              const mappedItems: CartItem[] = remoteCart.items.map((r) => ({
                id: `${r.productId}-${r.size}`,
                productId: r.productId,
                nameEn: r.nameEn || 'DAHR Extrait',
                nameAr: r.nameAr || 'خلاصة دار',
                concentrationEn: r.concentrationEn || 'Extrait de Parfum',
                concentrationAr: r.concentrationAr || 'خلاصة عطرية مركزة',
                volumeEn: r.volumeEn || r.size,
                volumeAr: r.volumeAr || r.size,
                price: r.price || 280,
                quantity: r.quantity || 1,
                size: r.size,
                image: r.image,
              }));
              setItems(mappedItems);
            } else if (items.length > 0) {
              // Push local items to Firestore
              const records: CartItemRecord[] = items.map((i) => {
                const rec: CartItemRecord = {
                  productId: i.productId,
                  size: i.size,
                  quantity: i.quantity,
                  addedAt: new Date().toISOString(),
                  nameEn: i.nameEn || '',
                  nameAr: i.nameAr || '',
                  concentrationEn: i.concentrationEn || 'Extrait de Parfum',
                  concentrationAr: i.concentrationAr || 'خلاصة عطرية مركزة',
                  volumeEn: i.volumeEn || i.size,
                  volumeAr: i.volumeAr || i.size,
                  price: i.price || 0,
                };
                if (i.image) rec.image = i.image;
                return rec;
              });
              await userStoreApi.saveCart(user.uid, records);
            }
          }
        } catch (err) {
          console.warn('Could not sync user cart from Firestore:', err);
        } finally {
          if (isMounted) setIsLoadingCart(false);
        }
      } else if (!user) {
        hasSyncedUserCart.current = null;
      }
    }

    syncUserCart();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Sync state to localStorage & Firestore whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Could not persist cart to localStorage:', err);
    }

    // Persist to Firestore if signed in
    if (user && hasSyncedUserCart.current === user.uid) {
      const records: CartItemRecord[] = items.map((i) => {
        const rec: CartItemRecord = {
          productId: i.productId,
          size: i.size,
          quantity: i.quantity,
          addedAt: new Date().toISOString(),
          nameEn: i.nameEn || '',
          nameAr: i.nameAr || '',
          concentrationEn: i.concentrationEn || 'Extrait de Parfum',
          concentrationAr: i.concentrationAr || 'خلاصة عطرية مركزة',
          volumeEn: i.volumeEn || i.size,
          volumeAr: i.volumeAr || i.size,
          price: i.price || 0,
        };
        if (i.image) rec.image = i.image;
        return rec;
      });
      userStoreApi.saveCart(user.uid, records).catch((err) => {
        console.warn('Firestore cart update warning:', err);
      });
    }
  }, [items, user]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (input: AddToCartInput) => {
    const size = input.size || '100ml';
    const quantity = input.quantity || 1;
    const itemId = `${input.productId}-${size}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: itemId,
          productId: input.productId,
          nameEn: input.nameEn,
          nameAr: input.nameAr,
          concentrationEn: input.concentrationEn || 'Extrait de Parfum',
          concentrationAr: input.concentrationAr || 'خلاصة عطرية مركزة',
          volumeEn: input.volumeEn || size,
          volumeAr: input.volumeAr || size,
          price: input.price,
          quantity,
          size,
          image: input.image,
        };
        return [...prevItems, newItem];
      }
    });

    // Automatically reveal the cart drawer with a quiet transition
    setIsOpen(true);
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    if (user) {
      userStoreApi.clearCart(user.uid).catch((err) => {
        console.warn('Firestore clearCart warning:', err);
      });
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalQuantity,
        subtotal,
        isLoadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
