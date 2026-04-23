"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/shared/Button';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige via-brand-white to-brand-yellow/10 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-yellow rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-amber rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-brand-brown mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-brand-brown mb-2">
            Không Tìm Thấy Trang
          </h2>
          <p className="text-brand-gray-600">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft size={20} />}
          >
            Quay Lại
          </Button>
          <Link href="/">
            <Button variant="primary" size="lg" leftIcon={<Home size={20} />}>
              Về Trang Chủ
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          <div className="text-6xl mb-4">🍜</div>
          <p className="text-sm text-brand-gray-500">
            Có thể bạn đang đói? Hãy xem thực đơn của chúng tôi!
          </p>
          <Link href="/menu" className="inline-block mt-3">
            <Button variant="secondary" size="sm">
              Xem Thực Đơn
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
