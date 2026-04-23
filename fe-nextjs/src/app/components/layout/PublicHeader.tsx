"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { cn } from "../../../utils/cn";
import { Button } from "../shared/Button";

interface PublicHeaderProps {
  cartItemsCount?: number;
}

export function PublicHeader({ cartItemsCount = 0 }: PublicHeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-brand-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white shadow-sm overflow-hidden">
              <Image
                src="/images/logo.jpg"
                alt="Bún đậu làng mơ logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-semibold text-brand-brown">
                Bún Đậu Làng Mơ
              </h1>
              <p className="text-xs text-brand-gray-500 hidden sm:block">
                Hương vị truyền thống Hà Nội
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/")
                  ? "text-brand-brown"
                  : "text-brand-gray-600 hover:text-brand-brown",
              )}
            >
              Trang Chủ
            </Link>
            <Link
              href="/menu"
              className={cn(
                "text-sm font-medium transition-colors",
                isActive("/menu")
                  ? "text-brand-brown"
                  : "text-brand-gray-600 hover:text-brand-brown",
              )}
            >
              Thực Đơn
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="relative p-2 rounded-lg text-brand-gray-600 hover:bg-brand-gray-100 transition-colors md:hidden"
            >
              <ShoppingCart size={24} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-danger text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                Đăng Nhập
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="primary"
                size="sm"
                className="hidden sm:inline-flex"
              >
                Đăng Ký
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
