"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Minus, Search, ShoppingCart } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Button } from "../../components/shared/Button";
import { Input } from "../../components/shared/Input";
import { formatCurrency } from "../../../utils/cn";
import { categoryApi, menuItemApi } from "@/services/api";
import type { CategoryApiModel, MenuItemSimpleApiModel } from "@/types/api";

type CategoryFilter = "all" | string;

type PublicCartItem = {
  key: string;
  menuItem: MenuItemSimpleApiModel;
  quantity: number;
};

const getMenuItemKey = (item: MenuItemSimpleApiModel): string =>
  [
    item.name.trim().toLowerCase(),
    item.price.toString(),
    item.image ?? "",
    item.description ?? "",
  ].join("::");

export default function MenuPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory =
    (searchParams.get("category") ?? "all").trim() || "all";

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [categories, setCategories] = useState<CategoryApiModel[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemSimpleApiModel[]>([]);
  const [cart, setCart] = useState<PublicCartItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);

    try {
      const response = await categoryApi.list({
        isActive: true,
        page: 1,
        limit: 100,
        sortBy: "sortOrder",
        sortOrder: "asc",
      });
      setCategories(response.items);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách danh mục",
      );
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const loadMenuItems = useCallback(
    async (
      categoryId: string | undefined,
      keywordQuery: string,
    ): Promise<MenuItemSimpleApiModel[]> => {
      setIsLoadingMenuItems(true);

      try {
        const response = await menuItemApi.menu({
          categoryId,
          keyword: keywordQuery || undefined,
          limit: 100,
        });
        setErrorMessage(null);
        return response;
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách món ăn",
        );
        return [];
      } finally {
        setIsLoadingMenuItems(false);
      }
    },
    [],
  );

  const selectedCategoryId = useMemo(() => {
    if (selectedCategory === "all") {
      return undefined;
    }

    return categories.find((category) => category.slug === selectedCategory)
      ?.id;
  }, [categories, selectedCategory]);

  const handleCategoryChange = useCallback(
    (category: CategoryFilter) => {
      const params = new URLSearchParams(searchParams.toString());

      if (category === "all") {
        params.delete("category");
      } else {
        params.set("category", category);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);

    return () => {
      window.clearTimeout(debounceTimer);
    };
  }, [keyword]);

  useEffect(() => {
    if (selectedCategory !== "all" && !selectedCategoryId) {
      if (!isLoadingCategories) {
        setMenuItems([]);
      }
      return;
    }

    const run = async () => {
      const items = await loadMenuItems(selectedCategoryId, debouncedKeyword);
      setMenuItems(items);
    };

    void run();
  }, [
    selectedCategory,
    selectedCategoryId,
    debouncedKeyword,
    isLoadingCategories,
    loadMenuItems,
  ]);

  const addToCart = (menuItemKey: string) => {
    const selectedMenuItem =
      menuItems.find((item) => getMenuItemKey(item) === menuItemKey) ??
      cart.find((item) => item.key === menuItemKey)?.menuItem;

    if (!selectedMenuItem) {
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => item.key === menuItemKey);

      if (existingItem) {
        return prev.map((item) =>
          item.key === menuItemKey
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...prev, { key: menuItemKey, menuItem: selectedMenuItem, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemKey: string) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.key === menuItemKey);

      if (!existingItem) {
        return prev;
      }

      if (existingItem.quantity === 1) {
        return prev.filter((item) => item.key !== menuItemKey);
      }

      return prev.map((item) =>
        item.key === menuItemKey
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      );
    });
  };

  const getItemQuantity = (menuItemKey: string): number => {
    const item = cart.find((cartItem) => cartItem.key === menuItemKey);
    return item?.quantity || 0;
  };

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );
  const totalPrice = useMemo(
    () =>
      cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
    [cart],
  );

  return (
    <div className="min-h-screen bg-brand-white">
      <PublicHeader cartItemsCount={totalItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-brown mb-2">
            Thực đơn
          </h1>
          <p className="text-lg text-brand-gray-600">
            Chọn món và thưởng thức hương vị truyền thống
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-brand-danger/30 bg-brand-danger/10 px-4 py-3 text-sm text-brand-danger">
            {errorMessage}
          </div>
        )}

        <div className="mb-6">
          <Input
            placeholder="Tìm theo tên món hoặc slug..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            <button
              onClick={() => handleCategoryChange("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-brand-brown text-white shadow-sm"
                  : "bg-white text-brand-gray-600 hover:bg-brand-gray-50"
              }`}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category.slug
                    ? "bg-brand-brown text-white shadow-sm"
                    : "bg-white text-brand-gray-600 hover:bg-brand-gray-50"
                }`}
              >
                {category.name}
              </button>
            ))}
            {isLoadingCategories && (
              <span className="px-4 py-2 text-sm text-brand-gray-500">
                Đang tải
              </span>
            )}
          </div>
        </div>

        {isLoadingMenuItems ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-brand-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-5 rounded bg-brand-gray-100" />
                  <div className="h-4 rounded bg-brand-gray-100" />
                  <div className="h-4 rounded bg-brand-gray-100 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
            {menuItems.map((item, index) => {
              const itemKey = getMenuItemKey(item);
              const quantity = getItemQuantity(itemKey);

              return (
                <div
                  key={`${itemKey}-${index}`}
                  className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-brand-yellow/20 to-brand-amber/20 flex items-center justify-center relative overflow-hidden">
                    {item.image ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${item.image})` }}
                      />
                    ) : (
                      <span className="text-6xl">🍽️</span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-brand-brown mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-brand-gray-600 mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-brand-brown">
                        {formatCurrency(item.price)}
                      </span>

                      {quantity === 0 ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => addToCart(itemKey)}
                          leftIcon={<Plus size={16} />}
                        >
                          Thêm
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(itemKey)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-brown transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-semibold text-brand-brown">
                            {quantity}
                          </span>
                          <button
                            onClick={() => addToCart(itemKey)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-yellow hover:bg-brand-amber text-brand-brown transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {menuItems.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-[var(--radius-card)] border border-brand-gray-200 bg-white p-8 text-center text-brand-gray-600">
                Không có món ăn phù hợp
              </div>
            )}
          </div>
        )}

        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-gray-200 shadow-[var(--shadow-wood)] z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-yellow/20">
                    <ShoppingCart className="text-brand-brown" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-gray-600">
                      {totalItems} món
                    </p>
                    <p className="text-lg font-bold text-brand-brown">
                      {formatCurrency(totalPrice)}
                    </p>
                  </div>
                </div>
                <Button variant="primary" size="lg">
                  Đặt hàng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
