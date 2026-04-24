import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cartApi } from "@/services/api";
import type { CartApiModel, CartItemApiModel } from "@/types/api";
import { toSlug } from "@/utils/cn";
import { useAuth } from "./auth-context";
import type { Cart, CartItem, MenuItem } from "../types";

interface CartContextType {
  cart: Cart;
  addItem: (item: MenuItem, quantity?: number, notes?: string) => Promise<void>;
  removeItem: (menuItemId: string) => Promise<void>;
  updateQuantity: (menuItemId: string, quantity: number) => Promise<void>;
  updateNotes: (menuItemId: string, notes: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const TAX_RATE = 0.08;

function mapCartApiItemToAppItem(item: CartItemApiModel): CartItem {
  const now = new Date().toISOString();

  return {
    menuItem: {
      id: item.menuItemId,
      categoryId: "",
      name: item.menuItemName,
      slug: toSlug(item.menuItemName),
      description: "",
      price: item.unitPrice,
      image: item.menuItemImageUrl ?? undefined,
      isAvailable: true,
      isFeatured: false,
      order: 0,
      createdAt: now,
      updatedAt: now,
    },
    quantity: item.quantity,
    note: item.note ?? undefined,
  };
}

function mapCartApiToAppCart(cart: CartApiModel | null): Cart {
  if (!cart) {
    return {
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    };
  }

  const items = cart.items.map(mapCartApiItemToAppItem);
  const subtotal = cart.subtotal;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return { items, subtotal, tax, total };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [activeCart, setActiveCart] = useState<CartApiModel | null>(null);

  const loadActiveCart = useCallback(async () => {
    if (!user?.id) {
      setActiveCart(null);
      return null;
    }

    const response = await cartApi.getActive({
      userId: user.id,
      channel: "ONLINE",
      source: "WEB",
      createIfMissing: true,
    });

    setActiveCart(response);
    return response;
  }, [user?.id]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user?.id) {
      setActiveCart(null);
      return;
    }

    void loadActiveCart().catch(() => {
      setActiveCart(null);
    });
  }, [isAuthLoading, loadActiveCart, user?.id]);

  const ensureActiveCart = useCallback(async (): Promise<CartApiModel> => {
    if (activeCart) {
      return activeCart;
    }

    const loadedCart = await loadActiveCart();
    if (!loadedCart) {
      throw new Error("Khong the khoi tao gio hang");
    }

    return loadedCart;
  }, [activeCart, loadActiveCart]);

  const addItem = useCallback(
    async (item: MenuItem, quantity = 1, notes = "") => {
      const currentCart = await ensureActiveCart();
      const response = await cartApi.addItem({
        cartId: currentCart.id,
        menuItemId: item.id,
        menuItemName: item.name,
        menuItemImageUrl: item.image,
        unitPrice: item.price,
        quantity,
        note: notes || undefined,
      });

      setActiveCart(response);
    },
    [ensureActiveCart],
  );

  const removeItem = useCallback(
    async (menuItemId: string) => {
      const currentCart = await ensureActiveCart();
      const targetItem = currentCart.items.find(
        (item) => item.menuItemId === menuItemId,
      );

      if (!targetItem) {
        return;
      }

      await cartApi.removeItem({
        cartId: currentCart.id,
        itemId: targetItem.id,
      });

      await loadActiveCart();
    },
    [ensureActiveCart, loadActiveCart],
  );

  const updateQuantity = useCallback(
    async (menuItemId: string, quantity: number) => {
      if (quantity <= 0) {
        await removeItem(menuItemId);
        return;
      }

      const currentCart = await ensureActiveCart();
      const targetItem = currentCart.items.find(
        (item) => item.menuItemId === menuItemId,
      );

      if (!targetItem) {
        return;
      }

      const response = await cartApi.updateItem({
        cartId: currentCart.id,
        itemId: targetItem.id,
        quantity,
      });

      setActiveCart(response);
    },
    [ensureActiveCart, removeItem],
  );

  const updateNotes = useCallback(
    async (menuItemId: string, notes: string) => {
      const currentCart = await ensureActiveCart();
      const targetItem = currentCart.items.find(
        (item) => item.menuItemId === menuItemId,
      );

      if (!targetItem) {
        return;
      }

      const response = await cartApi.updateItem({
        cartId: currentCart.id,
        itemId: targetItem.id,
        note: notes,
      });

      setActiveCart(response);
    },
    [ensureActiveCart],
  );

  const clearCart = useCallback(async () => {
    const currentCart = await ensureActiveCart();
    await cartApi.clear({ cartId: currentCart.id });
    await loadActiveCart();
  }, [ensureActiveCart, loadActiveCart]);

  const cart = useMemo(() => mapCartApiToAppCart(activeCart), [activeCart]);

  const getItemCount = useCallback(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  return (
    <CartContext.Provider
      value={{
        cart,
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
