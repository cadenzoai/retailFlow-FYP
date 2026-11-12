import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import * as cartApi from '@/api/cart';
import { CartItem } from '@/api/cart';
import { useAuth } from '@/context/auth-context';

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;

    if (!user || user.role !== 'user') {
      setItems([]);
      setError('');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const next = await cartApi.getCart();
      if (id !== requestId.current) return;
      setItems(next);
      setError('');
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : 'Could not load cart');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const applyCart = (next: CartItem[]) => {
    requestId.current += 1;
    setItems(next);
    setError('');
  };

  const addItem = useCallback(async (productId: string, quantity: number) => {
    applyCart(await cartApi.addCartItem(productId, quantity));
  }, []);

  const setQuantity = useCallback(async (productId: string, quantity: number) => {
    applyCart(await cartApi.updateCartItem(productId, quantity));
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    applyCart(await cartApi.removeCartItem(productId));
  }, []);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, total, loading, error, refresh, addItem, setQuantity, removeItem }),
    [items, count, total, loading, error, refresh, addItem, setQuantity, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return ctx;
}
