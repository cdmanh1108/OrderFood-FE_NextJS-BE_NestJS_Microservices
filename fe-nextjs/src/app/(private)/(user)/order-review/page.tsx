"use client";

import { Image as ImageIcon, Sparkles, Star } from "lucide-react";

export default function CustomerReviewsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-beige/50 via-white to-brand-amber/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-brand-amber/20 bg-white shadow-sm">
          <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-8 text-white sm:px-8">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-16 h-20 w-20 rounded-full bg-white/10 blur-xl" />

            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                Đánh giá
              </p>

              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                Đánh giá của tôi
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                Xem, quản lý và gửi đánh giá cho các đơn hàng đã hoàn thành.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-3xl border border-dashed border-brand-amber/30 bg-brand-beige/40 px-6 py-12 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white shadow-sm">
                <Star className="h-10 w-10 text-brand-amber" />
              </div>

              <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-brown shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-brand-amber" />
                Coming soon
              </p>

              <h2 className="mt-4 text-2xl font-bold text-brand-brown">
                Chức năng đang được phát triển
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-gray-600">
                Tính năng đánh giá đơn hàng sẽ sớm được cập nhật. Sau khi hoàn
                thiện, bạn có thể đánh giá món ăn, gửi nhận xét và đính kèm hình
                ảnh trải nghiệm.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <Star className="mx-auto mb-2 h-6 w-6 text-brand-amber" />
                  <p className="text-sm font-semibold text-brand-brown">
                    Chấm sao
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <ImageIcon className="mx-auto mb-2 h-6 w-6 text-brand-amber" />
                  <p className="text-sm font-semibold text-brand-brown">
                    Thêm hình ảnh
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <Sparkles className="mx-auto mb-2 h-6 w-6 text-brand-amber" />
                  <p className="text-sm font-semibold text-brand-brown">
                    Quản lý đánh giá
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}