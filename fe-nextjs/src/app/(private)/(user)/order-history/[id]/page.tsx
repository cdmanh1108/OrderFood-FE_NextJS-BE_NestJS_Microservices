"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  Truck,
  XCircle,
} from "lucide-react";
import { PublicHeader } from "@/app/components/layout/PublicHeader";
import { orderApi } from "@/services/api";
import type { OrderApiModel, OrderStatus } from "@/types/api";
import { formatCurrency } from "@/utils/cn";

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  DRAFT: "Nháp",
  PLACED: "Đã đặt",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  READY: "Sẵn sàng",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
};

const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PLACED: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-amber-50 text-amber-700",
  PREPARING: "bg-orange-50 text-orange-700",
  READY: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELED: "bg-red-50 text-red-700",
};

function formatDateTime(value: string | null) {
  if (!value) return "Chưa có";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAddress(order: OrderApiModel) {
  const address = order.shippingAddress;
  if (!address) return "Không có địa chỉ giao hàng";

  return [address.street, address.ward, address.district, address.province]
    .filter(Boolean)
    .join(", ");
}

export default function CustomerOrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [order, setOrder] = useState<OrderApiModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const orderId = params.id;

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);

      try {
        const response = await orderApi.getById(orderId);
        setOrder(response);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không thể tải chi tiết đơn hàng",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      void loadOrder();
    }
  }, [orderId]);

  const timeline = useMemo(() => {
    if (!order) return [];

    return [
      {
        label: "Tạo đơn",
        time: order.createdAt,
        active: true,
        icon: ReceiptText,
      },
      {
        label: "Đặt hàng",
        time: order.placedAt,
        active: Boolean(order.placedAt),
        icon: Clock,
      },
      {
        label: "Xác nhận",
        time: order.confirmedAt,
        active: Boolean(order.confirmedAt),
        icon: CheckCircle2,
      },
      {
        label: "Hoàn thành",
        time: order.completedAt,
        active: Boolean(order.completedAt),
        icon: Package,
      },
    ];
  }, [order]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige/40 via-white to-brand-amber/10">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-brown transition hover:text-brand-amber"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        {isLoading ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="animate-pulse space-y-5">
              <div className="h-8 w-1/3 rounded bg-gray-100" />
              <div className="h-24 rounded-2xl bg-gray-100" />
              <div className="h-64 rounded-2xl bg-gray-100" />
            </div>
          </div>
        ) : errorMessage ? (
          <div className="rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-sm">
            <XCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <h1 className="text-xl font-bold text-brand-brown">
              Không thể tải đơn hàng
            </h1>
            <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
          </div>
        ) : order ? (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-brand-amber/20 bg-white shadow-sm">
              <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-8 text-white sm:px-8">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 right-16 h-20 w-20 rounded-full bg-white/10 blur-xl" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                      Chi tiết đơn hàng
                    </p>
                    <h1 className="mt-3 text-3xl font-bold text-white">
                      #{order.code}
                    </h1>
                    <p className="mt-2 text-sm text-white/80">
                      Tạo lúc {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${
                      ORDER_STATUS_CLASS[order.status]
                    }`}
                  >
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
                <div className="rounded-2xl bg-brand-beige/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-brown">
                    <CreditCard className="h-4 w-4" />
                    Thanh toán
                  </div>
                  <p className="text-sm text-gray-600">{order.paymentStatus}</p>
                </div>

                <div className="rounded-2xl bg-brand-beige/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-brown">
                    <Truck className="h-4 w-4" />
                    Giao hàng
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.fulfillmentStatus}
                  </p>
                </div>

                <div className="rounded-2xl bg-brand-beige/50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-brown">
                    <ReceiptText className="h-4 w-4" />
                    Kênh đặt
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.channel} - {order.source}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="mb-5 text-xl font-bold text-brand-brown">
                    Món đã đặt
                  </h2>

                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm"
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brand-beige">
                          {item.menuItemImageUrl ? (
                            <div
                              className="h-full w-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${item.menuItemImageUrl})`,
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl">
                              🍽️
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-brand-brown">
                            {item.menuItemName}
                          </h3>

                          {item.note && (
                            <p className="mt-1 text-sm italic text-gray-500">
                              Ghi chú: {item.note}
                            </p>
                          )}

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="text-sm text-gray-500">
                              {formatCurrency(item.unitPrice)} x {item.quantity}
                            </p>

                            <p className="font-bold text-brand-amber">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="mb-5 text-xl font-bold text-brand-brown">
                    Tiến trình đơn hàng
                  </h2>

                  <div className="space-y-4">
                    {timeline.map((step) => {
                      const Icon = step.icon;

                      return (
                        <div key={step.label} className="flex gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                              step.active
                                ? "bg-brand-amber text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="font-semibold text-brand-brown">
                              {step.label}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDateTime(step.time)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {order.canceledAt && (
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                          <XCircle className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-semibold text-red-600">
                            Đơn đã hủy
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(order.canceledAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-xl font-bold text-brand-brown">
                    Tổng thanh toán
                  </h2>

                  {order.pricingSnapshot ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tạm tính</span>
                        <span className="font-medium text-brand-brown">
                          {formatCurrency(order.pricingSnapshot.itemsSubtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Phí giao hàng</span>
                        <span className="font-medium text-brand-brown">
                          {formatCurrency(order.pricingSnapshot.shippingFee)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Phí dịch vụ</span>
                        <span className="font-medium text-brand-brown">
                          {formatCurrency(order.pricingSnapshot.serviceFee)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-500">Giảm giá</span>
                        <span className="font-medium text-green-600">
                          -{formatCurrency(order.pricingSnapshot.discountTotal)}
                        </span>
                      </div>

                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex justify-between">
                          <span className="font-bold text-brand-brown">
                            Tổng cộng
                          </span>
                          <span className="text-xl font-bold text-brand-amber">
                            {formatCurrency(order.pricingSnapshot.grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Không có thông tin thanh toán.
                    </p>
                  )}
                </div>

                <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-xl font-bold text-brand-brown">
                    Thông tin nhận hàng
                  </h2>

                  {order.shippingAddress ? (
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-bold text-brand-brown">
                          {order.shippingAddress.receiverName}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          {order.shippingAddress.receiverPhone}
                        </p>
                      </div>

                      <div className="flex gap-2 text-gray-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <p>{formatAddress(order)}</p>
                          {order.shippingAddress.detail && (
                            <p className="mt-1 italic">
                              Ghi chú: {order.shippingAddress.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Không có địa chỉ giao hàng.
                    </p>
                  )}
                </div>

                {order.note && (
                  <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-xl font-bold text-brand-brown">
                      Ghi chú đơn hàng
                    </h2>
                    <p className="text-sm italic text-gray-600">{order.note}</p>
                  </div>
                )}
              </aside>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
