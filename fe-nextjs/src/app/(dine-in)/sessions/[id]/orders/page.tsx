"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  Clock,
  Plus,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import { useTableSession } from "@/contexts/table-session-context";
import { Button } from "@/app/components/shared/Button";
import { Badge } from "@/app/components/shared/Badge";
import { formatCurrency } from "@/utils/cn";
import { sessionApi } from "@/services/api";
import type { OrderApiModel, FulfillmentStatus, OrderStatus } from "@/types/api";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const STATUS_MAP: Record<
  OrderStatus,
  { variant: "success" | "warning" | "danger" | "info" | "default"; label: string }
> = {
  DRAFT: { variant: "default", label: "Bản nháp" },
  PLACED: { variant: "warning", label: "Chờ xác nhận" },
  CONFIRMED: { variant: "info", label: "Đã xác nhận" },
  COMPLETED: { variant: "success", label: "Hoàn thành" },
  CANCELED: { variant: "danger", label: "Đã hủy" },
};

const FULFILLMENT_MAP: Record<
  FulfillmentStatus,
  { variant: "success" | "warning" | "danger" | "info" | "default"; label: string }
> = {
  NONE: { variant: "default", label: "Chờ bếp" },
  PREPARING: { variant: "warning", label: "Đang chuẩn bị" },
  READY_FOR_PICKUP: { variant: "info", label: "Sẵn sàng phục vụ" },
  SHIPPING: { variant: "info", label: "Đang phục vụ" },
  DELIVERED: { variant: "success", label: "Đã phục vụ" },
  FAILED: { variant: "danger", label: "Thất bại" },
};

export default function DineInOrdersPage() {
  const { id: sessionId } = useParams<{ id: string }>();
  const router = useRouter();
  const { currentSession, isHydrated, menuItems } = useTableSession();

  const [orders, setOrders] = useState<OrderApiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;
    if (!currentSession || currentSession.id !== sessionId) {
      router.replace("/");
    }
  }, [isHydrated, currentSession, sessionId, router]);

  const fetchOrders = useCallback(async () => {
    if (!currentSession) return;
    setIsLoading(true);
    try {
      const res = await sessionApi.getOrders(sessionId);
      setOrders(res.items);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, sessionId]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  if (!isHydrated || !currentSession) return null;

  const totalAmount = orders.reduce(
    (sum, o) => sum + (o.pricingSnapshot?.grandTotal ?? 0),
    0,
  );
  const totalItems = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );

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
              Dine-in orders
            </p>
            <h1 className="truncate text-xl font-bold text-brand-brown">
              Món đã gọi — Bàn {currentSession.table.number}
            </h1>
            <p className="text-sm text-brand-gray-600">
              {orders.length > 0
                ? `${orders.length} đơn • ${totalItems} món`
                : "Chưa có món nào"}
            </p>
          </div>

          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-beige text-brand-brown transition hover:bg-brand-amber hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 lg:py-8">
        {isLoading ? (
          <div className="py-16 text-center text-brand-gray-500">
            Đang tải...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm text-center">
            <ClipboardList className="mx-auto h-14 w-14 text-brand-gray-300 mb-4" />
            <p className="text-lg font-bold text-brand-brown">Chưa gọi món</p>
            <p className="mt-1 text-sm text-brand-gray-600 mb-6">
              Hãy chọn món từ thực đơn và xác nhận gọi món.
            </p>
            <Link href={`/sessions/${sessionId}/menu`}>
              <Button variant="primary">Xem thực đơn</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Orders list */}
            <section className="space-y-4">
              <div className="rounded-[2rem] border border-brand-amber/20 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-beige">
                    <ClipboardList className="h-6 w-6 text-brand-amber" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brand-brown">
                      Danh sách đơn đã gọi
                    </h2>
                    <p className="text-sm text-brand-gray-600">
                      Theo dõi trạng thái các món trong phiên bàn hiện tại.
                    </p>
                  </div>
                </div>
              </div>

              {[...orders].reverse().map((order) => {
                const statusCfg = STATUS_MAP[order.status];
                const fulfillCfg = FULFILLMENT_MAP[order.fulfillmentStatus];
                return (
                  <article
                    key={order.id}
                    className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-amber/30 hover:shadow-md sm:p-6"
                  >
                    {/* Order header */}
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-brand-brown">
                            Đơn #{order.code}
                          </h3>
                          <Badge variant={statusCfg.variant} size="sm">
                            {statusCfg.label}
                          </Badge>
                          <Badge variant={fulfillCfg.variant} size="sm">
                            {fulfillCfg.label}
                          </Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-gray-600">
                          <Clock className="h-4 w-4" />
                          {formatTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-brand-beige/60 px-4 py-2 text-left sm:text-right">
                        <p className="text-xs text-brand-gray-500">Tổng đơn</p>
                        <p className="font-bold text-brand-amber">
                          {formatCurrency(order.pricingSnapshot?.grandTotal ?? 0)}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => {
                        // Fallback lookup for orders stored without menuItemName
                        const fallback = menuItems.find(
                          (m) => m.id === item.menuItemId,
                        );
                        const displayName =
                          item.menuItemName ||
                          fallback?.name ||
                          item.menuItemId.slice(0, 8) + "...";
                        const displayImage =
                          item.menuItemImageUrl || fallback?.image || null;

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3"
                          >
                            {/* Thumbnail */}
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-beige">
                              {displayImage ? (
                                <img
                                  src={displayImage}
                                  alt={displayName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl">🍽️</span>
                              )}
                            </div>

                            {/* Name + note */}
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-brand-brown">
                                {displayName}
                              </p>
                              {item.note && (
                                <p className="mt-0.5 text-xs italic text-brand-gray-500">
                                  {item.note}
                                </p>
                              )}
                            </div>

                            {/* Qty + price */}
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-bold text-brand-brown">
                                x{item.quantity}
                              </p>
                              <p className="text-xs text-brand-gray-600">
                                {formatCurrency(
                                  (item.unitPrice ?? 0) * item.quantity,
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order note */}
                    {order.note && (
                      <div className="mt-4 rounded-2xl border border-brand-amber/10 bg-brand-beige/40 px-4 py-3">
                        <p className="text-sm text-brand-gray-600">
                          <span className="font-bold text-brand-brown">
                            Ghi chú:
                          </span>{" "}
                          {order.note}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>

            {/* Summary sidebar */}
            <aside>
              <div className="sticky top-24 rounded-[2rem] border border-brand-amber/20 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-beige">
                    <ReceiptText className="h-5 w-5 text-brand-amber" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-brand-brown">Tổng phiên</h2>
                    <p className="text-sm text-brand-gray-600">
                      Bàn {currentSession.table.number}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-brand-gray-600">
                    <span>Số đơn</span>
                    <span className="font-semibold">{orders.length}</span>
                  </div>
                  <div className="flex justify-between text-brand-gray-600">
                    <span>Tổng món</span>
                    <span className="font-semibold">{totalItems}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-brown">Tổng tiền</span>
                      <span className="text-2xl font-bold text-brand-amber">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-brand-gray-500">
                      * Thuế VAT và phí sẽ được tính khi thanh toán tại quầy.
                    </p>
                  </div>
                </div>

                <Link href={`/sessions/${sessionId}/menu`} className="mt-6 block">
                  <Button variant="primary" fullWidth>
                    <span className="inline-flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Gọi thêm món
                    </span>
                  </Button>
                </Link>

                <div className="mt-4 rounded-2xl bg-brand-beige/50 px-4 py-3 text-center">
                  <p className="text-xs leading-relaxed text-brand-gray-600">
                    Vui lòng thanh toán tại quầy khi kết thúc phiên dùng bữa.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}