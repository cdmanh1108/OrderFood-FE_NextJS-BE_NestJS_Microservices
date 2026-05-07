"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bike,
  Car,
  MapPin,
  Package,
  Phone,
  Radar,
  Star,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
} from "lucide-react";
import { deliveryTaskApi, deliveryShipperApi, orderApi } from "@/services/api";
import { DeliveryTaskDetailApiModel, ShipperLocationApiModel, VehicleType, DeliveryTaskStatus, OrderApiModel } from "@/types/api";
import { useUI } from "@/contexts/ui-context";

export default function OrderTrackingPage() {
  const { id } = useParams() as { id: string };
  const { setError } = useUI();

  const [task, setTask] = useState<DeliveryTaskDetailApiModel | null>(null);
  const [order, setOrder] = useState<OrderApiModel | null>(null);
  const [location, setLocation] = useState<ShipperLocationApiModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      // Load both order details and delivery task in parallel
      const [orderRes, taskRes] = await Promise.all([
        orderApi.getById(id),
        deliveryTaskApi.getByOrderId(id).catch(() => null)
      ]);

      setOrder(orderRes);

      if (taskRes) {
        setTask(taskRes);
        if (taskRes.shipperId) {
          try {
            const locRes = await deliveryShipperApi.getLocation(taskRes.shipperId);
            setLocation(locRes);
          } catch (err) {
            // Location might not be available yet
            console.log("No location available for shipper yet", err);
          }
        }
      }
    } catch (err) {
      console.log(err);
      setError("Không thể tải thông tin đơn hàng.");
    } finally {
      setIsLoading(false);
    }
  }, [id, setError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    // Auto-refresh location every 15 seconds if task is active
    if (!task || (task.status !== DeliveryTaskStatus.PICKED_UP && task.status !== DeliveryTaskStatus.IN_TRANSIT)) {
      return;
    }

    const interval = setInterval(() => {
      if (task.shipperId) {
        deliveryShipperApi.getLocation(task.shipperId)
          .then(setLocation)
          .catch(() => { }); // ignore errors silently for auto-refresh
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [task]);

  const getVehicleIcon = (vehicleType?: VehicleType) => {
    if (vehicleType === VehicleType.CAR) return <Car className="h-5 w-5" />;
    return <Bike className="h-5 w-5" />;
  };

  const getVehicleLabel = (vehicleType?: VehicleType) => {
    if (vehicleType === VehicleType.MOTORBIKE) return "Xe máy";
    if (vehicleType === VehicleType.CAR) return "Ô tô";
    return "Xe đạp";
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-brown border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-[var(--radius-card)] bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-brand-gray-400" />
        <h2 className="text-lg font-bold text-brand-brown">Không tìm thấy đơn hàng</h2>
        <Link href="/order-history" className="mt-4 inline-block text-brand-amber hover:underline">
          Về danh sách đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 pt-6 max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/order-history/${id}`}
            className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-gray-500 transition hover:text-brand-amber"
          >
            <ArrowLeft className="h-4 w-4" />
            Về chi tiết đơn hàng
          </Link>
          <h1 className="text-2xl font-bold text-brand-brown lg:text-3xl">
            Theo dõi Vận đơn
          </h1>
          <p className="mt-1 text-sm text-brand-gray-600">
            Mã đơn: <span className="font-mono font-bold text-brand-brown">{order.code}</span>
          </p>
        </div>

        {task && (
          <div className="flex items-center gap-2 rounded-full bg-brand-beige px-4 py-2 font-semibold text-brand-brown shadow-sm">
            {task.status === DeliveryTaskStatus.PENDING && <Clock className="h-4 w-4" />}
            {task.status === DeliveryTaskStatus.ASSIGNED && <User className="h-4 w-4" />}
            {task.status === DeliveryTaskStatus.PICKED_UP && <Package className="h-4 w-4" />}
            {task.status === DeliveryTaskStatus.IN_TRANSIT && <Truck className="h-4 w-4 text-brand-amber" />}
            {task.status === DeliveryTaskStatus.DELIVERED && <CheckCircle2 className="h-4 w-4 text-brand-green" />}

            <span>
              {task.status === DeliveryTaskStatus.PENDING && "Đang tìm tài xế"}
              {task.status === DeliveryTaskStatus.ASSIGNED && "Tài xế đang đến nhà hàng"}
              {task.status === DeliveryTaskStatus.PICKED_UP && "Tài xế đã lấy hàng"}
              {task.status === DeliveryTaskStatus.IN_TRANSIT && "Đang trên đường giao"}
              {task.status === DeliveryTaskStatus.DELIVERED && "Giao hàng thành công"}
              {task.status === DeliveryTaskStatus.CANCELLED && "Đã hủy giao hàng"}
              {task.status === DeliveryTaskStatus.FAILED && "Giao hàng thất bại"}
            </span>
          </div>
        )}
      </div>

      {!task ? (
        <div className="rounded-2xl border-2 border-dashed border-brand-gray-200 bg-white p-12 text-center shadow-sm">
          <Truck className="mx-auto mb-4 h-12 w-12 text-brand-gray-400" />
          <h3 className="text-lg font-bold text-brand-brown">Đơn hàng chưa được điều phối</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-brand-gray-600">
            Hệ thống đang xử lý và sẽ sớm phân công Shipper để giao món cho bạn. Vui lòng quay lại sau!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Map Section */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card)] flex flex-col">
            <div className="border-b border-brand-gray-100 bg-brand-gray-50 px-5 py-4 flex justify-between items-center">
              <h2 className="font-bold text-brand-brown flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-amber" />
                Bản đồ theo dõi
              </h2>
              {location && (
                <span className="text-xs text-brand-gray-500">
                  Cập nhật: {new Date(location.recordedAt).toLocaleTimeString("vi-VN")}
                </span>
              )}
            </div>

            <div className="relative flex-1 min-h-[400px] bg-brand-beige/50 overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

              {!task.shipper ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-brand-gray-500 font-medium">Chưa có Shipper</p>
                </div>
              ) : !location ? (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                  <div className="animate-pulse h-12 w-12 rounded-full bg-brand-amber/20 flex items-center justify-center">
                    <Radar className="h-6 w-6 text-brand-amber animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                  <p className="text-brand-gray-500 font-medium text-sm">Đang chờ tín hiệu GPS từ Shipper...</p>
                </div>
              ) : (
                <>
                  {/* Fake map route line */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
                    <path d="M 50%,20% Q 60%,50% 50%,80%" stroke="var(--brand-amber)" strokeWidth="4" strokeDasharray="8 8" fill="none" />
                  </svg>

                  {/* Destination Marker (Customer) */}
                  <div className="absolute left-[50%] top-[80%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div className="bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold text-brand-brown mb-1">
                      Bạn ở đây
                    </div>
                    <div className="w-8 h-8 rounded-full bg-brand-brown flex items-center justify-center shadow-lg border-2 border-white text-white">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Shipper Marker */}
                  <div
                    className="absolute transition-all duration-1000 ease-in-out -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                    style={{ left: '50%', top: task.status === DeliveryTaskStatus.DELIVERED ? '80%' : '40%' }}
                  >
                    <div className="bg-brand-amber px-3 py-1 rounded-full shadow-md text-xs font-bold text-white mb-1">
                      {task.shipper.fullName}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-brand-amber animate-bounce">
                      <div className="text-brand-brown">
                        {getVehicleIcon(task.shipper.vehicleType)}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipper Info */}
            {task.shipper && (
              <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
                <h3 className="mb-4 font-bold text-brand-brown border-b border-brand-gray-100 pb-3">
                  Thông tin Tài xế
                </h3>

                <div className="flex items-center gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-brand-amber to-brand-brown flex items-center justify-center text-white font-bold text-xl shadow-inner">
                    {task.shipper.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-brand-brown text-lg">{task.shipper.fullName}</p>
                    <div className="flex items-center gap-1 text-sm text-brand-gray-600 mt-1">
                      <Star className="h-3 w-3 fill-brand-yellow text-brand-yellow" />
                      <span className="font-medium text-brand-brown">5.0</span>
                      <span className="text-brand-gray-400 mx-1">•</span>
                      <span>{getVehicleLabel(task.shipper.vehicleType)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-gray-50 rounded-xl p-3 flex justify-between items-center mb-4">
                  <span className="text-sm text-brand-gray-600">Biển số xe:</span>
                  <span className="font-bold text-brand-brown">{task.shipper.licensePlate}</span>
                </div>

                <a
                  href={`tel:${task.shipper.phoneNumber}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-brown py-3 text-sm font-bold text-white transition hover:bg-brand-coffee shadow-sm"
                >
                  <Phone className="h-4 w-4" />
                  Gọi điện ({task.shipper.phoneNumber})
                </a>
              </div>
            )}

            {/* Delivery Info */}
            <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)]">
              <h3 className="mb-4 font-bold text-brand-brown border-b border-brand-gray-100 pb-3">
                Chi tiết Giao hàng
              </h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 rounded-full bg-brand-gray-100 p-2 text-brand-gray-500 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-gray-500 uppercase tracking-wider mb-1">Giao đến</p>
                    <p className="text-sm font-medium text-brand-brown">{task.recipientName} - {task.recipientPhone}</p>
                    <p className="text-sm text-brand-gray-600 mt-0.5">{task.deliveryAddress}</p>
                  </div>
                </div>

                {task.note && (
                  <div className="flex gap-3 pt-3 border-t border-brand-gray-100">
                    <div className="mt-0.5 rounded-full bg-brand-yellow/20 p-2 text-brand-amber shrink-0">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-brand-gray-500 uppercase tracking-wider mb-1">Ghi chú giao hàng</p>
                      <p className="text-sm text-brand-brown">{task.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Need this to avoid undefined icon error above
const User = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
