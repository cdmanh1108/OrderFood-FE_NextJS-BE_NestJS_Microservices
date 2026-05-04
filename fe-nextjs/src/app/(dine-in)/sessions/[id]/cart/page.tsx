"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ChefHat,
  MessageSquare,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useTableSession } from "@/contexts/table-session-context";
import { Button } from "@/app/components/shared/Button";
import { formatCurrency } from "@/utils/cn";
import { sessionApi } from "@/services/api";

export default function DineInCartPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    currentSession,
    sessionCart,
    isHydrated,
    updateCartItem,
    updateCartItemNote,
    removeFromCart,
    clearCart,
    itemCount,
  } = useTableSession();

  const [orderNote, setOrderNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!currentSession || currentSession.id !== sessionId) {
      router.replace("/");
    }
  }, [isHydrated, currentSession, sessionId, router]);

  if (!isHydrated || !currentSession) return null;

  // Session closed after payment
  if (currentSession.status !== "ACTIVE") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-brand-beige/50 via-white to-brand-yellow/10 px-6 text-center">
        <span className="text-6xl">🎉</span>
        <h1 className="text-2xl font-bold text-brand-brown">Cảm ơn quý khách!</h1>
        <p className="max-w-xs text-brand-gray-600">Phiên bàn đã kết thúc. Bạn có thể xem lại các đơn đã gọi bên dưới.</p>
        <Link href={`/sessions/${sessionId}/orders`} className="mt-2 rounded-2xl bg-brand-amber px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-yellow">
          Xem đơn hàng
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async () => {
    if (sessionCart.items.length === 0) return;
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await sessionApi.placeOrder(currentSession.id, {
        note: orderNote || undefined,
        items: sessionCart.items.map((i) => ({
          menuItemId: i.menuItem.id,
          menuItemName: i.menuItem.name,
          menuItemImageUrl: i.menuItem.image || undefined,
          unitPrice: i.menuItem.price,
          quantity: i.quantity,
          note: i.note || undefined,
        })),
      });

      setSuccess("Gọi món thành công! Bếp đang chuẩn bị.");
      clearCart();
      setOrderNote("");

      setTimeout(() => {
        router.push(`/sessions/${sessionId}/orders`);
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra. Thử lại nhé!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveItemNote = (menuItemId: string) => {
    updateCartItemNote(menuItemId, noteInputs[menuItemId] ?? "");
    setEditingNoteId(null);
  };

  const handleStartEditNote = (menuItemId: string, currentNote?: string) => {
    setNoteInputs((prev) => ({ ...prev, [menuItemId]: currentNote ?? "" }));
    setEditingNoteId(menuItemId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige/50 via-white to-brand-yellow/10">
      <header className="sticky top-0 z-30 border-b border-brand-amber/10 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
          <Link
            href={`/sessions/${sessionId}/menu`}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-beige text-brand-brown transition hover:bg-brand-amber hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-amber">
              Dine-in cart
            </p>
            <h1 className="truncate text-xl font-bold text-brand-brown">
              Giỏ hàng — Bàn {currentSession.table.number}
            </h1>
            <p className="text-sm text-brand-gray-600">
              {itemCount > 0 ? `${itemCount} món đang chọn` : "Chưa có món"}
            </p>
          </div>

          {sessionCart.items.length > 0 && (
            <button
              onClick={clearCart}
              className="rounded-full px-4 py-2 text-sm font-semibold text-brand-danger transition hover:bg-brand-danger/10"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 lg:py-8">
        {success && (
          <div className="mb-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {sessionCart.items.length === 0 ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm text-center">
            <ShoppingCart className="mx-auto h-14 w-14 text-brand-gray-300 mb-4" />
            <p className="text-lg font-bold text-brand-brown">Giỏ hàng trống</p>
            <p className="mt-1 text-sm text-brand-gray-600 mb-6">
              Hãy chọn món từ thực đơn để gửi yêu cầu đến bếp.
            </p>
            <Link href={`/sessions/${sessionId}/menu`}>
              <Button variant="primary">Xem thực đơn</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Items list */}
            <section className="space-y-4">
              <div className="rounded-[2rem] border border-brand-amber/20 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-beige">
                    <ShoppingCart className="h-6 w-6 text-brand-amber" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brand-brown">Món đã chọn</h2>
                    <p className="text-sm text-brand-gray-600">
                      Kiểm tra số lượng và thêm ghi chú từng món.
                    </p>
                  </div>
                </div>
              </div>

              {sessionCart.items.map((item) => (
                <article
                  key={item.menuItem.id}
                  className="rounded-[2rem] border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-brand-amber/30"
                >
                  <div className="flex gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-brand-beige">
                      {item.menuItem.image ? (
                        <Image
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">🍽️</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex gap-2">
                        <h3 className="flex-1 truncate font-bold text-brand-brown">
                          {item.menuItem.name}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.menuItem.id)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-brand-gray-400 transition hover:bg-brand-danger/10 hover:text-brand-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                        <span className="font-bold text-brand-amber">
                          {formatCurrency(item.menuItem.price)}
                        </span>

                        <div className="flex items-center rounded-full border border-gray-100 bg-gray-50 p-1">
                          <button
                            onClick={() => updateCartItem(item.menuItem.id, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-brown shadow-sm transition hover:bg-brand-beige"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-brand-brown">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItem(item.menuItem.id, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-amber text-white shadow-sm transition hover:bg-brand-yellow"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-brand-gray-700">
                          = {formatCurrency(item.menuItem.price * item.quantity)}
                        </span>
                      </div>

                      {/* Per-item note */}
                      {editingNoteId === item.menuItem.id ? (
                        <div className="mt-3 flex gap-2">
                          <input
                            autoFocus
                            value={noteInputs[item.menuItem.id] ?? ""}
                            onChange={(e) =>
                              setNoteInputs((p) => ({
                                ...p,
                                [item.menuItem.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveItemNote(item.menuItem.id);
                              if (e.key === "Escape") setEditingNoteId(null);
                            }}
                            placeholder="Ghi chú cho món này..."
                            className="flex-1 rounded-xl border border-brand-amber/30 bg-brand-beige/50 px-3 py-2 text-sm outline-none focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/10"
                          />
                          <button
                            onClick={() => handleSaveItemNote(item.menuItem.id)}
                            className="rounded-xl bg-brand-amber px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-yellow"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-brand-gray-600 transition hover:bg-gray-50"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditNote(item.menuItem.id, item.note)}
                          className="mt-2 flex items-center gap-1.5 text-sm text-brand-gray-500 transition hover:text-brand-amber"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {item.note ? (
                            <span className="italic">{item.note}</span>
                          ) : (
                            <span>Thêm ghi chú</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}

              {/* Order-level note */}
              <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-brand-amber" />
                  <label className="font-bold text-brand-brown">
                    Ghi chú chung cho đơn
                  </label>
                </div>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Ví dụ: ít cay, không rau mùi, lấy thêm nước chấm..."
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-brand-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-amber focus:ring-4 focus:ring-brand-amber/10"
                />
              </div>
            </section>

            {/* Summary sidebar */}
            <aside>
              <div className="sticky top-24 rounded-[2rem] border border-brand-amber/20 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-brand-brown">Tổng đơn hàng</h2>
                <p className="mt-1 text-sm text-brand-gray-600">
                  Bàn {currentSession.table.number} · {itemCount} món
                </p>

                <div className="my-5 space-y-2 text-sm">
                  {sessionCart.items.map((i) => (
                    <div key={i.menuItem.id} className="flex justify-between text-brand-gray-600">
                      <span className="truncate max-w-[180px]">
                        {i.menuItem.name} <span className="text-brand-gray-400">x{i.quantity}</span>
                      </span>
                      <span className="shrink-0 font-medium">
                        {formatCurrency(i.menuItem.price * i.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-brown">Tạm tính</span>
                      <span className="text-xl font-bold text-brand-amber">
                        {formatCurrency(sessionCart.subtotal)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-gray-500">
                      * Thuế VAT và phí dịch vụ sẽ được tính khi thanh toán.
                    </p>
                  </div>
                </div>

                {/* Primary action */}
                <Button
                  variant="primary"
                  // fullWidth
                  onClick={handleSubmitOrder}
                  isLoading={isSubmitting}
                  disabled={isSubmitting || sessionCart.items.length === 0}
                  className="mb-3"
                >
                  Xác nhận gọi món
                </Button>

                {/* Secondary action */}
                <Link href={`/sessions/${sessionId}/menu`} className="block">
                  <Button variant="outline"
                  // fullWidth
                  >
                    Chọn thêm món
                  </Button>
                </Link>

                <p className="mt-4 rounded-2xl bg-brand-beige/50 px-4 py-3 text-center text-xs leading-relaxed text-brand-gray-600">
                  Món sẽ được gửi đến bếp ngay sau khi xác nhận.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}