"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, type LucideIcon, UtensilsCrossed, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/auth-context";
import { DashboardHeader } from "./DashboardHeader";

export type SidebarItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

interface PrivateShellLayoutProps {
  children: React.ReactNode;
  items: SidebarItem[];
  logoTitle?: string;
  logoSubtitle?: string;
}

function isPathActive(pathname: string, targetPath: string): boolean {
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}

export function PrivateShellLayout({
  children,
  items,
  logoTitle = "Bún Đậu",
  logoSubtitle = "Làng Mơ",
}: PrivateShellLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setIsMobileSidebarOpen(false);
    router.replace("/login");
  };

  const renderNavigation = (isMobile: boolean) => (
    <nav className="flex-1 px-3 py-4 overflow-y-auto">
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isPathActive(pathname, item.path);

          return (
            <li key={item.path}>
              <Link
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "text-sm font-medium",
                  isActive
                    ? "bg-brand-yellow/10 text-brand-brown shadow-sm"
                    : "text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-brown",
                )}
                onClick={() => {
                  if (isMobile) {
                    setIsMobileSidebarOpen(false);
                  }
                }}
              >
                <span
                  className={cn(
                    isActive ? "text-brand-brown" : "text-brand-gray-400",
                  )}
                >
                  <Icon size={20} />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-brand-gray-50">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-brand-gray-200 h-screen sticky top-0">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-brand-gray-200">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-brand-yellow to-brand-amber shadow-sm">
            <UtensilsCrossed className="text-brand-brown" size={20} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-brand-brown">
              {logoTitle}
            </h1>
            <p className="text-xs text-brand-gray-500">{logoSubtitle}</p>
          </div>
        </div>

        {renderNavigation(false)}

        <div className="px-3 py-4 border-t border-brand-gray-200">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-danger transition-all duration-200"
          >
            <LogOut size={20} className="text-brand-gray-400" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {isMobileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col lg:hidden shadow-xl">
            <div className="flex items-center justify-between px-6 py-6 border-b border-brand-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-brand-yellow to-brand-amber shadow-sm">
                  <UtensilsCrossed className="text-brand-brown" size={20} />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-brand-brown">
                    {logoTitle}
                  </h1>
                  <p className="text-xs text-brand-gray-500">{logoSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-lg text-brand-gray-400 hover:text-brand-gray-600 hover:bg-brand-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {renderNavigation(true)}

            <div className="px-3 py-4 border-t border-brand-gray-200">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-danger transition-all duration-200"
              >
                <LogOut size={20} className="text-brand-gray-400" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
