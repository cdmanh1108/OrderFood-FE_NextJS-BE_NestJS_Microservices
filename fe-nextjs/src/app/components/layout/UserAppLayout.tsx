"use client";

import {
  LayoutDashboard,
  ShoppingBag,
  History,
  User,
  MessageSquare,
  Headset,
} from "lucide-react";
import { PrivateShellLayout, type SidebarItem } from "./PrivateShellLayout";

const userSidebarItems: SidebarItem[] = [
  {
    label: "Tổng quan",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Đặt món online",
    path: "/order-food",
    icon: ShoppingBag,
  },
  {
    label: "Lịch sử đơn hàng",
    path: "/order-history",
    icon: History,
  },
  {
    label: "Thông tin cá nhân",
    path: "/profile",
    icon: User,
  },
  {
    label: "Đánh giá",
    icon: MessageSquare,
    path: "/order-review",
  },
  {
    label: "Hỗ trợ",
    path: "/support",
    icon: Headset,
  },
];

export function UserAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateShellLayout
      items={userSidebarItems}
      logoTitle="Bún Đậu"
      logoSubtitle="User Portal"
    >
      {children}
    </PrivateShellLayout>
  );
}
