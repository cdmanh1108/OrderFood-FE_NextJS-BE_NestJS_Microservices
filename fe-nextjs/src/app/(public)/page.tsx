import React from 'react';
import Link from 'next/link';
import { MapPin, Clock, Phone, Mail, ArrowRight } from 'lucide-react';
import { PublicHeader } from '../components/layout/PublicHeader';
import { Button } from '../components/shared/Button';
import { mockMenuItems, mockCategories } from '../../services/mock-data';

export default function HomePage() {
  const featuredItems = mockMenuItems.filter((item) => item.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen bg-brand-white">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-beige via-brand-white to-brand-yellow/10 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-brand-yellow rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-brand-amber rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
                <span className="text-sm font-medium text-brand-brown">Đang phục vụ</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-brand-brown leading-tight">
                Bún Đậu Làng Mơ
              </h1>
              
              <p className="text-lg lg:text-xl text-brand-gray-600 leading-relaxed">
                Hương vị truyền thống Hà Nội, nơi mỗi bữa ăn là câu chuyện văn hóa
                ẩm thực đậm đà bản sắc Bắc Bộ.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/menu">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
                    Xem Thực Đơn
                  </Button>
                </Link>
                <a href="#contact">
                  <Button variant="outline" size="lg">
                    Liên Hệ Đặt Bàn
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-brand-yellow to-brand-amber rounded-3xl shadow-[var(--shadow-wood)] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <p className="text-6xl lg:text-7xl font-bold mb-4">🍜</p>
                    <p className="text-xl font-semibold">Món Ăn Ngon</p>
                    <p className="text-lg opacity-90">Đậm Đà Hà Nội</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-brand-green rounded-2xl shadow-lg rotate-12" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-brown rounded-2xl shadow-lg -rotate-12" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-brown mb-4">
              Món Ăn Đặc Trưng
            </h2>
            <p className="text-lg text-brand-gray-600">
              Những món ăn được yêu thích nhất tại Bún Đậu Làng Mơ
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-yellow/20 to-brand-amber/20 flex items-center justify-center">
                  <span className="text-6xl">🍽️</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-brand-brown mb-2 group-hover:text-brand-coffee transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-brand-gray-600 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-brand-brown">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.price)}
                    </span>
                    <Link href="/menu">
                      <Button variant="secondary" size="sm">
                        Đặt Món
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/menu">
              <Button variant="outline" size="lg">
                Xem Tất Cả Món Ăn
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 lg:py-24 bg-brand-beige/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-brown mb-4">
              Danh Mục Món Ăn
            </h2>
            <p className="text-lg text-brand-gray-600">
              Khám phá các danh mục món ăn đa dạng
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {mockCategories.map((category) => (
              <Link
                key={category.id}
                href="/menu"
                className="group bg-white rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 text-center"
              >
                <div className="text-4xl lg:text-5xl mb-4">🍲</div>
                <h3 className="text-lg font-semibold text-brand-brown group-hover:text-brand-coffee transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-brown mb-4">
              Liên Hệ & Địa Chỉ
            </h2>
            <p className="text-lg text-brand-gray-600">
              Ghé thăm chúng tôi và thưởng thức hương vị truyền thống
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="bg-brand-gray-50 rounded-[var(--radius-card)] p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-yellow/20 mb-4">
                <MapPin className="text-brand-brown" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-brand-brown mb-2">Địa Chỉ</h3>
              <p className="text-sm text-brand-gray-600">
                123 Phố Huế, Hai Bà Trưng,<br />Hà Nội
              </p>
            </div>

            <div className="bg-brand-gray-50 rounded-[var(--radius-card)] p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-yellow/20 mb-4">
                <Phone className="text-brand-brown" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-brand-brown mb-2">Điện Thoại</h3>
              <p className="text-sm text-brand-gray-600">
                024.3456.7890
              </p>
            </div>

            <div className="bg-brand-gray-50 rounded-[var(--radius-card)] p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-yellow/20 mb-4">
                <Clock className="text-brand-brown" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-brand-brown mb-2">Giờ Mở Cửa</h3>
              <p className="text-sm text-brand-gray-600">
                8:00 - 22:00<br />Hàng ngày
              </p>
            </div>

            <div className="bg-brand-gray-50 rounded-[var(--radius-card)] p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-yellow/20 mb-4">
                <Mail className="text-brand-brown" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-brand-brown mb-2">Email</h3>
              <p className="text-sm text-brand-gray-600">
                bundaulangmo@gmail.com
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-brown text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm opacity-80">
              © 2026 Bún Đậu Làng Mơ. Hương vị truyền thống Hà Nội.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
