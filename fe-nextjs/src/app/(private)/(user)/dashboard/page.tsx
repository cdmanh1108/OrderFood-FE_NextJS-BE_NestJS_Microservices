import { Package, Clock, Star, MapPin } from "lucide-react";

// Mock data - replace with real API
const mockCustomer = {
  name: "Nguyễn Văn A",
  phone: "0912345678",
  email: "nguyenvana@gmail.com",
  loyaltyPoints: 450,
  totalOrders: 24,
  totalSpent: 3250000,
};

const mockRecentOrders = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    createdAt: "2024-04-20T10:30:00",
    total: 145000,
    status: "completed" as const,
    items: [
      { name: "Bún đậu mắm tôm", quantity: 2 },
      { name: "Chả cốm", quantity: 1 },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    createdAt: "2024-04-22T14:15:00",
    total: 95000,
    status: "delivering" as const,
    items: [{ name: "Nem chua rán", quantity: 2 }],
  },
];

const statusConfig = {
  pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  preparing: { label: "Đang chuẩn bị", color: "bg-purple-100 text-purple-800" },
  delivering: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  completed: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800" },
};

export default function CustomerOverviewPage() {
  //   const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-brown">
          Xin chào, {mockCustomer.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Chào mừng bạn quay trở lại với Bún Đậu Làng Mơ
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand-beige flex items-center justify-center">
              <Package className="w-6 h-6 text-brand-amber" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-brand-brown">
                {mockCustomer.totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Điểm tích lũy</p>
              <p className="text-2xl font-bold text-brand-brown">
                {mockCustomer.loyaltyPoints}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 sm:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng chi tiêu</p>
              <p className="text-2xl font-bold text-brand-brown">
                {mockCustomer.totalSpent.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-brand-yellow to-brand-amber rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Đặt món ngay</h2>
        <p className="mb-6 opacity-90">
          Thưởng thức hương vị đặc trưng của Bún Đậu Làng Mơ ngay tại nhà!
        </p>
        <button
          //   onClick={() => navigate("/customer/menu")}
          className="bg-white text-brand-brown px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          Xem menu
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-brown">
            Đơn hàng gần đây
          </h2>
          <button
            // onClick={() => navigate("/customer/orders")}
            className="text-brand-amber hover:text-brand-yellow font-medium text-sm"
          >
            Xem tất cả
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {mockRecentOrders.map((order) => (
            <div
              key={order.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-brand-brown">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
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
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusConfig[order.status].color
                  }`}
                >
                  {statusConfig[order.status].label}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-sm text-gray-700">
                    {item.quantity}x {item.name}
                  </p>
                ))}
              </div>
              <p className="text-lg font-bold text-brand-coffee">
                {order.total.toLocaleString("vi-VN")}đ
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Support CTA */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-brand-brown mb-1">Cần hỗ trợ?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
            </p>
            <button
              //   onClick={() => navigate("/customer/support")}
              className="text-brand-amber hover:text-brand-yellow font-medium text-sm"
            >
              Liên hệ ngay →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
