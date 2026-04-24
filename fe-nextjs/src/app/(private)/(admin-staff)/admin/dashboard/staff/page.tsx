"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Mail,
  Phone,
  User as UserIcon,
  Lock,
} from "lucide-react";
import { Button } from "@/app/components/shared/Button";
import { Input } from "@/app/components/shared/Input";
import { PasswordInput } from "@/app/components/shared/PasswordInput";
import { Modal } from "@/app/components/shared/Modal";
import { Badge } from "@/app/components/shared/Badge";
import { DataTable, Column } from "@/app/components/shared/DataTable";
import { ConfirmDialog } from "@/app/components/shared/ConfirmDialog";
import { formatDate } from "@/utils/cn";
import { useUIStore } from "@/stores/ui-store";
import { staffUserApi } from "@/services/api";
import type { StaffUserApiModel } from "@/types/api";

type StaffFormState = {
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
};

const DEFAULT_FORM: StaffFormState = {
  email: "",
  fullName: "",
  phoneNumber: "",
  password: "",
};

export default function StaffPage() {
  const { setError: setErrorStatus, setSuccess } = useUIStore();

  const [users, setUsers] = useState<StaffUserApiModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUserApiModel | null>(
    null,
  );
  const [deletingUser, setDeletingUser] = useState<StaffUserApiModel | null>(
    null,
  );
  const [formData, setFormData] = useState<StaffFormState>(DEFAULT_FORM);

  const isEditMode = editingUser !== null;

  const loadStaffUsers = useCallback(async () => {
    setIsTableLoading(true);

    try {
      const response = await staffUserApi.list({
        keyword: searchQuery.trim() || undefined,
        page: 1,
        limit: 100,
      });
      setUsers(response.items);
    } catch (err) {
      setErrorStatus(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách nhân viên",
      );
    } finally {
      setIsTableLoading(false);
    }
  }, [searchQuery, setErrorStatus]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStaffUsers();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadStaffUsers]);

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
  };

  const handleCreate = () => {
    setEditingUser(null);
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (user: StaffUserApiModel) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName ?? "",
      phoneNumber: user.phoneNumber ?? "",
      password: "",
    });
  };

  const closeFormModal = () => {
    setIsCreateModalOpen(false);
    setEditingUser(null);
    resetForm();
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setErrorStatus("Vui lÃ²ng nháº­p email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorStatus("Email khÃ´ng há»£p lá»‡");
      return false;
    }

    if (!formData.fullName.trim()) {
      setErrorStatus("Vui lÃ²ng nháº­p há» tÃªn");
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      setErrorStatus("Vui lÃ²ng nháº­p sá»‘ Ä‘iá»‡n thoáº¡i");
      return false;
    }

    if (!isEditMode && formData.password.length < 6) {
      setErrorStatus("Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±");
      return false;
    }

    if (isEditMode && formData.password && formData.password.length < 6) {
      setErrorStatus("Máº­t kháº©u má»›i pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      if (editingUser) {
        await staffUserApi.update(editingUser.id, {
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          password: formData.password || undefined,
        });
        setSuccess("Cập nhật nhân viên thành công");
      } else {
        await staffUserApi.create({
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          password: formData.password,
        });
        setSuccess("Thêm nhân viên thành công");
      }

      closeFormModal();
      await loadStaffUsers();
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể lưu nhân viên",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) {
      return;
    }

    setIsDeleting(true);

    try {
      await staffUserApi.delete(deletingUser.id);
      setSuccess("Xóa nhân viên thành công");
      setDeletingUser(null);
      await loadStaffUsers();
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể xóa nhân viên",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: StaffUserApiModel["role"]) => {
    if (role === "ADMIN") {
      return { variant: "danger" as const, label: "Admin" };
    }

    if (role === "USER") {
      return { variant: "warning" as const, label: "User" };
    }

    return { variant: "info" as const, label: "Staff" };
  };

  const columns: Column<StaffUserApiModel>[] = useMemo(
    () => [
      {
        key: "fullName",
        label: "Nhân Viên",
        render: (user) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-yellow to-brand-amber flex items-center justify-center text-brand-brown font-semibold">
              {(user.fullName ?? user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-brand-brown">
                {user.fullName ?? "(Chưa cập nhật)"}
              </p>
              <p className="text-xs text-brand-gray-500">{user.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "phoneNumber",
        label: "Số Điện Thoại",
        render: (user) => user.phoneNumber ?? "-",
      },
      {
        key: "role",
        label: "Vai Trò",
        render: (user) => {
          const badge = getRoleBadge(user.role);
          return (
            <Badge variant={badge.variant} size="sm">
              {badge.label}
            </Badge>
          );
        },
      },
      {
        key: "createdAt",
        label: "Ngày Tạo",
        render: (user) => formatDate(user.createdAt),
      },
    ],
    [],
  );

  return (
    <>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-2">
              Quản Lý Nhân Viên
            </h1>
            <p className="text-brand-gray-600">
              Danh sách nhân viên STAFF từ IAM service
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={20} />}
            onClick={handleCreate}
          >
            Thêm Staff
          </Button>
        </div>

        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
          <Input
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <DataTable
          columns={columns}
          data={users}
          isLoading={isTableLoading}
          actions={(user) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(user)}
                leftIcon={<Edit size={16} />}
              >
                Sửa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingUser(user)}
                className="text-brand-danger hover:text-brand-danger"
                leftIcon={<Trash2 size={16} />}
              >
                Xóa
              </Button>
            </>
          )}
          emptyState={{
            title: "Không tìm thấy nhân viên nào",
            description:
              "Thử điều chỉnh từ khóa tìm kiếm hoặc thêm nhân viên mới.",
          }}
        />
      </div>

      <Modal
        isOpen={isCreateModalOpen || editingUser !== null}
        onClose={closeFormModal}
        title={isEditMode ? "Cập Nhật Staff" : "Thêm Staff Mới"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeFormModal}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleSave()}
              isLoading={isSaving}
            >
              {isEditMode ? "Cập Nhật" : "Thêm Mới"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="staff@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            leftIcon={<Mail size={18} />}
            required
          />

          <Input
            label="Họ và Tên"
            placeholder="Nguyen Van A"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            leftIcon={<UserIcon size={18} />}
            required
          />

          <Input
            label="Số Điện Thoại"
            type="tel"
            placeholder="0901234567"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            leftIcon={<Phone size={18} />}
            required
          />

          <PasswordInput
            label={isEditMode ? "Mật khẩu mới (không bắt buộc)" : "Mật khẩu"}
            placeholder={
              isEditMode ? "Để trống nếu không đổi" : "Tối thiểu 6 ký tự"
            }
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            leftIcon={<Lock size={18} />}
            required={!isEditMode}
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deletingUser !== null}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => void handleDelete()}
        title="Xóa Staff"
        message={`Bạn có chắc muốn xóa staff \"${deletingUser?.fullName ?? deletingUser?.email ?? ""}\"?`}
        confirmText="Xóa"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
