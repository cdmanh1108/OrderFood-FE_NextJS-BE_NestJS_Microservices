"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/app/components/shared/Badge";
import {
  ArrowLeft,
  Bike,
  Car,
  MapPin,
  Navigation,
  Phone,
  Radar,
} from "lucide-react";
import { deliveryShipperApi } from "@/services/api";
import { ShipperDetailApiModel, ShipperLocationApiModel, VehicleType } from "@/types/api";

type ShipperWithLocation = ShipperDetailApiModel & {
  currentLocation?: ShipperLocationApiModel;
};

export default function ShipperTrackingMapPage() {
  const [shippers, setShippers] = useState<ShipperWithLocation[]>([]);
  const [selectedShipper, setSelectedShipper] = useState<ShipperWithLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const activeShippers = shippers.filter((shipper) => shipper.currentLocation);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await deliveryShipperApi.list({ isActive: true, limit: 100 });
      const activeShipperList = response.items;

      const shippersWithLocation = await Promise.all(
        activeShipperList.map(async (shipper) => {
          try {
            const location = await deliveryShipperApi.getLocation(shipper.id);
            return { ...shipper, currentLocation: location };
          } catch (err) {
            console.log(err);
            // Location not found or error, return without location
            return { ...shipper };
          }
        })
      );

      setShippers(shippersWithLocation);
    } catch (err) {
      console.error("Failed to load tracking data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      void loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const getVehicleLabel = (vehicleType: VehicleType) => {
    if (vehicleType === VehicleType.MOTORBIKE) return "Xe máy";
    if (vehicleType === VehicleType.CAR) return "Ô tô";
    return "Xe đạp";
  };

  const getVehicleIcon = (vehicleType: VehicleType) => {
    if (vehicleType === VehicleType.CAR) return <Car className="h-4 w-4" />;
    return <Bike className="h-4 w-4" />;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <section className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
        <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-7 text-white">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <Link
              href="/admin/shippers"
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Realtime Tracking
                </p>

                <h1 className="mt-2 text-2xl font-bold text-white lg:text-3xl">
                  Theo dõi Shipper Real-time
                </h1>

                <p className="mt-2 text-sm text-white/80">
                  {isLoading ? "Đang tải dữ liệu..." : `${activeShippers.length} shipper đang online và có vị trí cập nhật.`}
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                <Radar className="h-4 w-4" />
                {isLoading ? "Đang cập nhật..." : "Đang theo dõi"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-brand-gray-50 p-4">
            <p className="text-sm font-semibold text-brand-brown">
              Shipper online
            </p>
            <p className="mt-2 text-2xl font-bold text-brand-brown">
              {activeShippers.length}
            </p>
          </div>

          <div className="rounded-2xl bg-brand-gray-50 p-4">
            <p className="text-sm font-semibold text-brand-brown">
              Tổng Shipper (Active)
            </p>
            <p className="mt-2 text-2xl font-bold text-brand-amber">
              {shippers.length}
            </p>
          </div>

          <div className="rounded-2xl bg-brand-gray-50 p-4">
            <p className="text-sm font-semibold text-brand-brown">
              Đang chọn
            </p>
            <p className="mt-2 truncate text-2xl font-bold text-brand-brown">
              {selectedShipper?.fullName ?? "Chưa chọn"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-brand-gray-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-brand-brown">
                Bản đồ giao hàng
              </h2>
              <p className="text-sm text-brand-gray-600">
                Mô phỏng vị trí shipper đang hoạt động.
              </p>
            </div>

            <Badge variant="info">{activeShippers.length} online</Badge>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-beige via-white to-brand-yellow/20">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute left-1/4 top-0 h-full w-px bg-brand-brown/10" />
              <div className="absolute left-2/4 top-0 h-full w-px bg-brand-brown/10" />
              <div className="absolute left-3/4 top-0 h-full w-px bg-brand-brown/10" />
              <div className="absolute left-0 top-1/4 h-px w-full bg-brand-brown/10" />
              <div className="absolute left-0 top-2/4 h-px w-full bg-brand-brown/10" />
              <div className="absolute left-0 top-3/4 h-px w-full bg-brand-brown/10" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-[2rem] bg-white/80 px-6 py-5 text-center shadow-sm backdrop-blur">
                <MapPin className="mx-auto mb-3 h-12 w-12 text-brand-brown" />
                <p className="font-bold text-brand-brown">
                  Bản đồ theo dõi real-time
                </p>
                <p className="mt-1 max-w-sm text-sm text-brand-gray-600">
                  {activeShippers.length > 0
                    ? `Đang theo dõi ${activeShippers.length} shipper trên bản đồ.`
                    : "Chưa có shipper nào gửi vị trí."}
                </p>
              </div>
            </div>

            {activeShippers.map((shipper, index) => {
              const isSelected = selectedShipper?.id === shipper.id;
              // Mock positions based on index for the fake map view
              const top = 25 + (index * 17) % 50;
              const left = 20 + (index * 23) % 60;

              return (
                <button
                  key={shipper.id}
                  type="button"
                  onClick={() => setSelectedShipper(shipper)}
                  className={`absolute flex h-12 w-12 items-center justify-center rounded-full text-xl shadow-lg transition-all hover:scale-110 ${isSelected
                    ? "bg-brand-amber text-white ring-4 ring-brand-amber/30 z-10"
                    : "bg-brand-brown text-white z-0"
                    }`}
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                  }}
                  title={shipper.fullName}
                >
                  {shipper.vehicleType === VehicleType.CAR ? '🚗' : '🏍️'}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 text-lg font-bold text-brand-brown">
              Danh sách Shipper Online
            </h2>

            {activeShippers.length === 0 ? (
              <p className="text-sm text-brand-gray-500 py-4 text-center">
                Không có shipper nào đang chia sẻ vị trí.
              </p>
            ) : (
              <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {activeShippers.map((shipper) => {
                  const isSelected = selectedShipper?.id === shipper.id;

                  return (
                    <button
                      type="button"
                      key={shipper.id}
                      onClick={() => setSelectedShipper(shipper)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${isSelected
                        ? "border-brand-amber bg-brand-beige/60 shadow-sm"
                        : "border-transparent bg-brand-gray-50 hover:border-brand-amber/30 hover:bg-white"
                        }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-brand-brown">
                            {shipper.fullName}
                          </p>
                          <p className="text-xs text-brand-gray-500">
                            {shipper.phoneNumber}
                          </p>
                        </div>

                        <Badge variant="success" size="sm">
                          Online
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-brand-gray-600">
                        <span className="inline-flex items-center gap-1">
                          {getVehicleIcon(shipper.vehicleType)}
                          {getVehicleLabel(shipper.vehicleType)}
                        </span>
                      </div>

                      {shipper.currentLocation && (
                        <p className="mt-3 text-xs text-brand-gray-500">
                          Cập nhật:{" "}
                          {new Date(
                            shipper.currentLocation.recordedAt,
                          ).toLocaleTimeString("vi-VN")}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedShipper && (
            <div className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-beige text-brand-brown">
                  {getVehicleIcon(selectedShipper.vehicleType)}
                </div>

                <div>
                  <h3 className="font-bold text-brand-brown">
                    {selectedShipper.fullName}
                  </h3>
                  <p className="text-sm text-brand-gray-600">
                    {selectedShipper.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-brand-gray-600">Phương tiện</span>
                  <span className="font-semibold text-brand-brown">
                    {getVehicleLabel(selectedShipper.vehicleType)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-brand-gray-600">Biển số</span>
                  <span className="font-semibold text-brand-brown">
                    {selectedShipper.licensePlate}
                  </span>
                </div>

                {selectedShipper.currentLocation && (
                  <div className="border-t border-brand-gray-100 pt-3">
                    <p className="mb-1 text-xs text-brand-gray-500">
                      Vị trí hiện tại
                    </p>
                    <p className="rounded-2xl bg-brand-gray-50 px-3 py-2 text-xs text-brand-gray-700">
                      {selectedShipper.currentLocation.lat.toFixed(4)},{" "}
                      {selectedShipper.currentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>

              <a
                href={`tel:${selectedShipper.phoneNumber}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-brand-brown px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-coffee"
              >
                <Phone className="h-4 w-4" />
                Gọi điện
              </a>

              {selectedShipper.currentLocation && (
                <a
                  href={`https://www.google.com/maps?q=${selectedShipper.currentLocation.lat},${selectedShipper.currentLocation.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-brand-gray-200 px-4 py-3 text-sm font-semibold text-brand-brown transition hover:bg-brand-gray-50"
                >
                  <Navigation className="h-4 w-4" />
                  Mở trên Google Maps
                </a>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}