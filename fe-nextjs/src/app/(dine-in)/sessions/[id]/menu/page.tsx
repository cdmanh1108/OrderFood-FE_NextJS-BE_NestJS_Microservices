"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useTableSession } from "@/contexts/table-session-context";
import { Badge } from "@/app/components/shared/Badge";
import { formatCurrency } from "@/utils/cn";
import type { MenuItemApiModel } from "@/types/api";

export default function DineInMenuPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    currentSession,
    sessionCart,
    categories,
    menuItems,
    isMenuLoading,
    isHydrated,
    addToCart,
    updateCartItem,
    removeFromCart,
    itemCount,
  } = useTableSession();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isHydrated) return;
    if (!currentSession || currentSession.id !== sessionId) {
      router.replace("/");
    }
  }, [isHydrated, currentSession, sessionId, router]);

  if (!isHydrated || !currentSession) return null;

  // Session has been closed by staff after payment
  if (currentSession.status !== "ACTIVE") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-brand-beige/50 via-white to-brand-yellow/10 px-6 text-center">
        <span className="text-6xl">🎉</span>
        <h1 className="text-2xl font-bold text-brand-brown">Cảm ơn quý khách!</h1>
        <p className="max-w-xs text-brand-gray-600">
          Phiên bàn đã kết thúc sau khi thanh toán. Hẹn gặp lại!
        </p>
        <Link href="/" className="mt-2 rounded-2xl bg-brand-amber px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-yellow">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const displayItems = menuItems.filter((item) => {
    const matchCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchCategory && matchSearch;
  });

  const handleAdd = (item: MenuItemApiModel) => addToCart(item, 1);

  const handleRemove = (item: MenuItemApiModel) => {
    const existing = sessionCart.items.find((i) => i.menuItem.id === item.id);
    if (!existing) return;
    if (existing.quantity === 1) removeFromCart(item.id);
    else updateCartItem(item.id, existing.quantity - 1);
  };

  const getQty = (id: string) =>
    sessionCart.items.find((i) => i.menuItem.id === id)?.quantity ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige/50 via-white to-brand-yellow/10 pb-32">
      <header className="sticky top-0 z-30 border-b border-brand-amber/10 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-amber">
                Dine-in menu
              </p>
              <h1 className="truncate text-xl font-bold text-brand-brown">
                Bàn {currentSession.table.number}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="success">Đang phục vụ</Badge>
                <span className="text-xs text-brand-gray-500">
                  {currentSession.table.seats} chỗ ngồi
                </span>
                {currentSession.table.note && (
                  <span className="text-xs text-brand-gray-500 italic">
                    📍 {currentSession.table.note}
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/sessions/${sessionId}/orders`}
              className="flex shrink-0 items-center gap-3 rounded-2xl bg-brand-beige px-4 py-3 transition hover:bg-brand-amber hover:text-white"
            >
              <Receipt className="h-5 w-5 text-brand-brown" />
              <div className="text-left">
                <p className="text-xs text-brand-gray-600">Đơn đã gọi</p>
                <p className="text-sm font-bold text-brand-brown">Xem lại</p>
              </div>
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-gray-400" />
            <input
              type="text"
              placeholder="Tìm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-brand-gray-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition focus:border-brand-amber focus:ring-4 focus:ring-brand-amber/10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="mx-auto flex max-w-7xl gap-2 px-4 pb-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                selectedCategory === "all"
                  ? "bg-brand-brown text-white shadow-sm"
                  : "border border-brand-gray-200 bg-white text-brand-gray-600 hover:bg-brand-beige hover:text-brand-brown"
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-brand-brown text-white shadow-sm"
                    : "border border-brand-gray-200 bg-white text-brand-gray-600 hover:bg-brand-beige hover:text-brand-brown"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-brand-amber/20 bg-white shadow-sm">
          <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-7 text-white">
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="relative">
              <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <Sparkles className="h-4 w-4" />
                Gọi món tại bàn
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Chọn món bạn yêu thích
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Món sẽ được gửi tới bếp ngay sau khi bạn xác nhận giỏ hàng.
              </p>
            </div>
          </div>
        </section>

        {isMenuLoading ? (
          <div className="py-16 text-center text-brand-gray-500">
            Đang tải thực đơn...
          </div>
        ) : displayItems.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-beige">
              <Search className="h-7 w-7 text-brand-amber" />
            </div>
            <p className="text-lg font-bold text-brand-brown">
              Không tìm thấy món ăn
            </p>
            <p className="mt-1 text-sm text-brand-gray-600">
              Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
            {displayItems.map((item) => {
              const qty = getQty(item.id);
              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-amber/30 hover:shadow-md"
                >
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-brand-yellow/20 to-brand-amber/20">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={200}
                        height={200}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-5xl transition duration-300 group-hover:scale-110">
                        🍽️
                      </span>
                    )}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Badge variant="danger">Hết món</Badge>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-1 font-bold text-brand-brown">
                      {item.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-[40px] text-sm leading-relaxed text-brand-gray-600">
                      {item.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-brand-amber sm:text-base">
                        {formatCurrency(item.price)}
                      </span>

                      {qty === 0 ? (
                        <button
                          onClick={() => handleAdd(item)}
                          disabled={!item.isAvailable}
                          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-amber text-white shadow-sm transition hover:bg-brand-yellow disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      ) : (
                        <div className="flex items-center rounded-full border border-gray-100 bg-gray-50 p-1">
                          <button
                            onClick={() => handleRemove(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-brown shadow-sm transition hover:bg-brand-beige"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-brand-brown">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleAdd(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-amber text-white shadow-sm transition hover:bg-brand-yellow"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating cart button */}
      {itemCount > 0 && (
        <Link
          href={`/sessions/${sessionId}/cart`}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-brand-brown px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-coffee"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="hidden sm:inline">Giỏ hàng</span>
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-danger px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {itemCount}
          </span>
        </Link>
      )}
    </div>
  );
}