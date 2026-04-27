"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  MapPin,
  Package,
  ReceiptText,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { orderApi } from "@/services/api";
import type { OrderApiModel, OrderStatus } from "@/types/api";

type TabStatus = "all" | "pending" | "processing" | "delivering" | "completed" | "cancelled";

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    icon: typeof Clock;
  }
> = {
  DRAFT: { label: "Bản nháp", color: "bg-gray-50 text-gray-700 ring-gray-200", icon: Clock },
  PLACED: { label: "Chờ xác nhận", color: "bg-yellow-50 text-yellow-700 ring-yellow-200", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-50 text-blue-700 ring-blue-200", icon: CheckCircle },
  PREPARING: { label: "Đang chuẩn bị", color: "bg-purple-50 text-purple-700 ring-purple-200", icon: Package },
  READY: { label: "Chờ giao/lấy", color: "bg-orange-50 text-orange-700 ring-orange-200", icon: Truck },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-50 text-green-700 ring-green-200", icon: CheckCircle },
  CANCELED: { label: "Đã hủy", color: "bg-red-50 text-red-700 ring-red-200", icon: XCircle },
};

const tabs: { id: TabStatus; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "pending", label: "Chờ xác nhận" },
  { id: "processing", label: "Đang xử lý" },
  { id: "delivering", label: "Đang giao" },
  { id: "completed", label: "Đã hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

function getTabStatus(order: OrderApiModel): TabStatus {
  if (order.status === "CANCELED") return "cancelled";
  if (order.status === "COMPLETED") return "completed";
  if (order.status === "DRAFT" || order.status === "PLACED") return "pending";
  if (order.fulfillmentStatus === "SHIPPING" || order.fulfillmentStatus === "DELIVERED") return "delivering";
  return "processing"; // CONFIRMED, PREPARING, READY
}

function formatDateTime(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderApiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await orderApi.list({ page: 1, limit: 100 }); // Or handle pagination properly
        setOrders(res.items);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      delivering: orders.filter((o) => getTabStatus(o) === "delivering").length,
      completed: orders.filter((o) => getTabStatus(o) === "completed").length,
      cancelled: orders.filter((o) => getTabStatus(o) === "cancelled").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (activeTab === "all") return true;
      return getTabStatus(order) === activeTab;
    });
  }, [orders, activeTab]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-beige/40 via-white to-brand-amber/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-brand-amber/20 bg-white shadow-sm">
          <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-8 text-white sm:px-8">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-16 h-20 w-20 rounded-full bg-white/10 blur-xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                Đơn hàng của tôi
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Lịch sử đơn hàng
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                Theo dõi trạng thái, xem chi tiết và quản lý các đơn hàng của bạn.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4 sm:p-8">
            <div className="rounded-2xl bg-brand-beige/50 p-4">
              <p className="text-sm text-gray-500">Tổng đơn</p>
              <p className="mt-1 text-2xl font-bold text-brand-brown">{orderStats.total}</p>
            </div>
            <div className="rounded-2xl bg-orange-50 p-4">
              <p className="text-sm text-gray-500">Đang giao</p>
              <p className="mt-1 text-2xl font-bold text-orange-700">{orderStats.delivering}</p>
            </div>
            <div className="rounded-2xl bg-green-50 p-4">
              <p className="text-sm text-gray-500">Hoàn thành</p>
              <p className="mt-1 text-2xl font-bold text-green-700">{orderStats.completed}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-sm text-gray-500">Đã hủy</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{orderStats.cancelled}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === tab.id
                    ? "bg-brand-amber text-white shadow-sm"
                    : "text-gray-600 hover:bg-brand-beige hover:text-brand-brown"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {isLoading ? (
          <div className="py-12 text-center text-brand-brown">Đang tải danh sách đơn hàng...</div>
        ) : filteredOrders.length === 0 ? (
          <section className="rounded-[2rem] border border-dashed border-gray-300 bg-white px-5 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-beige">
              <Package className="h-8 w-8 text-brand-amber" />
            </div>
            <h3 className="text-lg font-bold text-brand-brown">Chưa có đơn hàng</h3>
            <p className="mt-1 text-sm text-gray-500">Bạn chưa có đơn hàng nào trong danh mục này.</p>
          </section>
        ) : (
          <section className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              const isExpanded = selectedOrder === order.id;
              const totalAmount = order.pricingSnapshot?.grandTotal || 0;

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-amber/30 hover:shadow-md"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-beige">
                            <ReceiptText className="h-5 w-5 text-brand-amber" />
                          </div>

                          <div>
                            <h3 className="font-bold text-brand-brown">{order.code}</h3>
                            <p className="text-xs text-gray-500">Đặt lúc: {formatDateTime(order.createdAt)}</p>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusConfig[order.status].color
                              }`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusConfig[order.status].label}
                          </span>
                        </div>

                        <div className="rounded-2xl bg-gray-50 p-4">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1.5">
                              <ShoppingBag className="h-4 w-4 text-brand-amber" />
                              {order.items.length} món
                            </span>
                            <span>•</span>
                            <span>{order.channel === "ONLINE" ? "Giao hàng" : "Tại quán"}</span>
                            {order.completedAt && (
                              <>
                                <span>•</span>
                                <span>Hoàn thành: {formatDateTime(order.completedAt)}</span>
                              </>
                            )}
                          </div>

                          {!isExpanded && (
                            <p className="mt-2 line-clamp-1 text-sm text-gray-700">
                              {order.items.map((item) => `${item.quantity}x ${item.menuItemName}`).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-row items-center justify-between gap-4 lg:flex-col lg:items-end">
                        <div className="text-left lg:text-right">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Tổng tiền</p>
                          <p className="mt-1 text-2xl font-bold text-brand-coffee">{formatCurrency(totalAmount)}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(isExpanded ? null : order.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-brand-amber/30 px-4 py-2 text-sm font-semibold text-brand-amber transition hover:bg-brand-amber hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          {isExpanded ? "Thu gọn" : "Chi tiết"}
                          <ChevronDown className={`h-4 w-4 transition ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/80 p-5 sm:p-6">
                      <div className="space-y-5">
                        <div>
                          <h4 className="mb-3 font-bold text-brand-brown">Chi tiết món ăn</h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm"
                              >
                                <div>
                                  <p className="font-semibold text-gray-900">{item.menuItemName}</p>
                                  <p className="mt-1 text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                </div>

                                <div className="text-right">
                                  <p className="font-bold text-brand-coffee">{formatCurrency(item.unitPrice)}</p>
                                  <p className="text-xs text-gray-400">/ món</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {order.shippingAddress && (
                          <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <h4 className="mb-2 flex items-center gap-2 font-bold text-brand-brown">
                              <MapPin className="h-4 w-4 text-brand-amber" />
                              Địa chỉ giao hàng
                            </h4>
                            <p className="text-sm leading-6 text-gray-700">
                              {order.shippingAddress.receiverName} - {order.shippingAddress.receiverPhone}<br />
                              {order.shippingAddress.street ? `${order.shippingAddress.street}, ` : ''}
                              {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                              {order.shippingAddress.detail ? ` (${order.shippingAddress.detail})` : ''}
                            </p>
                          </div>
                        )}

                        {order.status === "COMPLETED" && (
                          <div className="pt-1">
                            <button className="w-full rounded-2xl bg-brand-amber py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-yellow hover:shadow-md">
                              Đánh giá đơn hàng
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
