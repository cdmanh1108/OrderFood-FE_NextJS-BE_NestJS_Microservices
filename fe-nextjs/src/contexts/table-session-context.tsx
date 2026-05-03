"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { TableSessionApiModel, MenuItemApiModel } from "@/types/api";
import { sessionApi, menuItemApi, categoryApi } from "@/services/api";
import type { MenuCategorySimpleApiModel } from "@/types/api";

// ---- Cart types ----

export interface CartItem {
  menuItem: MenuItemApiModel;
  quantity: number;
  note?: string;
}

export interface SessionCart {
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// ---- Context type ----

export interface TableSessionContextType {
  currentSession: TableSessionApiModel | null;
  sessionCart: SessionCart;
  categories: MenuCategorySimpleApiModel[];
  menuItems: MenuItemApiModel[];
  isLoading: boolean;
  isMenuLoading: boolean;
  isHydrated: boolean;
  itemCount: number;
  joinSession: (tableId: string) => Promise<TableSessionApiModel>;
  addToCart: (menuItem: MenuItemApiModel, quantity?: number, note?: string) => void;
  updateCartItem: (menuItemId: string, quantity: number) => void;
  updateCartItemNote: (menuItemId: string, note: string) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  leaveSession: () => void;
}

const TAX_RATE = 0.1;

const TableSessionContext = createContext<TableSessionContextType | undefined>(
  undefined,
);

function calcTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, tax, total: subtotal + tax };
}

export function TableSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentSession, setCurrentSession] =
    useState<TableSessionApiModel | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<MenuCategorySimpleApiModel[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemApiModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore session + cart from sessionStorage, then verify status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const restore = async () => {
      try {
        const savedSession = sessionStorage.getItem("dinein_session");
        const savedCart = sessionStorage.getItem("dinein_cart");
        if (savedCart) setCartItems(JSON.parse(savedCart));

        if (savedSession) {
          const parsed: TableSessionApiModel = JSON.parse(savedSession);
          // Re-fetch to get latest status (session might have been closed by staff)
          try {
            const fresh = await sessionApi.getById(parsed.id);
            setCurrentSession(fresh);
            if (fresh.status !== "ACTIVE") {
              // Session is CLOSED — clear from storage so next visit is fresh
              sessionStorage.removeItem("dinein_session");
              sessionStorage.removeItem("dinein_cart");
              setCartItems([]);
            }
          } catch {
            // If API fails, keep cached session data
            setCurrentSession(parsed);
          }
        }
      } catch {
        // ignore parse errors
      } finally {
        setIsHydrated(true);
      }
    };

    void restore();
  }, []);

  // Persist session
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentSession) {
      sessionStorage.setItem("dinein_session", JSON.stringify(currentSession));
    } else {
      sessionStorage.removeItem("dinein_session");
    }
  }, [currentSession]);

  // Persist cart
  useEffect(() => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("dinein_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Load menu data when session is active
  const loadMenuData = useCallback(async () => {
    if (isMenuLoading) return;
    setIsMenuLoading(true);
    try {
      const [cats, items] = await Promise.all([
        categoryApi.menuCategories({ isActive: true }),
        menuItemApi.list({ isActive: true, isAvailable: true, limit: 100 }),
      ]);
      setCategories(cats);
      setMenuItems(items.items);
    } catch {
      // keep empty, will retry on next render
    } finally {
      setIsMenuLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentSession) {
      void loadMenuData();
    }
  }, [currentSession, loadMenuData]);

  const joinSession = async (tableId: string): Promise<TableSessionApiModel> => {
    setIsLoading(true);
    try {
      const session = await sessionApi.joinOrCreate(tableId);
      setCurrentSession(session);
      setCartItems([]);
      return session;
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (menuItem: MenuItemApiModel, quantity = 1, note?: string) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.menuItem.id === menuItem.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + quantity,
          note: note ?? updated[idx].note,
        };
        return updated;
      }
      return [...prev, { menuItem, quantity, note }];
    });
  };

  const updateCartItem = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, quantity } : i,
      ),
    );
  };

  const updateCartItemNote = (menuItemId: string, note: string) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.menuItem.id === menuItemId ? { ...i, note } : i,
      ),
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.menuItem.id !== menuItemId));
  };

  const clearCart = () => setCartItems([]);

  const leaveSession = () => {
    setCurrentSession(null);
    setCartItems([]);
    setMenuItems([]);
    setCategories([]);
    sessionStorage.removeItem("dinein_session");
    sessionStorage.removeItem("dinein_cart");
  };

  const { subtotal, tax, total } = calcTotals(cartItems);
  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const sessionCart: SessionCart = {
    sessionId: currentSession?.id ?? "",
    items: cartItems,
    subtotal,
    tax,
    total,
  };

  return (
    <TableSessionContext.Provider
      value={{
        currentSession,
        sessionCart,
        categories,
        menuItems,
        isLoading,
        isMenuLoading,
        isHydrated,
        itemCount,
        joinSession,
        addToCart,
        updateCartItem,
        updateCartItemNote,
        removeFromCart,
        clearCart,
        leaveSession,
      }}
    >
      {children}
    </TableSessionContext.Provider>
  );
}

export function useTableSession() {
  const ctx = useContext(TableSessionContext);
  if (!ctx) {
    throw new Error("useTableSession must be used within TableSessionProvider");
  }
  return ctx;
}
