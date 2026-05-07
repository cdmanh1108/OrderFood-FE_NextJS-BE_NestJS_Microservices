"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { orderApi } from "@/services/api";
import type { OrderApiModel } from "@/types/api";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Package,
  Star,
  Wallet,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Bản nháp", color: "bg-gray-100 text-gray-800" },
  PLACED: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
  CANCELED: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};
// pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
// confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
// preparing: { label: "Đang chuẩn bị", color: "bg-purple-100 text-purple-800" },
// delivering: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
// completed: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
// cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
// };

export default function CustomerOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0 });
  const [recentOrders, setRecentOrders] = useState<OrderApiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          orderApi.getStats(),
          orderApi.list({ limit: 5 }),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData.items);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-beige/50 via-white to-brand-amber/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-brand-amber/20 bg-white shadow-sm">
          <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-8 text-white sm:px-8">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-16 h-20 w-20 rounded-full bg-white/10 blur-xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                  Tổng quan tài khoản
                </p>

                <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  Xin chào, {user?.name || "Khách"}!
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                  Chào mừng bạn quay trở lại với Bún Đậu Làng Mơ. Theo dõi đơn
                  hàng, điểm tích lũy và các ưu đãi dành riêng cho bạn.
                </p>
              </div>

              <Link
                href="/menu"
                className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-brown shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Xem menu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-beige">
                  <Package className="h-6 w-6 text-brand-amber" />
                </div>

                <div>
                  <p className="text-sm text-brand-gray-600">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-brand-brown">
                    {isLoading ? "..." : stats.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
                  <Star className="h-6 w-6 text-green-600" />
                </div>

                <div>
                  <p className="text-sm text-brand-gray-600">Điểm tích lũy</p>
                  <p className="text-2xl font-bold text-brand-brown">
                    {/* {mockCustomer.loyaltyPoints} */}
                    Sắp ra mắt
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50">
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>

                <div>
                  <p className="text-sm text-brand-gray-600">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold text-brand-brown">
                    {isLoading ? "..." : `${stats.totalSpent.toLocaleString("vi-VN")}đ`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <div>
              <h2 className="text-xl font-bold text-brand-brown">
                Đơn hàng gần đây
              </h2>
              <p className="mt-1 text-sm text-brand-gray-600">
                Theo dõi nhanh các đơn gần nhất của bạn.
              </p>
            </div>

            <Link
              href="/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-amber transition hover:text-brand-yellow"
            >
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-8 text-center text-brand-gray-600">Đang tải...</div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center text-brand-gray-600">Bạn chưa có đơn hàng nào.</div>
            ) : (
              recentOrders.map((order) => (
                <article
                  key={order.id}
                  className="p-6 transition hover:bg-brand-beige/20"
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold text-brand-brown">
                        {order.code}
                      </p>

                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand-gray-600">
                        <Clock className="h-4 w-4 text-brand-amber" />
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[order.status]?.color || "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                  </div>

                  <div className="mb-4 rounded-2xl bg-gray-50 px-4 py-3">
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <p key={index} className="text-sm text-gray-700">
                          {item.quantity}x {item.menuItemName}
                        </p>
                      ))}
                    </div>
                  </div>

                  <p className="text-xl font-bold text-brand-amber">
                    {(order.pricingSnapshot?.grandTotal || 0).toLocaleString("vi-VN")}đ
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

      </div>
    </main>
  );
}