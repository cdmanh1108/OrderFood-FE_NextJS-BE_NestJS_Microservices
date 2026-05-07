"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Bike,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
} from "lucide-react";
import { Button } from "@/app/components/shared/Button";
import { Badge } from "@/app/components/shared/Badge";
import { DataTable, Column } from "@/app/components/shared/DataTable";
import { Modal } from "@/app/components/shared/Modal";
import { useUI } from "@/contexts/ui-context";
import { deliveryTaskApi, deliveryShipperApi } from "@/services/api";
import { DeliveryTaskStatus, DeliveryTaskDetailApiModel, ShipperDetailApiModel } from "@/types/api";

export default function DeliveryTasksManagementPage() {
  const { setError, setSuccess } = useUI();

  const [tasks, setTasks] = useState<DeliveryTaskDetailApiModel[]>([]);
  const [shippers, setShippers] = useState<ShipperDetailApiModel[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [filterStatus, setFilterStatus] = useState<DeliveryTaskStatus | "ALL">("ALL");

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedShipperId, setSelectedShipperId] = useState<string>("");

  const loadTasks = useCallback(async () => {
    setIsTableLoading(true);
    try {
      const response = await deliveryTaskApi.list({
        status: filterStatus === "ALL" ? undefined : filterStatus,
        limit: 100,
      });
      setTasks(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải danh sách vận đơn");
    } finally {
      setIsTableLoading(false);
    }
  }, [filterStatus, setError]);

  const loadActiveShippers = useCallback(async () => {
    try {
      const response = await deliveryShipperApi.list({ isActive: true, limit: 100 });
      setShippers(response.items);
    } catch (err) {
      console.error("Failed to load shippers:", err);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
    void loadActiveShippers();
  }, [loadTasks, loadActiveShippers]);

  const handleOpenAssignModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setSelectedShipperId("");
    setAssignModalOpen(true);
  };

  const handleAssignTask = async () => {
    if (!selectedTaskId || !selectedShipperId) {
      setError("Vui lòng chọn Shipper");
      return;
    }

    setIsAssigning(true);
    try {
      await deliveryTaskApi.assign(selectedTaskId, { shipperId: selectedShipperId });
      setSuccess("Gán đơn cho Shipper thành công!");
      setAssignModalOpen(false);
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi gán đơn");
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadge = (status: DeliveryTaskStatus) => {
    switch (status) {
      case DeliveryTaskStatus.PENDING:
        return <Badge variant="warning">Chờ gán tài</Badge>;
      case DeliveryTaskStatus.ASSIGNED:
        return <Badge variant="info">Đã gán</Badge>;
      case DeliveryTaskStatus.PICKED_UP:
        return <Badge variant="info">Đã lấy hàng</Badge>;
      case DeliveryTaskStatus.IN_TRANSIT:
        return <Badge variant="warning">Đang giao</Badge>;
      case DeliveryTaskStatus.DELIVERED:
        return <Badge variant="success">Hoàn thành</Badge>;
      case DeliveryTaskStatus.FAILED:
      case DeliveryTaskStatus.CANCELLED:
        return <Badge variant="error">Thất bại/Đã hủy</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const columns: Column<DeliveryTaskDetailApiModel>[] = useMemo(
    () => [
      {
        key: "orderId",
        label: "Mã Đơn",
        render: (task) => (
          <span className="font-mono text-sm text-brand-gray-600">
            {task.orderId.substring(0, 8).toUpperCase()}
          </span>
        ),
      },
      {
        key: "recipientName",
        label: "Người Nhận",
        render: (task) => (
          <div>
            <p className="font-bold text-brand-brown">{task.recipientName}</p>
            <p className="text-xs text-brand-gray-500">{task.recipientPhone}</p>
          </div>
        ),
      },
      {
        key: "deliveryAddress",
        label: "Địa chỉ Giao",
        render: (task) => (
          <div className="flex items-start gap-1 max-w-[200px]">
            <MapPin className="h-4 w-4 shrink-0 text-brand-gray-400 mt-0.5" />
            <p className="text-sm text-brand-gray-700 line-clamp-2" title={task.deliveryAddress}>
              {task.deliveryAddress}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        label: "Trạng thái",
        render: (task) => getStatusBadge(task.status),
      },
      {
        key: "shipperId",
        label: "Shipper",
        render: (task) => {
          if (!task.shipper) {
            return <span className="text-sm text-brand-gray-400 italic">Chưa gán</span>;
          }
          return (
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-brand-amber" />
              <span className="text-sm font-semibold text-brand-brown">
                {task.shipper.fullName}
              </span>
            </div>
          );
        },
      },
      {
        key: "createdAt",
        label: "Thời gian tạo",
        render: (task) => (
          <span className="text-sm text-brand-gray-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(task.createdAt).toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <>
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
                Quay lại danh sách Shipper
              </Link>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                    Delivery Tasks
                  </p>
                  <h1 className="mt-2 text-2xl font-bold text-white lg:text-3xl">
                    Điều phối Đơn Giao Hàng
                  </h1>
                  <p className="mt-2 text-sm text-white/80">
                    Quản lý và gán đơn hàng cho shipper nhanh chóng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)] lg:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-brown">
                Danh sách Vận Đơn
              </h2>
              <p className="mt-1 text-sm text-brand-gray-600">
                {tasks.length} đơn hàng trong hệ thống.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-brand-gray-600">Lọc trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-xl border border-brand-gray-200 px-4 py-2 text-sm outline-none transition focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20 bg-brand-gray-50"
              >
                <option value="ALL">Tất cả</option>
                <option value={DeliveryTaskStatus.PENDING}>Chờ gán tài (PENDING)</option>
                <option value={DeliveryTaskStatus.ASSIGNED}>Đã gán (ASSIGNED)</option>
                <option value={DeliveryTaskStatus.IN_TRANSIT}>Đang giao (IN_TRANSIT)</option>
                <option value={DeliveryTaskStatus.DELIVERED}>Hoàn thành (DELIVERED)</option>
              </select>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={tasks}
            isLoading={isTableLoading}
            actions={(task) => (
              <>
                {task.status === DeliveryTaskStatus.PENDING && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenAssignModal(task.id)}
                  >
                    Gán Shipper
                  </Button>
                )}
                {task.status !== DeliveryTaskStatus.PENDING && (
                  <Button variant="ghost" size="sm" disabled>
                    Đã xử lý
                  </Button>
                )}
              </>
            )}
            emptyState={{
              title: "Không có vận đơn nào",
              description: filterStatus === "ALL" 
                ? "Hệ thống chưa ghi nhận đơn giao hàng nào."
                : "Không có đơn hàng nào ở trạng thái này.",
            }}
          />
        </section>

        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title="Gán Shipper Cho Đơn Hàng"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => setAssignModalOpen(false)}
                disabled={isAssigning}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={() => void handleAssignTask()}
                isLoading={isAssigning}
                disabled={!selectedShipperId}
              >
                Xác nhận gán
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-brand-gray-600">
              Chọn một shipper đang rảnh để gán giao đơn hàng này.
            </p>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-brand-brown">
                Shipper (Online)
              </label>
              <select
                value={selectedShipperId}
                onChange={(e) => setSelectedShipperId(e.target.value)}
                className="w-full rounded-xl border border-brand-gray-200 px-4 py-3 outline-none transition focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20"
              >
                <option value="">-- Chọn shipper --</option>
                {shippers.map((shipper) => (
                  <option key={shipper.id} value={shipper.id}>
                    {shipper.fullName} - {shipper.phoneNumber} ({shipper.licensePlate})
                  </option>
                ))}
              </select>
            </div>
            
            {shippers.length === 0 && (
              <p className="text-sm text-brand-danger bg-brand-danger/10 p-3 rounded-lg">
                Hiện không có Shipper nào đang hoạt động. Bạn cần thêm Shipper trước.
              </p>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
}
