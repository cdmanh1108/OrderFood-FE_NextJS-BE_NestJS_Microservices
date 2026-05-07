"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MapPin,
  Package,
  Phone,
  Truck,
  CheckCircle2,
  Navigation,
  Clock,
  Radar,
  LogOut,
  UploadCloud,
  Camera
} from "lucide-react";
import { deliveryTaskApi, deliveryShipperApi, mediaApi, authApi } from "@/services/api";
import { DeliveryTaskDetailApiModel, DeliveryTaskStatus, ShipperDetailApiModel, ImageContentType } from "@/types/api";
import { useUI } from "@/contexts/ui-context";
import { Button } from "@/app/components/shared/Button";
import { Badge } from "@/app/components/shared/Badge";
import { Modal } from "@/app/components/shared/Modal";
import { useShipperLocationTracking } from "@/hooks/useShipperLocationTracking";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function ShipperDashboardPage() {
  const { setError, setSuccess } = useUI();
  const router = useRouter();
  const { logout } = useAuth();

  const [profile, setProfile] = useState<ShipperDetailApiModel | null>(null);
  const [tasks, setTasks] = useState<DeliveryTaskDetailApiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Upload proof state
  const [proofModalOpen, setProofModalOpen] = useState(false);
  const [proofingTaskId, setProofingTaskId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Trạng thái Bật/Tắt truyền GPS
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  // Hook xử lý chạy ngầm GPS
  useShipperLocationTracking(isTrackingActive);

  const loadData = useCallback(async () => {
    try {
      // Load profile & tasks
      const [profileRes, tasksRes] = await Promise.all([
        deliveryShipperApi.getMyProfile(),
        deliveryTaskApi.getMyTasks({ limit: 10 })
      ]);
      setProfile(profileRes);

      // Chỉ hiện các đơn chưa hoàn thành / hủy
      const activeTasks = tasksRes.items.filter(
        (t) => t.status !== DeliveryTaskStatus.DELIVERED &&
          t.status !== DeliveryTaskStatus.CANCELLED &&
          t.status !== DeliveryTaskStatus.FAILED
      );
      setTasks(activeTasks);

      // Auto-turn on tracking if there are active tasks and profile is active
      if (profileRes?.isActive && activeTasks.length > 0) {
        setIsTrackingActive(true);
      }
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu Shipper.");
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    void loadData();
    // Tự động refresh task mỗi 30s để xem có đơn mới gán không
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleUpdateStatus = async (taskId: string, newStatus: DeliveryTaskStatus) => {
    if (newStatus === DeliveryTaskStatus.DELIVERED) {
      setProofingTaskId(taskId);
      setProofFile(null);
      setProofModalOpen(true);
      return;
    }

    setIsUpdating(true);
    try {
      await deliveryTaskApi.updateStatus(taskId, { status: newStatus });
      setSuccess("Cập nhật trạng thái đơn hàng thành công!");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    try {
      logout();
      router.push("/login");
    } catch (err) {
      // console.log(err);
      setError("Đăng xuất thất bại");
    }
  };

  const submitDeliveryProof = async () => {
    if (!proofingTaskId || !proofFile) {
      setError("Vui lòng chọn hình ảnh xác nhận giao hàng");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get pre-signed URL
      const { uploadUrl, key, publicUrl } = await mediaApi.createUploadUrl({
        fileName: proofFile.name,
        contentType: proofFile.type as ImageContentType,
        folder: "delivery-proofs",
      });

      // 2. Upload file to S3/Storage
      await fetch(uploadUrl, {
        method: "PUT",
        body: proofFile,
        headers: { "Content-Type": proofFile.type },
      });

      // 3. Submit proof to backend
      await deliveryTaskApi.submitProof(proofingTaskId, {
        mediaFileId: key,
        note: "Shipper uploaded delivery proof",
      });

      // 4. Update task status to DELIVERED
      await deliveryTaskApi.updateStatus(proofingTaskId, { status: DeliveryTaskStatus.DELIVERED });

      setSuccess("Hoàn thành đơn hàng thành công!");
      setProofModalOpen(false);
      setProofFile(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh lên thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleTracking = () => {
    if (!profile?.isActive) {
      setError("Tài khoản của bạn đang bị vô hiệu hóa, không thể bật định vị.");
      return;
    }
    setIsTrackingActive(!isTrackingActive);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-brand-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-brown border-t-transparent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-brand-danger bg-brand-danger/10 m-6 rounded-2xl">
        Lỗi: Không tìm thấy hồ sơ Shipper cho tài khoản này. Vui lòng liên hệ Admin.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 pb-24">
      {/* Header Profile & Tracking Status */}
      <div className="bg-gradient-to-br from-brand-brown to-brand-amber px-6 py-8 text-white shadow-md rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold line-clamp-1">Xin chào, {profile.fullName}</h1>
            <p className="text-white/80 text-sm mt-1">Biển số: {profile.licensePlate}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold backdrop-blur shrink-0">
              {profile.fullName.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="p-3 bg-white/10 hover:bg-red-500/80 hover:text-white text-white/90 rounded-full transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white/10 rounded-2xl p-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className={`relative flex h-4 w-4 items-center justify-center`}>
              {isTrackingActive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-green opacity-75"></span>
              )}
              <span className={`relative inline-flex h-3 w-3 rounded-full ${isTrackingActive ? 'bg-brand-green' : 'bg-gray-400'}`}></span>
            </div>
            <div>
              <p className="font-semibold">{isTrackingActive ? "Đang phát GPS" : "Đã tắt GPS"}</p>
              <p className="text-xs text-white/70">
                {isTrackingActive ? "Hệ thống đang theo dõi vị trí của bạn" : "Bật để nhận đơn & điều phối"}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTracking}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isTrackingActive
              ? "bg-white/20 text-white hover:bg-white/30"
              : "bg-white text-brand-brown hover:bg-gray-100 shadow-sm"
              }`}
          >
            {isTrackingActive ? "Tắt" : "Bật Online"}
          </button>
        </div>

        {!profile.isActive && (
          <div className="mt-4 bg-red-500/20 text-red-100 p-3 rounded-xl text-sm">
            Tài khoản của bạn đã bị vô hiệu hóa. Không thể nhận thêm đơn mới.
          </div>
        )}
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {tasks.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-8 text-center shadow-sm">
            <Package className="h-12 w-12 text-brand-gray-300 mx-auto mb-3" />
            <h3 className="text-brand-brown font-bold text-lg">Không có đơn hàng nào</h3>
            <p className="text-brand-gray-500 text-sm mt-2">
              Hãy đảm bảo bạn đã bật GPS. Hệ thống sẽ tự động gửi thông báo khi có đơn được gán.
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white rounded-3xl p-5 shadow-[var(--shadow-card)] border border-brand-gray-100">
              <div className="flex justify-between items-start mb-3">
                <Badge variant={
                  task.status === DeliveryTaskStatus.ASSIGNED ? "warning" :
                    task.status === DeliveryTaskStatus.PICKED_UP ? "info" : "primary"
                }>
                  {task.status === DeliveryTaskStatus.ASSIGNED && "Đơn mới"}
                  {task.status === DeliveryTaskStatus.PICKED_UP && "Đã lấy hàng"}
                  {task.status === DeliveryTaskStatus.IN_TRANSIT && "Đang đi giao"}
                </Badge>
                <span className="text-xs font-mono text-brand-gray-500">#{task.orderId.substring(0, 8)}</span>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1 rounded-full bg-brand-gray-100 p-2 text-brand-gray-500 shrink-0 h-fit">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-gray-500 uppercase">Giao đến</p>
                    <p className="font-bold text-brand-brown">{task.recipientName}</p>
                    <p className="text-sm text-brand-gray-600 mt-1">{task.deliveryAddress}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a href={`tel:${task.recipientPhone}`} className="flex-1 flex items-center justify-center gap-2 bg-brand-gray-50 text-brand-brown py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-gray-100 transition">
                    <Phone className="h-4 w-4" />
                    Gọi Khách
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${task.deliveryLat},${task.deliveryLng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-beige text-brand-brown py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-yellow/20 transition"
                  >
                    <Navigation className="h-4 w-4" />
                    Bản đồ
                  </a>
                </div>

                {task.note && (
                  <div className="bg-brand-yellow/10 p-3 rounded-xl">
                    <p className="text-xs font-semibold text-brand-amber mb-1">Ghi chú</p>
                    <p className="text-sm text-brand-brown">{task.note}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-brand-gray-100">
                  {task.status === DeliveryTaskStatus.ASSIGNED && (
                    <Button
                      className="w-full"
                      onClick={() => handleUpdateStatus(task.id, DeliveryTaskStatus.PICKED_UP)}
                      isLoading={isUpdating}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Xác nhận đã lấy hàng
                    </Button>
                  )}

                  {task.status === DeliveryTaskStatus.PICKED_UP && (
                    <Button
                      className="w-full"
                      variant="primary"
                      onClick={() => handleUpdateStatus(task.id, DeliveryTaskStatus.IN_TRANSIT)}
                      isLoading={isUpdating}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Bắt đầu đi giao
                    </Button>
                  )}

                  {task.status === DeliveryTaskStatus.IN_TRANSIT && (
                    <Button
                      className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                      onClick={() => handleUpdateStatus(task.id, DeliveryTaskStatus.DELIVERED)}
                      isLoading={isUpdating}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Hoàn thành giao hàng
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={proofModalOpen}
        onClose={() => !isUploading && setProofModalOpen(false)}
        title="Xác nhận giao hàng"
        size="md"
        closeOnOutsideClick={!isUploading}
      >
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-brand-beige w-full h-48 rounded-xl border-2 border-dashed border-brand-amber/50 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:bg-brand-yellow/10 transition-colors">
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              capture="environment"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setProofFile(e.target.files[0]);
                }
              }}
              disabled={isUploading}
            />
            {proofFile ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={URL.createObjectURL(proofFile)}
                alt="Proof"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-brand-amber group-hover:scale-110 transition-transform">
                  <Camera size={32} />
                </div>
                <p className="text-brand-brown font-semibold text-center">Chạm để chụp ảnh<br /><span className="text-sm font-normal text-brand-gray-500">Hình ảnh có gói hàng và cửa nhà/khách nhận</span></p>
              </>
            )}
          </div>

          <div className="flex w-full gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setProofModalOpen(false)}
              disabled={isUploading}
            >
              Hủy
            </Button>
            <Button
              className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white"
              onClick={submitDeliveryProof}
              isLoading={isUploading}
              disabled={!proofFile}
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Gửi & Hoàn thành
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
