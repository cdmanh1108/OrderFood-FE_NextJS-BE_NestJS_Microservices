"use client";

import React, { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import { Input } from "@/app/components/shared/Input";
import { Badge } from "@/app/components/shared/Badge";
import { DataTable, Column } from "@/app/components/shared/DataTable";
import { Button } from "@/app/components/shared/Button";
import { formatCurrency } from "@/utils/cn";
import { orderApi } from "@/services/api";
import type { OrderApiModel, OrderStatus, PaymentStatus } from "@/types/api";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderApiModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const res = await orderApi.listAdmin({ page: 1, limit: 100 });
        setOrders(res.items);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(
    (order) =>
      order.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress?.receiverName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getOrderStatusBadge = (status: OrderStatus) => {
    const config: Record<OrderStatus, { variant: "warning" | "info" | "success" | "danger" | "default"; label: string }> = {
      DRAFT: { variant: "default", label: "Bản nháp" },
      PLACED: { variant: "warning", label: "Chờ xác nhận" },
      CONFIRMED: { variant: "info", label: "Đã xác nhận" },
      PREPARING: { variant: "warning", label: "Đang chuẩn bị" },
      READY: { variant: "success", label: "Sẵn sàng" },
      COMPLETED: { variant: "success", label: "Hoàn thành" },
      CANCELED: { variant: "danger", label: "Đã hủy" },
    };
    return config[status] || { variant: "default", label: status };
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { variant: "warning" | "info" | "success" | "danger" | "default"; label: string }> = {
      UNPAID: { variant: "warning", label: "Chưa thanh toán" },
      PENDING: { variant: "info", label: "Đang xử lý" },
      PAID: { variant: "success", label: "Đã thanh toán" },
      FAILED: { variant: "danger", label: "Thất bại" },
      REFUNDED: { variant: "danger", label: "Đã hoàn tiền" },
    };
    return config[status] || { variant: "default", label: status };
  };

  const columns: Column<OrderApiModel>[] = [
    {
      key: "code",
      label: "Mã Đơn",
      render: (order) => (
        <span className="font-semibold text-brand-brown">
          {order.code}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Khách Hàng",
      render: (order) => (
        <div>
          <p className="font-medium text-brand-brown">
            {order.shippingAddress?.receiverName || "Khách lẻ"}
          </p>
          {order.tableId && (
            <p className="text-xs text-brand-gray-500">
              Bàn: {order.tableId}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "items",
      label: "Số Món",
      render: (order) => <span>{order.items.length} món</span>,
    },
    {
      key: "total",
      label: "Tổng Tiền",
      render: (order) => (
        <span className="font-semibold text-brand-brown">
          {formatCurrency(order.pricingSnapshot?.grandTotal || 0)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng Thái",
      render: (order) => {
        const badge = getOrderStatusBadge(order.status);
        return (
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        );
      },
    },
    {
      key: "paymentStatus",
      label: "Thanh Toán",
      render: (order) => {
        const badge = getPaymentStatusBadge(order.paymentStatus);
        return (
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Thời Gian",
      render: (order) => formatDateTime(order.createdAt),
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-2">
          Quản Lý Đơn Hàng
        </h1>
        <p className="text-brand-gray-600">Theo dõi và xử lý đơn hàng</p>
      </div>

      <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
        <Input
          placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
        />
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-brand-brown">Đang tải danh sách đơn hàng...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredOrders}
          actions={(order) => (
            <Button variant="ghost" size="sm" leftIcon={<Eye size={16} />}>
              Xem
            </Button>
          )}
          emptyState={{
            title: "Không tìm thấy đơn hàng",
            description: "Thử thay đổi từ khóa tìm kiếm",
          }}
        />
      )}
    </div>
  );
}
