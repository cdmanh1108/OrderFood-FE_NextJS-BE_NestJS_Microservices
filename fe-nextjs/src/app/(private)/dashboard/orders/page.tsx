"use client";

import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Input } from '../../../components/shared/Input';
import { Badge } from '../../../components/shared/Badge';
import { DataTable, Column } from '../../../components/shared/DataTable';
import { Button } from '../../../components/shared/Button';
import { mockOrders } from '../../../../services/mock-data';
import { formatCurrency, formatDateTime } from '../../../../utils/cn';
import type { Order } from '../../../../types';
import { OrderStatus, PaymentStatus } from '../../../../types';

export default function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOrderStatusBadge = (status: OrderStatus) => {
    const config = {
      [OrderStatus.PENDING]: { variant: 'warning' as const, label: 'Chờ xác nhận' },
      [OrderStatus.CONFIRMED]: { variant: 'info' as const, label: 'Đã xác nhận' },
      [OrderStatus.PREPARING]: { variant: 'warning' as const, label: 'Đang chuẩn bị' },
      [OrderStatus.READY]: { variant: 'success' as const, label: 'Sẵn sàng' },
      [OrderStatus.COMPLETED]: { variant: 'success' as const, label: 'Hoàn thành' },
      [OrderStatus.CANCELLED]: { variant: 'danger' as const, label: 'Đã hủy' },
    };
    return config[status];
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const config = {
      [PaymentStatus.UNPAID]: { variant: 'warning' as const, label: 'Chưa thanh toán' },
      [PaymentStatus.PAID]: { variant: 'success' as const, label: 'Đã thanh toán' },
      [PaymentStatus.REFUNDED]: { variant: 'danger' as const, label: 'Đã hoàn tiền' },
    };
    return config[status];
  };

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      label: 'Mã Đơn',
      render: (order) => (
        <span className="font-semibold text-brand-brown">{order.orderNumber}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Khách Hàng',
      render: (order) => (
        <div>
          <p className="font-medium text-brand-brown">{order.customerName || 'Khách lẻ'}</p>
          {order.table && (
            <p className="text-xs text-brand-gray-500">Bàn: {order.table.number}</p>
          )}
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Số Món',
      render: (order) => <span>{order.items.length} món</span>,
    },
    {
      key: 'total',
      label: 'Tổng Tiền',
      render: (order) => (
        <span className="font-semibold text-brand-brown">{formatCurrency(order.total)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      render: (order) => {
        const badge = getOrderStatusBadge(order.status);
        return <Badge variant={badge.variant} size="sm">{badge.label}</Badge>;
      },
    },
    {
      key: 'paymentStatus',
      label: 'Thanh Toán',
      render: (order) => {
        const badge = getPaymentStatusBadge(order.paymentStatus);
        return <Badge variant={badge.variant} size="sm">{badge.label}</Badge>;
      },
    },
    {
      key: 'createdAt',
      label: 'Thời Gian',
      render: (order) => formatDateTime(order.createdAt),
    },
  ];

  return (
    <DashboardLayout>
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

        <DataTable
          columns={columns}
          data={filteredOrders}
          actions={(order) => (
            <Button variant="ghost" size="sm" leftIcon={<Eye size={16} />}>
              Xem
            </Button>
          )}
          emptyState={{
            title: 'Không tìm thấy đơn hàng',
            description: 'Thử thay đổi từ khóa tìm kiếm',
          }}
        />
      </div>
    </DashboardLayout>
  );
}
