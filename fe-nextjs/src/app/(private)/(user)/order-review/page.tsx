"use client";

import { useState } from "react";
import { Star, Image as ImageIcon, X } from "lucide-react";

const mockReviews = [
  {
    id: "1",
    orderId: "ORD-2024-001",
    orderNumber: "ORD-2024-001",
    rating: 5,
    comment:
      "Món ăn rất ngon, đậu chiên giòn rụm, mắm tôm đậm đà. Giao hàng nhanh, đóng gói cẩn thận.",
    images: [
      "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400",
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
    ],
    createdAt: "2024-04-20T12:00:00",
  },
  {
    id: "2",
    orderId: "ORD-2024-003",
    orderNumber: "ORD-2024-003",
    rating: 4,
    comment:
      "Món ăn ngon, tuy nhiên hơi mặn một chút. Nhưng nhìn chung vẫn rất hài lòng.",
    createdAt: "2024-04-18T10:30:00",
  },
];

const mockPendingReviews = [
  {
    id: "ORD-2024-005",
    orderNumber: "ORD-2024-005",
    completedAt: "2024-04-23T15:00:00",
    total: 150000,
    items: [
      { name: "Bún đậu đặc biệt", quantity: 1 },
      { name: "Chả cốm", quantity: 2 },
    ],
  },
];

export default function CustomerReviewsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending");
  const [selectedOrderToReview, setSelectedOrderToReview] = useState<
    string | null
  >(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmitReview = () => {
    // TODO: Submit review API
    console.log({ orderId: selectedOrderToReview, rating, comment });
    setSelectedOrderToReview(null);
    setRating(0);
    setComment("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-brown">
          Đánh giá của tôi
        </h1>
        <p className="text-gray-600 mt-1">
          Xem và quản lý các đánh giá của bạn
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-brand-amber text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Chờ đánh giá ({mockPendingReviews.length})
          </button>
          <button
            onClick={() => setActiveTab("reviewed")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "reviewed"
                ? "bg-brand-amber text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Đã đánh giá ({mockReviews.length})
          </button>
        </div>
      </div>

      {/* Pending Reviews */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {mockPendingReviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có đơn hàng chờ đánh giá
              </h3>
              <p className="text-gray-600">
                Các đơn hàng đã hoàn thành sẽ hiển thị ở đây
              </p>
            </div>
          ) : (
            mockPendingReviews.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-brand-brown">
                      {order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Hoàn thành:{" "}
                      {new Date(order.completedAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-brand-coffee">
                    {order.total.toLocaleString("vi-VN")}đ
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700">
                    {order.items
                      .map((item) => `${item.quantity}x ${item.name}`)
                      .join(", ")}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrderToReview(order.id)}
                  className="w-full bg-brand-amber text-white py-3 rounded-xl font-medium hover:bg-brand-yellow transition-colors"
                >
                  Đánh giá ngay
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reviewed */}
      {activeTab === "reviewed" && (
        <div className="space-y-4">
          {mockReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-brand-brown">
                    {review.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating
                          ? "fill-brand-yellow text-brand-yellow"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-4">{review.comment}</p>
              )}

              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review ${idx + 1}`}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedOrderToReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-brown">
                Đánh giá đơn hàng
              </h2>
              <button
                onClick={() => setSelectedOrderToReview(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Đánh giá của bạn
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= rating
                            ? "fill-brand-yellow text-brand-yellow"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét của bạn (tùy chọn)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thêm hình ảnh (tùy chọn)
                </label>
                <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-brand-amber transition-colors">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Chọn hoặc kéo thả hình ảnh
                  </p>
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitReview}
                disabled={rating === 0}
                className="w-full bg-brand-amber text-white py-3 rounded-xl font-medium hover:bg-brand-yellow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
