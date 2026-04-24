import React, { createContext, useContext, useState, ReactNode } from "react";
import { MenuItem, CartItem, Cart } from "../types";

interface CartContextType {
  cart: Cart;
  addItem: (item: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08; // 8% VAT

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const calculateCart = (items: CartItem[]): Cart => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0,
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    return { items, subtotal, tax, total };
  };

  const addItem = (item: MenuItem, quantity = 1, notes = "") => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.menuItem.id === item.id);

      if (existingItem) {
        return prev.map((i) =>
          i.menuItem.id === item.id
            ? { ...i, quantity: i.quantity + quantity, note: notes || i.note }
            : i,
        );
      }

      return [...prev, { menuItem: item, quantity, note: notes }];
    });
  };

  const removeItem = (menuItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((i) => (i.menuItem.id === menuItemId ? { ...i, quantity } : i)),
    );
  };

  const updateNotes = (menuItemId: string, notes: string) => {
    setCartItems((prev) =>
      prev.map((i) => (i.menuItem.id === menuItemId ? { ...i, note: notes } : i)),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart: calculateCart(cartItems),
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        clearCart,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
