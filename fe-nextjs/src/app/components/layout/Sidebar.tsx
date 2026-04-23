"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderTree,
  UtensilsCrossed,
  Table,
  ShoppingBag,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useAuth } from '../../../contexts/auth-context';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Tổng Quan',
    path: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: 'Nhân Viên',
    path: '/dashboard/staff',
    icon: <Users size={20} />,
  },
  {
    label: 'Danh Mục',
    path: '/dashboard/category',
    icon: <FolderTree size={20} />,
  },
  {
    label: 'Món Ăn',
    path: '/dashboard/menu-item',
    icon: <UtensilsCrossed size={20} />,
  },
  {
    label: 'Bàn Ăn',
    path: '/dashboard/tables',
    icon: <Table size={20} />,
  },
  {
    label: 'Đơn Hàng',
    path: '/dashboard/orders',
    icon: <ShoppingBag size={20} />,
  },
  {
    label: 'Cài Đặt',
    path: '/dashboard/settings',
    icon: <Settings size={20} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-brand-gray-200 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-brand-gray-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-brand-yellow to-brand-amber shadow-sm">
          <UtensilsCrossed className="text-brand-brown" size={20} />
        </div>
        <div>
          <h1 className="text-base font-semibold text-brand-brown">Bún Đậu</h1>
          <p className="text-xs text-brand-gray-500">Làng Mơ</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'text-sm font-medium',
                    isActive
                      ? 'bg-brand-yellow/10 text-brand-brown shadow-sm'
                      : 'text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-brown'
                  )}
                >
                  <span className={isActive ? 'text-brand-brown' : 'text-brand-gray-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-brand-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-danger transition-all duration-200"
        >
          <LogOut size={20} className="text-brand-gray-400" />
          <span>Đăng Xuất</span>
        </button>
      </div>
    </aside>
  );
}
