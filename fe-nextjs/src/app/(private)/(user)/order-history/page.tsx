"use client";

import { useState } from "react";
import { Package, Clock, CheckCircle, XCircle, Truck, Eye } from "lucide-react";

type OrderStatus = "all" | "delivering" | "completed" | "cancelled";

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle,
  },
  preparing: {
    label: "Đang chuẩn bị",
    color: "bg-purple-100 text-purple-800",
    icon: Package,
  },
  delivering: {
    label: "Đang giao",
    color: "bg-orange-100 text-orange-800",
    icon: Truck,
  },
  completed: {
    label: "Hoàn thành",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

const mockOrders = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    createdAt: "2024-04-20T10:30:00",
    completedAt: "2024-04-20T11:15:00",
    total: 145000,
    status: "completed" as const,
    orderType: "delivery" as const,
    deliveryAddress: "123 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
    items: [
      { id: "1", name: "Bún đậu mắm tôm", quantity: 2, price: 65000 },
      { id: "2", name: "Chả cốm", quantity: 1, price: 45000 },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    createdAt: "2024-04-22T14:15:00",
    total: 95000,
    status: "delivering" as const,
    orderType: "delivery" as const,
    deliveryAddress: "123 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
    items: [{ id: "3", name: "Nem chua rán", quantity: 2, price: 50000 }],
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    createdAt: "2024-04-18T09:00:00",
    completedAt: "2024-04-18T09:45:00",
    total: 170000,
    status: "completed" as const,
    orderType: "delivery" as const,
    deliveryAddress: "456 Giải Phóng, Hoàng Mai, Hà Nội",
    items: [{ id: "4", name: "Bún đậu đặc biệt", quantity: 2, price: 85000 }],
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    createdAt: "2024-04-15T18:30:00",
    total: 120000,
    status: "cancelled" as const,
    orderType: "delivery" as const,
    deliveryAddress: "123 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
    items: [
      { id: "5", name: "Bún đậu mắm tôm", quantity: 1, price: 65000 },
      { id: "6", name: "Nem chua rán", quantity: 1, price: 50000 },
    ],
  },
];

const tabs: { id: OrderStatus; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "delivering", label: "Đang giao" },
  { id: "completed", label: "Đã hoàn thành" },
  { id: "cancelled", label: "Đã hủy" },
];

export default function CustomerOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filteredOrders = mockOrders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-brown">
          Lịch sử đơn hàng
        </h1>
        <p className="text-gray-600 mt-1">
          Theo dõi và quản lý đơn hàng của bạn
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg whitespace-nowrap font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-brand-amber text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có đơn hàng
          </h3>
          <p className="text-gray-600">
            Bạn chưa có đơn hàng nào trong danh mục này
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.status].icon;
            const isExpanded = selectedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-brand-brown">
                          {order.orderNumber}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                            statusConfig[order.status].color
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig[order.status].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Đặt lúc:{" "}
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {order.completedAt && (
                        <p className="text-sm text-gray-600">
                          Hoàn thành:{" "}
                          {new Date(order.completedAt).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-coffee">
                        {order.total.toLocaleString("vi-VN")}đ
                      </p>
                      <button
                        onClick={() =>
                          setSelectedOrder(isExpanded ? null : order.id)
                        }
                        className="text-sm text-brand-amber hover:text-brand-yellow font-medium mt-2 inline-flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        {isExpanded ? "Thu gọn" : "Chi tiết"}
                      </button>
                    </div>
                  </div>

                  {!isExpanded && (
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">
                        {order.items.length} món •{" "}
                        {order.orderType === "delivery"
                          ? "Giao hàng"
                          : "Tại quán"}
                      </p>
                      <p className="text-gray-600 line-clamp-1">
                        {order.items
                          .map((item) => `${item.quantity}x ${item.name}`)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="space-y-4">
                      {/* Items */}
                      <div>
                        <h4 className="font-semibold text-brand-brown mb-3">
                          Chi tiết món ăn
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between py-2 px-4 bg-white rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Số lượng: {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold text-brand-coffee">
                                {item.price.toLocaleString("vi-VN")}đ
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      {order.deliveryAddress && (
                        <div>
                          <h4 className="font-semibold text-brand-brown mb-2">
                            Địa chỉ giao hàng
                          </h4>
                          <p className="text-gray-700">
                            {order.deliveryAddress}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      {order.status === "completed" && (
                        <div className="pt-2">
                          <button className="w-full bg-brand-amber text-white py-3 rounded-xl font-medium hover:bg-brand-yellow transition-colors">
                            Đánh giá đơn hàng
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
