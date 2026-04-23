"use client";

import React from "react";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "../../../contexts/auth-context";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-brand-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        {/* Left: Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-brand-gray-600 hover:bg-brand-gray-100 transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Center: Empty on mobile, can add breadcrumbs on desktop */}
        <div className="hidden lg:block" />

        {/* Right: User info and notifications */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg text-brand-gray-600 hover:bg-brand-gray-100 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-danger rounded-full" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-brand-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-brand-gray-900">
                {user?.name}
              </p>
              <p className="text-xs text-brand-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-yellow to-brand-amber flex items-center justify-center text-brand-brown font-semibold text-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
