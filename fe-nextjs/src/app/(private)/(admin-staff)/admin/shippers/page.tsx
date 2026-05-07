"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Bike,
    Car,
    Map,
    Plus,
    Star,
    Trash2,
    UserRound,
    Users,
    Package,
} from "lucide-react";
import { Button } from "@/app/components/shared/Button";
import { Badge } from "@/app/components/shared/Badge";
import { DataTable, Column } from "@/app/components/shared/DataTable";
import { Modal } from "@/app/components/shared/Modal";
import { Input } from "@/app/components/shared/Input";
import { ConfirmDialog } from "@/app/components/shared/ConfirmDialog";
import { useUI } from "@/contexts/ui-context";
import { deliveryShipperApi, staffUserApi } from "@/services/api";
import { ShipperDetailApiModel, VehicleType } from "@/types/api";
import type { StaffUserApiModel } from "@/types/api";

type ShipperFormState = {
    userId: string;
    fullName: string;
    phoneNumber: string;
    vehicleType: VehicleType;
    licensePlate: string;
    isActive: boolean;
};

const DEFAULT_FORM: ShipperFormState = {
    userId: "",
    fullName: "",
    phoneNumber: "",
    vehicleType: VehicleType.MOTORBIKE,
    licensePlate: "",
    isActive: true,
};

export default function ShippersManagementPage() {
    const { setError, setSuccess } = useUI();

    const [shippers, setShippers] = useState<ShipperDetailApiModel[]>([]);
    const [iamShippers, setIamShippers] = useState<StaffUserApiModel[]>([]);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingShipper, setEditingShipper] = useState<ShipperDetailApiModel | null>(null);
    const [deactivatingShipper, setDeactivatingShipper] = useState<ShipperDetailApiModel | null>(null);

    const [formData, setFormData] = useState<ShipperFormState>(DEFAULT_FORM);

    const loadShippers = useCallback(async () => {
        setIsTableLoading(true);
        try {
            const response = await deliveryShipperApi.list({ limit: 100 });
            setShippers(response.items);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Không thể tải danh sách shipper",
            );
        } finally {
            setIsTableLoading(false);
        }
    }, [setError]);

    const loadIamShippers = useCallback(async () => {
        try {
            const response = await staffUserApi.list({ limit: 100 });
            // Filter only SHIPPER role
            setIamShippers(response.items.filter((u) => u.role === "SHIPPER"));
        } catch (err) {
            console.error("Failed to load IAM shippers:", err);
        }
    }, []);

    useEffect(() => {
        void loadShippers();
        void loadIamShippers();
    }, [loadShippers, loadIamShippers]);

    const activeCount = shippers.filter((s) => s.isActive).length;
    const inactiveCount = shippers.filter((s) => !s.isActive).length;

    const getVehicleLabel = (vehicleType: VehicleType) => {
        if (vehicleType === VehicleType.MOTORBIKE) return "Xe máy";
        if (vehicleType === VehicleType.CAR) return "Ô tô";
        return "Xe đạp";
    };

    const getVehicleIcon = (vehicleType: VehicleType) => {
        if (vehicleType === VehicleType.CAR) return <Car className="h-4 w-4" />;
        return <Bike className="h-4 w-4" />;
    };

    const handleOpenModal = (shipper?: ShipperDetailApiModel) => {
        if (shipper) {
            setEditingShipper(shipper);
            setFormData({
                userId: shipper.userId,
                fullName: shipper.fullName,
                phoneNumber: shipper.phoneNumber,
                vehicleType: shipper.vehicleType,
                licensePlate: shipper.licensePlate,
                isActive: shipper.isActive,
            });
        } else {
            setEditingShipper(null);
            setFormData(DEFAULT_FORM);
        }
        setShowModal(true);
    };

    const handleUserSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        const selectedUser = iamShippers.find((u) => u.id === userId);
        if (selectedUser) {
            setFormData({
                ...formData,
                userId,
                fullName: selectedUser.fullName || "",
                phoneNumber: selectedUser.phoneNumber || "",
            });
        } else {
            setFormData({ ...formData, userId });
        }
    };

    const handleSubmit = async () => {
        if (!formData.userId.trim() || !formData.fullName.trim() || !formData.phoneNumber.trim() || !formData.licensePlate.trim()) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        setIsSaving(true);
        try {
            if (editingShipper) {
                await deliveryShipperApi.update(editingShipper.id, {
                    fullName: formData.fullName.trim(),
                    phoneNumber: formData.phoneNumber.trim(),
                    vehicleType: formData.vehicleType,
                    licensePlate: formData.licensePlate.trim(),
                    isActive: formData.isActive,
                });
                setSuccess("Cập nhật shipper thành công");
            } else {
                await deliveryShipperApi.create({
                    userId: formData.userId,
                    fullName: formData.fullName.trim(),
                    phoneNumber: formData.phoneNumber.trim(),
                    vehicleType: formData.vehicleType,
                    licensePlate: formData.licensePlate.trim(),
                });
                setSuccess("Thêm shipper thành công");
            }
            setShowModal(false);
            await loadShippers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivate = async () => {
        if (!deactivatingShipper) return;
        setIsDeleting(true);
        try {
            await deliveryShipperApi.deactivate(deactivatingShipper.id);
            setSuccess("Đã vô hiệu hóa shipper");
            setDeactivatingShipper(null);
            await loadShippers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReactivate = async (shipper: ShipperDetailApiModel) => {
        try {
            await deliveryShipperApi.update(shipper.id, { isActive: true });
            setSuccess("Đã kích hoạt lại shipper");
            await loadShippers();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        }
    };

    const columns: Column<ShipperDetailApiModel>[] = useMemo(
        () => [
            {
                key: "fullName",
                label: "Shipper",
                render: (shipper) => (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-beige">
                            <UserRound className="h-5 w-5 text-brand-brown" />
                        </div>
                        <div>
                            <p className="font-bold text-brand-brown">{shipper.fullName}</p>
                            <p className="text-xs text-brand-gray-500">{shipper.phoneNumber}</p>
                        </div>
                    </div>
                ),
            },
            {
                key: "vehicleType",
                label: "Phương tiện",
                render: (shipper) => (
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-beige px-3 py-1 text-sm font-medium text-brand-brown">
                        {getVehicleIcon(shipper.vehicleType)}
                        {getVehicleLabel(shipper.vehicleType)}
                    </div>
                ),
            },
            {
                key: "licensePlate",
                label: "Biển số",
                render: (shipper) => (
                    <span className="font-semibold text-brand-gray-700">
                        {shipper.licensePlate}
                    </span>
                ),
            },
            {
                key: "isActive",
                label: "Trạng thái",
                render: (shipper) => (
                    <Badge variant={shipper.isActive ? "success" : "error"}>
                        {shipper.isActive ? "Đang hoạt động" : "Vô hiệu hóa"}
                    </Badge>
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

                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                                    Delivery Team
                                </p>
                                <h1 className="mt-2 text-2xl font-bold text-white lg:text-3xl">
                                    Quản lý Shipper
                                </h1>
                                <p className="mt-2 text-sm text-white/80">
                                    Quản lý nhân sự giao hàng, trạng thái hoạt động và phương tiện.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Link href="/admin/shippers/tasks">
                                    <Button variant="outline" leftIcon={<Package size={16} />} className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                                        Điều phối đơn
                                    </Button>
                                </Link>

                                <Link href="/admin/shippers/tracking">
                                    <Button variant="outline" leftIcon={<Map size={16} />}>
                                        Bản đồ tracking
                                    </Button>
                                </Link>

                                <Button
                                    variant="primary"
                                    leftIcon={<Plus size={18} />}
                                    onClick={() => handleOpenModal()}
                                >
                                    Thêm Shipper
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl bg-brand-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-brown">
                                <Users className="h-4 w-4" />
                                Tổng hồ sơ shipper
                            </div>
                            <p className="text-2xl font-bold text-brand-brown">
                                {shippers.length}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-brand-gray-50 p-4">
                            <p className="text-sm font-semibold text-brand-brown">
                                Đang hoạt động
                            </p>
                            <p className="mt-2 text-2xl font-bold text-brand-green">
                                {activeCount}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-brand-gray-50 p-4">
                            <p className="text-sm font-semibold text-brand-brown">Ngừng hoạt động</p>
                            <p className="mt-2 text-2xl font-bold text-brand-danger">
                                {inactiveCount}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-[var(--radius-card)] bg-white p-4 shadow-[var(--shadow-card)] lg:p-6">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-brand-brown">
                                Danh sách shipper
                            </h2>
                            <p className="mt-1 text-sm text-brand-gray-600">
                                {shippers.length} shipper trong hệ thống giao hàng.
                            </p>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={shippers}
                        isLoading={isTableLoading}
                        actions={(shipper) => (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenModal(shipper)}
                                >
                                    Sửa
                                </Button>
                                {shipper.isActive ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-brand-danger hover:text-brand-danger"
                                        onClick={() => setDeactivatingShipper(shipper)}
                                    >
                                        Vô hiệu hóa
                                    </Button>
                                ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-brand-green hover:text-brand-green"
                                    onClick={() => void handleReactivate(shipper)}
                                >
                                    Kích hoạt lại
                                </Button>
                                )}
                            </>
                        )}
                        emptyState={{
                            title: "Không tìm thấy shipper nào",
                            description: "Chưa có shipper nào được thêm vào hệ thống giao hàng.",
                        }}
                    />
                </section>

                <Modal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={editingShipper ? "Sửa Shipper" : "Thêm Shipper Mới"}
                    footer={
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowModal(false)}
                                disabled={isSaving}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => void handleSubmit()}
                                isLoading={isSaving}
                            >
                                {editingShipper ? "Cập nhật" : "Thêm mới"}
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-4">
                        {!editingShipper && (
                            <div>
                                <label className="mb-2 block text-sm font-medium text-brand-brown">
                                    Tài khoản IAM (Phải thuộc role SHIPPER)
                                </label>
                                <select
                                    value={formData.userId}
                                    onChange={handleUserSelectChange}
                                    className="w-full rounded-xl border border-brand-gray-200 px-4 py-3 outline-none transition focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20"
                                >
                                    <option value="">-- Chọn tài khoản --</option>
                                    {iamShippers.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.fullName || u.email} - {u.phoneNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <Input
                            label="Tên shipper"
                            value={formData.fullName}
                            onChange={(e) =>
                                setFormData({ ...formData, fullName: e.target.value })
                            }
                            required
                        />

                        <Input
                            label="Số điện thoại"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                                setFormData({ ...formData, phoneNumber: e.target.value })
                            }
                            required
                        />

                        <div>
                            <label className="mb-2 block text-sm font-medium text-brand-brown">
                                Phương tiện
                            </label>
                            <select
                                value={formData.vehicleType}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        vehicleType: e.target.value as VehicleType,
                                    })
                                }
                                className="w-full rounded-xl border border-brand-gray-200 px-4 py-3 outline-none transition focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/20"
                            >
                                <option value={VehicleType.MOTORBIKE}>Xe máy</option>
                                <option value={VehicleType.CAR}>Ô tô</option>
                                <option value={VehicleType.BICYCLE}>Xe đạp</option>
                            </select>
                        </div>

                        <Input
                            label="Biển số xe"
                            value={formData.licensePlate}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    licensePlate: e.target.value,
                                })
                            }
                            required
                        />

                        {editingShipper && (
                            <label className="flex items-center gap-3 cursor-pointer mt-4">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-brand-yellow rounded border-brand-gray-300 focus:ring-brand-yellow"
                                />
                                <span className="text-sm font-medium text-brand-brown">Tài khoản đang hoạt động</span>
                            </label>
                        )}
                    </div>
                </Modal>

                <ConfirmDialog
                    isOpen={deactivatingShipper !== null}
                    onClose={() => setDeactivatingShipper(null)}
                    onConfirm={() => void handleDeactivate()}
                    title="Vô hiệu hóa Shipper"
                    message={`Bạn có chắc muốn vô hiệu hóa shipper "${deactivatingShipper?.fullName}"?`}
                    confirmText="Vô hiệu hóa"
                    cancelText="Hủy bỏ"
                    variant="danger"
                    isLoading={isDeleting}
                />
            </div>
        </>
    );
}