"use client";

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Button } from "@/app/components/shared/Button";
import { Input } from "@/app/components/shared/Input";
import { Alert } from "@/app/components/shared/Alert";
import { mockSettings } from "@/services/mock-data";
import type { RestaurantSettings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>(mockSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    setSaveSuccess(true);

    // Hide success message after 3 seconds
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-2">
            Cài Đặt
          </h1>
          <p className="text-brand-gray-600">Quản lý thông tin và cấu hình nhà hàng</p>
        </div>

        {saveSuccess && (
          <Alert
            variant="success"
            message="Đã lưu cài đặt thành công!"
            onClose={() => setSaveSuccess(false)}
          />
        )}

        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-brand-brown mb-4">
              Thông Tin Nhà Hàng
            </h2>
            <div className="space-y-4">
              <Input
                label="Tên Nhà Hàng"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
              <Input
                label="Địa Chỉ"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Số Điện Thoại"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-brand-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-brand-brown mb-4">
              Giờ Hoạt Động
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Giờ Mở Cửa"
                type="time"
                value={settings.openTime}
                onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
              />
              <Input
                label="Giờ Đóng Cửa"
                type="time"
                value={settings.closeTime}
                onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t border-brand-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-brand-brown mb-4">
              Cấu Hình Thanh Toán
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Thuế VAT (%)"
                type="number"
                min="0"
                max="100"
                value={settings.taxRate.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })
                }
              />
              <Input
                label="Đơn Vị Tiền Tệ"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                disabled
              />
            </div>
          </div>

          <div className="border-t border-brand-gray-200 pt-6 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save size={20} />}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu Cài Đặt'}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
