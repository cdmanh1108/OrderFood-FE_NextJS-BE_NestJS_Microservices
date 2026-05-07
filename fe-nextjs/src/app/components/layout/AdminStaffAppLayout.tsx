"use client";

import {
  LayoutDashboard,
  Users,
  FolderTree,
  UtensilsCrossed,
  Table,
  ShoppingBag,
  Settings,
  CalendarCheck,
  Bike,
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
    path: "/admin/staff",
    icon: Users,
  },
  {
    label: "Giao hàng",
    path: "/admin/shippers",
    icon: Bike,
  },
  {
    label: "Danh mục",
    path: "/admin/category",
    icon: FolderTree,
  },
  {
    label: "Món ăn",
    path: "/admin/menu-item",
    icon: UtensilsCrossed,
  },
  {
    label: "Bàn ăn",
    path: "/admin/tables",
    icon: Table,
  },
  // {
  //   label: "Đặt bàn",
  //   path: "/admin/reservations",
  //   icon: CalendarCheck,
  // },
  {
    label: "Đơn hàng",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Cài đặt",
    path: "/admin/settings",
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
      logoSubtitle="Admin"
    >
      {children}
    </PrivateShellLayout>
  );
}
