"use client";

import {
  LayoutDashboard,
  Users,
  FolderTree,
  UtensilsCrossed,
  Table,
  ShoppingBag,
  Settings,
} from "lucide-react";
import { PrivateShellLayout, type SidebarItem } from "./PrivateShellLayout";

const adminSidebarItems: SidebarItem[] = [
  {
    label: "Tổng quan",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Nhân viên",
    path: "/admin/dashboard/staff",
    icon: Users,
  },
  {
    label: "Danh mục",
    path: "/admin/dashboard/category",
    icon: FolderTree,
  },
  {
    label: "Món ăn",
    path: "/admin/dashboard/menu-item",
    icon: UtensilsCrossed,
  },
  {
    label: "Bàn ăn",
    path: "/admin/dashboard/tables",
    icon: Table,
  },
  {
    label: "Đơn hàng",
    path: "/admin/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    label: "Cài đặt",
    path: "/admin/dashboard/settings",
    icon: Settings,
  },
];

export function AdminStaffAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivateShellLayout
      items={adminSidebarItems}
      logoTitle="Bún Đậu"
      logoSubtitle="Admin Portal"
    >
      {children}
    </PrivateShellLayout>
  );
}
