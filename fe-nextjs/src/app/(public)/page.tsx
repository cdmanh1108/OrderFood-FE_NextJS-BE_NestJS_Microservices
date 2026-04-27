import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone, Mail, ArrowRight, Star } from "lucide-react";
import { PublicHeader } from "../components/layout/PublicHeader";
import { Button } from "../components/shared/Button";
import { categoryApi, menuItemApi } from "@/services/api";

export default async function HomePage() {
  const [featuredItems, categories] = await Promise.all([
    menuItemApi.featured().catch(() => []),
    categoryApi
      .menuCategories({
        isActive: true,
        page: 1,
        limit: 4,
        sortBy: "sortOrder",
        sortOrder: "asc",
      })
      .catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-brand-white">
      <PublicHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-beige/80 via-white to-brand-amber/20">
        <div className="absolute left-10 top-20 h-40 w-40 rounded-full bg-brand-yellow/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-brand-amber/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-amber/20 bg-white px-4 py-2 shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-green" />
              <span className="text-sm font-semibold text-brand-brown">
                Đang phục vụ hôm nay
              </span>
            </div>

            <div>
              <h1 className="text-4xl font-bold leading-tight text-brand-brown sm:text-5xl lg:text-6xl">
                Bún Đậu Làng Mơ
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-gray-600 sm:text-lg">
                Hương vị truyền thống Hà Nội, nơi mỗi bữa ăn là câu chuyện văn
                hóa ẩm thực đậm đà và bản sắc Bắc Bộ.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/menu">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight size={20} />}
                >
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
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[var(--shadow-wood)]">
              <Image
                src="/images/home-hero.jpg"
                alt="Bún Đậu Làng Mơ"
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="absolute -bottom-5 -left-5 rounded-3xl bg-white px-5 py-4 shadow-lg">
              <div className="flex items-center gap-2 text-brand-amber">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold">4.9/5</span>
              </div>
              <p className="mt-1 text-xs text-brand-gray-600">
                Khách hàng yêu thích
              </p>
            </div>

            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-3xl bg-brand-brown shadow-lg" />
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-amber">
              Best Seller
            </p>
            <h2 className="mt-3 text-3xl font-bold text-brand-brown lg:text-4xl">
              Món Ăn Đặc Trưng
            </h2>
            <p className="mt-3 text-brand-gray-600">
              Những món ăn được yêu thích nhất tại Bún Đậu Làng Mơ
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {featuredItems.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="group overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-beige">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-brand-gray-600">
                      Chưa có hình ảnh
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-brand-brown transition group-hover:text-brand-coffee">
                    {item.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-brand-gray-600">
                    {item.description || "Món ăn truyền thống thơm ngon."}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xl font-bold text-brand-amber">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.price)}
                    </span>

                    <Link href="/menu">
                      <Button size="sm" variant="outline">
                        Xem món
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {featuredItems.length === 0 && (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-brand-gray-600 md:col-span-2 lg:col-span-3">
                Chưa có món ăn đặc trưng
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link href="/menu">
              <Button variant="outline" size="lg">
                Xem Tất Cả Món Ăn
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-brand-beige/40 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-amber">
              Menu Categories
            </p>
            <h2 className="mt-3 text-3xl font-bold text-brand-brown lg:text-4xl">
              Danh Mục Món Ăn
            </h2>
            <p className="mt-3 text-brand-gray-600">
              Khám phá các danh mục món ăn đa dạng
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/menu?category=${category.slug}`}
                className="group rounded-[2rem] border border-white bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-amber/30 hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-beige text-4xl transition group-hover:scale-105">
                  🍲
                </div>

                <h3 className="font-bold text-brand-brown transition group-hover:text-brand-amber">
                  {category.name}
                </h3>
              </Link>
            ))}

            {categories.length === 0 && (
              <div className="col-span-2 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-brand-gray-600 lg:col-span-4">
                Chưa có danh mục món ăn
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-amber">
              Contact
            </p>
            <h2 className="mt-3 text-3xl font-bold text-brand-brown lg:text-4xl">
              Liên Hệ & Địa Chỉ
            </h2>
            <p className="mt-3 text-brand-gray-600">
              Ghé thăm chúng tôi và thưởng thức hương vị truyền thống
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MapPin,
                title: "Địa Chỉ",
                text: "123 Phố Huế, Hai Bà Trưng,\nHà Nội",
              },
              {
                icon: Phone,
                title: "Điện Thoại",
                text: "0367 485 383",
              },
              {
                icon: Clock,
                title: "Giờ Mở Cửa",
                text: "8:00 - 22:00\nHàng ngày",
              },
              {
                icon: Mail,
                title: "Email",
                text: "cdmanh1108@gmail.com",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[2rem] border border-gray-100 bg-gray-50 p-6 text-center transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-yellow/20">
                    <Icon className="text-brand-brown" size={24} />
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-brand-brown">
                    {item.title}
                  </h3>

                  <p className="whitespace-pre-line text-sm leading-relaxed text-brand-gray-600">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="bg-brand-brown py-8 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-white/85">
            © 2026 Bún Đậu Làng Mơ. Hương vị truyền thống Hà Nội.
          </p>
        </div>
      </footer>
    </div>
  );
}