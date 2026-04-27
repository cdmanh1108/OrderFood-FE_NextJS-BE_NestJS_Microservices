"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Search, Utensils } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PublicHeader } from "../../components/layout/PublicHeader";
import { Input } from "../../components/shared/Input";
import { formatCurrency } from "../../../utils/cn";
import { categoryApi, menuItemApi } from "@/services/api";
import type {
  MenuCategorySimpleApiModel,
  MenuItemSimpleApiModel,
} from "@/types/api";

type CategoryFilter = "all" | string;

export default function MenuPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const didLoadCategoriesRef = useRef(false);

  const selectedCategory =
    (searchParams.get("category") ?? "all").trim() || "all";

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [categories, setCategories] = useState<MenuCategorySimpleApiModel[]>(
    [],
  );
  const [menuItems, setMenuItems] = useState<MenuItemSimpleApiModel[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (didLoadCategoriesRef.current) return;
    didLoadCategoriesRef.current = true;

    setIsLoadingCategories(true);

    try {
      const response = await categoryApi.menuCategories();
      setCategories(response);
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
    if (selectedCategory === "all") return undefined;

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
    if (selectedCategory !== "all" && categories.length === 0) {
      return;
    }

    if (selectedCategory !== "all" && !selectedCategoryId) {
      setMenuItems([]);
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
    loadMenuItems,
    categories.length,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige/40 via-white to-brand-amber/10">
      <PublicHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-brand-amber/20 bg-white shadow-sm">
          <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-8 text-white sm:px-8">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-16 h-20 w-20 rounded-full bg-white/10 blur-xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                Menu
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Thực đơn
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                Chọn món và thưởng thức hương vị truyền thống tại Bún Đậu Làng
                Mơ.
              </p>
            </div>
          </div>

          <div className="space-y-5 p-6 sm:p-8">
            {errorMessage && (
              <div className="rounded-2xl border border-brand-danger/30 bg-brand-danger/10 px-4 py-3 text-sm font-medium text-brand-danger">
                {errorMessage}
              </div>
            )}

            <div className="relative">
              <Input
                placeholder="Tìm theo tên món..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                leftIcon={<Search size={18} />}
              />
            </div>

            <div className="overflow-x-auto">
              <div className="flex gap-3 pb-2">
                <button
                  type="button"
                  onClick={() => handleCategoryChange("all")}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${selectedCategory === "all"
                      ? "bg-brand-brown text-white shadow-sm"
                      : "bg-brand-beige text-brand-brown hover:bg-brand-amber hover:text-white"
                    }`}
                >
                  Tất cả
                </button>

                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${selectedCategory === category.slug
                        ? "bg-brand-brown text-white shadow-sm"
                        : "bg-brand-beige text-brand-brown hover:bg-brand-amber hover:text-white"
                      }`}
                  >
                    {category.name}
                  </button>
                ))}

                {isLoadingCategories && (
                  <span className="whitespace-nowrap rounded-full bg-brand-beige px-4 py-2 text-sm text-brand-gray-500">
                    Đang tải...
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {isLoadingMenuItems ? (
          <section className="grid gap-6 pb-32 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] animate-pulse bg-brand-gray-100" />
                <div className="space-y-3 p-5">
                  <div className="h-5 animate-pulse rounded bg-brand-gray-100" />
                  <div className="h-4 animate-pulse rounded bg-brand-gray-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-brand-gray-100" />
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="grid gap-6 pb-32 sm:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-amber/40 hover:shadow-[var(--shadow-hover)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-yellow/20 to-brand-amber/20">
                  {item.image ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-sm">
                        <Utensils className="h-8 w-8 text-brand-amber" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-brand-brown transition group-hover:text-brand-amber">
                    {item.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-relaxed text-brand-gray-600">
                    {item.description || "Món ăn truyền thống thơm ngon."}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xl font-bold text-brand-amber">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>
              </article>
            ))}

            {menuItems.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-10 text-center sm:col-span-2 lg:col-span-3">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-beige">
                  <Search className="h-7 w-7 text-brand-amber" />
                </div>
                <p className="text-lg font-bold text-brand-brown">
                  Không có món ăn phù hợp
                </p>
                <p className="mt-1 text-sm text-brand-gray-600">
                  Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}