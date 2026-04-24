"use client";

import { useState } from "react";
import { Search, Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

// Mock data
const mockCategories = [
  { id: "all", name: "Tất cả" },
  { id: "1", name: "Bún đậu" },
  { id: "2", name: "Chả & Nem" },
  { id: "3", name: "Rau & Rau luộc" },
  { id: "4", name: "Nước uống" },
];

const mockMenuItems = [
  {
    id: "1",
    name: "Bún đậu mắm tôm",
    description: "Đậu chiên giòn, bún tươi, mắm tôm đặc trưng",
    price: 65000,
    image: "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400",
    categoryId: "1",
    isAvailable: true,
  },
  {
    id: "2",
    name: "Bún đậu đặc biệt",
    description: "Đầy đủ thịt, chả, nem, đậu chiên",
    price: 85000,
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
    categoryId: "1",
    isAvailable: true,
  },
  {
    id: "3",
    name: "Chả cốm",
    description: "Chả cốm Hà Nội truyền thống",
    price: 45000,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
    categoryId: "2",
    isAvailable: true,
  },
  {
    id: "4",
    name: "Nem chua rán",
    description: "Nem chua Thanh Hóa chiên giòn",
    price: 50000,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400",
    categoryId: "2",
    isAvailable: true,
  },
  {
    id: "5",
    name: "Rau luộc đĩa",
    description: "Rau sống tươi mát, rau luộc",
    price: 25000,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    categoryId: "3",
    isAvailable: true,
  },
  {
    id: "6",
    name: "Trà đá",
    description: "Trà đá tươi mát",
    price: 5000,
    image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
    categoryId: "4",
    isAvailable: true,
  },
];

export default function CustomerMenuPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addItem, getItemCount } = useCart();

  const filteredItems = mockMenuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuantityChange = (itemId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  };

  const handleAddToCart = (item: any) => {
    const quantity = quantities[item.id] || 1;
    addItem(item, quantity);
    setQuantities((prev) => ({ ...prev, [item.id]: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-brown">
            Đặt món online
          </h1>
          <p className="text-gray-600 mt-1">
            Chọn món yêu thích và đặt hàng ngay
          </p>
        </div>
        <button
          //   onClick={() => navigate("/customer/cart")}
          className="hidden lg:flex items-center gap-2 bg-brand-amber text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-yellow transition-colors relative"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Giỏ hàng</span>
          {getItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand-danger text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {getItemCount()}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm món ăn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {mockCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
              selectedCategory === category.id
                ? "bg-brand-amber text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:border-brand-amber"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-brand-brown text-lg mb-1">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-brand-coffee">
                  {item.price.toLocaleString("vi-VN")}đ
                </span>
                {!item.isAvailable && (
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                    Hết hàng
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(item.id, -1)}
                    disabled={!quantities[item.id]}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-medium min-w-[40px] text-center">
                    {quantities[item.id] || 0}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.isAvailable || !quantities[item.id]}
                  className="flex-1 bg-brand-amber text-white py-2 rounded-lg font-medium hover:bg-brand-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
