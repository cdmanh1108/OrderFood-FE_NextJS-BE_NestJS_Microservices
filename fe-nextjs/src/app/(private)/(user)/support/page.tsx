"use client";

import { Phone, Mail, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

export default function CustomerSupportPage() {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit support request
    console.log({ name, email, message });
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
    setMessage("");
    setName("");
    setEmail("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-brown">
          Hỗ trợ khách hàng
        </h1>
        <p className="text-gray-600 mt-1">
          Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-brand-brown mb-6">
              Thông tin liên hệ
            </h2>

            <div className="space-y-4">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-brown mb-1">
                    Hotline
                  </h3>
                  <a
                    href="tel:1900123456"
                    className="text-brand-amber hover:text-brand-yellow font-medium"
                  >
                    1900 123 456
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Phục vụ 24/7</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-brown mb-1">Email</h3>
                  <a
                    href="mailto:support@bundaulangmo.vn"
                    className="text-brand-amber hover:text-brand-yellow font-medium"
                  >
                    support@bundaulangmo.vn
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    Phản hồi trong 24h
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-brown mb-1">
                    Địa chỉ
                  </h3>
                  <p className="text-gray-700">
                    123 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-brown mb-1">
                    Giờ mở cửa
                  </h3>
                  <p className="text-gray-700">
                    Thứ 2 - Chủ nhật: 8:00 - 22:00
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Giao hàng đến 21:30
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="bg-gradient-to-br from-brand-yellow to-brand-amber rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-4">Câu hỏi thường gặp</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                <p className="font-medium">Làm sao để đặt hàng?</p>
              </button>
              <button className="w-full text-left p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                <p className="font-medium">Chính sách giao hàng như thế nào?</p>
              </button>
              <button className="w-full text-left p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors">
                <p className="font-medium">Làm sao để hủy/đổi đơn hàng?</p>
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-brand-beige flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-brand-amber" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-brown">
                Gửi tin nhắn
              </h2>
              <p className="text-sm text-gray-600">
                Chúng tôi sẽ phản hồi sớm nhất
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nhập họ và tên"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Nhập nội dung cần hỗ trợ..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/20 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-amber text-white py-3 rounded-xl font-medium hover:bg-brand-yellow transition-colors inline-flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Gửi tin nhắn
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
