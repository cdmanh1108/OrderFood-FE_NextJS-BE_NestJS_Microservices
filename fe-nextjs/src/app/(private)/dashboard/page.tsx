import React from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Table } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/shared/Badge';
import { mockDashboardStats } from '../../../services/mock-data';
import { formatCurrency, formatDateTime } from '../../../utils/cn';
import { OrderStatus } from '../../../types';

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

export default function DashboardPage() {
  const stats = mockDashboardStats;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-2">
            Tổng Quan
          </h1>
          <p className="text-brand-gray-600">
            Xin chào! Đây là tổng quan hoạt động hôm nay.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-green/10">
                <DollarSign className="text-brand-green" size={24} />
              </div>
              <Badge variant="success" size="sm">
                <TrendingUp size={12} className="mr-1" />
                +12%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-brand-brown mb-1">
              {formatCurrency(stats.todayRevenue)}
            </h3>
            <p className="text-sm text-brand-gray-600">Doanh thu hôm nay</p>
          </div>

          <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-yellow/20">
                <ShoppingBag className="text-brand-brown" size={24} />
              </div>
              <Badge variant="info" size="sm">
                <TrendingUp size={12} className="mr-1" />
                +8%
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-brand-brown mb-1">
              {stats.todayOrders}
            </h3>
            <p className="text-sm text-brand-gray-600">Đơn hàng hôm nay</p>
          </div>

          <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-amber/20">
                <ShoppingBag className="text-brand-brown" size={24} />
              </div>
              <Badge variant="warning" size="sm">
                Đang xử lý
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-brand-brown mb-1">
              {stats.activeOrders}
            </h3>
            <p className="text-sm text-brand-gray-600">Đơn hàng đang xử lý</p>
          </div>

          <div className="bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-green/10">
                <Table className="text-brand-green" size={24} />
              </div>
              <Badge variant="success" size="sm">
                Trống
              </Badge>
            </div>
            <h3 className="text-2xl font-bold text-brand-brown mb-1">
              {stats.availableTables}
            </h3>
            <p className="text-sm text-brand-gray-600">Bàn còn trống</p>
          </div>
        </div>

        {/* Two Columns */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-gray-200">
              <h2 className="text-lg font-semibold text-brand-brown">
                Món Ăn Bán Chạy
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.topSellingItems.map((item, index) => (
                  <div key={item.menuItem.id} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-yellow/20 font-bold text-brand-brown">
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-brand-brown truncate">
                        {item.menuItem.name}
                      </h3>
                      <p className="text-sm text-brand-gray-600">
                        {item.totalQuantity} phần
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-brand-brown">
                        {formatCurrency(item.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-gray-200">
              <h2 className="text-lg font-semibold text-brand-brown">
                Đơn Hàng Gần Đây
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {stats.recentOrders.map((order) => {
                  const badgeConfig = getOrderStatusBadge(order.status);
                  return (
                    <div key={order.id} className="flex items-start gap-4 pb-4 border-b border-brand-gray-100 last:border-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-brand-brown">
                            {order.orderNumber}
                          </h3>
                          <Badge variant={badgeConfig.variant} size="sm">
                            {badgeConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-brand-gray-600">
                          {order.table?.number || 'Mang về'} • {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brand-brown">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-xs text-brand-gray-500">
                          {order.items.length} món
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
