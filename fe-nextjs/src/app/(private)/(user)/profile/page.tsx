"use client";

import { useState } from "react";
import { User, MapPin, Plus, Trash2, Check } from "lucide-react";

const mockCustomer = {
  id: "1",
  name: "Nguyễn Văn A",
  phone: "0912345678",
  email: "nguyenvana@gmail.com",
  avatar:
    "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=FBC02D&color=fff",
};

const mockAddresses = [
  {
    id: "1",
    label: "Nhà",
    fullAddress: "123 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
    recipientName: "Nguyễn Văn A",
    recipientPhone: "0912345678",
    isDefault: true,
    note: "Gọi trước 5 phút",
  },
  {
    id: "2",
    label: "Công ty",
    fullAddress: "456 Giải Phóng, Hoàng Mai, Hà Nội",
    recipientName: "Nguyễn Văn A",
    recipientPhone: "0912345678",
    isDefault: false,
  },
];

export default function CustomerProfilePage() {
  const [customer, setCustomer] = useState(mockCustomer);
  const [addresses, setAddresses] = useState(mockAddresses);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);

  const handleSetDefaultAddress = (addressId: string) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      })),
    );
  };

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      setAddresses(addresses.filter((addr) => addr.id !== addressId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-brown">
          Thông tin cá nhân
        </h1>
        <p className="text-gray-600 mt-1">
          Quản lý thông tin tài khoản và địa chỉ giao hàng
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-bold text-brand-brown">
            Thông tin cơ bản
          </h2>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-brand-amber hover:text-brand-yellow font-medium text-sm"
          >
            {isEditingProfile ? "Hủy" : "Chỉnh sửa"}
          </button>
        </div>

        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none"
                />
              ) : (
                <p className="text-gray-900">{customer.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              {isEditingProfile ? (
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none"
                />
              ) : (
                <p className="text-gray-900">{customer.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditingProfile ? (
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none"
                />
              ) : (
                <p className="text-gray-900">{customer.email}</p>
              )}
            </div>

            {isEditingProfile && (
              <button className="bg-brand-amber text-white px-6 py-2 rounded-lg font-medium hover:bg-brand-yellow transition-colors">
                Lưu thay đổi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-brand-brown">
            Địa chỉ giao hàng
          </h2>
          <button
            onClick={() => setShowAddAddressForm(!showAddAddressForm)}
            className="inline-flex items-center gap-2 text-brand-amber hover:text-brand-yellow font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm địa chỉ
          </button>
        </div>

        {/* Add Address Form */}
        {showAddAddressForm && (
          <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-brand-brown mb-4">
              Thêm địa chỉ mới
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhãn địa chỉ
                </label>
                <input
                  type="text"
                  placeholder="Nhà, Công ty,..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ đầy đủ
                </label>
                <textarea
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên người nhận
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú (tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="VD: Gọi trước 5 phút"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-brand-amber text-white py-2 rounded-lg font-medium hover:bg-brand-yellow transition-colors">
                  Lưu địa chỉ
                </button>
                <button
                  onClick={() => setShowAddAddressForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-5 rounded-xl border-2 transition-colors ${
                address.isDefault
                  ? "border-brand-amber bg-brand-beige/30"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-beige flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-brand-amber" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-brown">
                      {address.label}
                    </h3>
                    {address.isDefault && (
                      <span className="text-xs text-brand-amber font-medium inline-flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Mặc định
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-900">{address.fullAddress}</p>
                <p className="text-gray-600">
                  {address.recipientName} • {address.recipientPhone}
                </p>
                {address.note && (
                  <p className="text-gray-600 italic">
                    Ghi chú: {address.note}
                  </p>
                )}
              </div>

              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefaultAddress(address.id)}
                  className="mt-3 text-brand-amber hover:text-brand-yellow font-medium text-sm"
                >
                  Đặt làm mặc định
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
