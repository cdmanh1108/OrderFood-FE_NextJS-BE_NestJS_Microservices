"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { Button } from "@/app/components/shared/Button";
import { Input } from "@/app/components/shared/Input";
import { Modal } from "@/app/components/shared/Modal";
import { Badge } from "@/app/components/shared/Badge";
import { DataTable, Column } from "@/app/components/shared/DataTable";
import { ConfirmDialog } from "@/app/components/shared/ConfirmDialog";
import { useUIStore } from "@/stores/ui-store";
import { formatDate, toSlug } from "@/utils/cn";
import { categoryApi } from "@/services/api";
import type {
  CategoryApiModel,
  CategoryFormValues,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types/api";

const DEFAULT_FORM: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  image: "",
  sortOrder: 0,
  isActive: true,
};

export default function CategoryPage() {
  const { setError: setErrorStatus, setSuccess } = useUIStore();

  const [categories, setCategories] = useState<CategoryApiModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeChangingId, setActiveChangingId] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryApiModel | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryApiModel | null>(null);
  const [formData, setFormData] = useState<CategoryFormValues>(DEFAULT_FORM);

  const isEditMode = editingCategory !== null;

  const loadCategories = useCallback(async () => {
    setIsTableLoading(true);

    try {
      const response = await categoryApi.list({
        keyword: searchQuery.trim() || undefined,
        page: 1,
        limit: 100,
        sortBy: "sortOrder",
        sortOrder: "asc",
      });
      setCategories(response.items);
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể tải danh mục",
      );
    } finally {
      setIsTableLoading(false);
    }
  }, [searchQuery, setErrorStatus]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      ...DEFAULT_FORM,
      sortOrder: categories.length,
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (category: CategoryApiModel) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingCategory(null);
    setFormData(DEFAULT_FORM);
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: toSlug(name),
    }));
  };

  const handleSave = async () => {
    const name = formData.name.trim();
    const slug = formData.slug.trim() || toSlug(name);

    if (!name) {
      setErrorStatus("Vui lòng nhập tên danh mục");
      return;
    }

    if (!slug) {
      setErrorStatus("Không thể tạo slug, vui lòng kiểm tra lại tên danh mục");
      return;
    }

    setIsSaving(true);

    try {
      if (editingCategory) {
        const updatePayload: UpdateCategoryRequest = {
          name,
          slug,
          description: formData.description.trim() || undefined,
          image: formData.image.trim() || undefined,
          sortOrder: Math.max(0, formData.sortOrder),
        };

        const updatedCategory = await categoryApi.update(
          editingCategory.id,
          updatePayload,
        );

        if (formData.isActive !== updatedCategory.isActive) {
          await categoryApi.setActive(updatedCategory.id, {
            isActive: formData.isActive,
          });
        }

        setSuccess("Cập nhật danh mục thành công");
      } else {
        const createPayload: CreateCategoryRequest = {
          name,
          slug,
          description: formData.description.trim() || undefined,
          image: formData.image.trim() || undefined,
          sortOrder: Math.max(0, formData.sortOrder),
          isActive: formData.isActive,
        };

        await categoryApi.create(createPayload);
        setSuccess("Tạo danh mục thành công");
      }

      closeFormModal();
      await loadCategories();
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể lưu danh mục",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) {
      return;
    }

    setIsDeleting(true);

    try {
      await categoryApi.delete(deletingCategory.id);
      setSuccess("Xóa danh mục thành công");
      setDeletingCategory(null);
      await loadCategories();
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể xóa danh mục",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (category: CategoryApiModel) => {
    setActiveChangingId(category.id);

    try {
      const updatedCategory = await categoryApi.setActive(category.id, {
        isActive: !category.isActive,
      });

      setCategories((prev) =>
        prev.map((item) =>
          item.id === updatedCategory.id ? updatedCategory : item,
        ),
      );

      setSuccess(
        updatedCategory.isActive
          ? "Đã kích hoạt danh mục"
          : "Đã tạm dừng danh mục",
      );
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái",
      );
    } finally {
      setActiveChangingId(null);
    }
  };

  const columns: Column<CategoryApiModel>[] = useMemo(
    () => [
      {
        key: "sortOrder",
        label: "STT",
        render: (cat) => (
          <span className="font-semibold">#{cat.sortOrder}</span>
        ),
        className: "w-20",
      },
      {
        key: "name",
        label: "Tên Danh Mục",
        render: (cat) => (
          <div>
            <p className="font-medium text-brand-brown">{cat.name}</p>
            {cat.description && (
              <p className="text-xs text-brand-gray-500 mt-0.5">
                {cat.description}
              </p>
            )}
          </div>
        ),
      },
      {
        key: "slug",
        label: "Slug",
        render: (cat) => (
          <code className="px-2 py-1 bg-brand-gray-100 rounded text-xs">
            {cat.slug}
          </code>
        ),
      },
      {
        key: "createdAt",
        label: "Ngày Tạo",
        render: (cat) => formatDate(cat.createdAt),
      },
      {
        key: "isActive",
        label: "Trạng Thái",
        render: (cat) => (
          <Badge variant={cat.isActive ? "success" : "danger"} size="sm">
            {cat.isActive ? "Hoạt động" : "Tạm dừng"}
          </Badge>
        ),
      },
    ],
    [],
  );

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-2">
              Quản Lý Danh Mục
            </h1>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={20} />}
            onClick={openCreateModal}
          >
            Thêm Danh Mục
          </Button>
        </div>

        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
          <Input
            placeholder="Tìm kiếm theo tên, slug, mô tả..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <DataTable
          columns={columns}
          data={categories}
          isLoading={isTableLoading}
          actions={(category) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditModal(category)}
                leftIcon={<Edit size={16} />}
              >
                Sửa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleToggleActive(category)}
                isLoading={activeChangingId === category.id}
              >
                {category.isActive ? "Tạm dừng" : "Kích hoạt"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingCategory(category)}
                className="text-brand-danger hover:text-brand-danger"
                leftIcon={<Trash2 size={16} />}
              >
                Xóa
              </Button>
            </>
          )}
          emptyState={{
            title: "Không tìm thấy danh mục nào",
            description:
              "Thử điều chỉnh từ khóa tìm kiếm hoặc thêm mới danh mục.",
          }}
        />
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={isEditMode ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Mới"}
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
              {isEditMode ? "Cập Nhật" : "Tạo Mới"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tên Danh Mục (bắt buộc)"
            placeholder="Ví dụ: Bún đậu mắm tôm"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            label="Slug (bắt buộc - tự động sinh)"
            placeholder="bun-dau"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: toSlug(e.target.value) }))
            }
            helperText="Slug sẽ được tự động tạo dựa trên tên nếu để trống. Chỉ chứa chữ thường, số và dấu gạch ngang."
            required
          />

          <Input
            label="Mô tả"
            placeholder="Nhập mô tả (không bắt buộc)"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />

          <Input
            label="Image URL"
            placeholder="https://... (không bắt buộc)"
            value={formData.image}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, image: e.target.value }))
            }
          />

          <Input
            label="Thứ tự sắp xếp"
            type="number"
            min="0"
            value={formData.sortOrder.toString()}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sortOrder: Number.parseInt(e.target.value, 10) || 0,
              }))
            }
          />

          <label className="flex items-center gap-2 text-sm text-brand-gray-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            {isEditMode ? "Trạng thái danh mục" : "Kích hoạt ngay sau khi tạo"}
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deletingCategory !== null}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => void handleDelete()}
        title="Xóa Danh Mục"
        message={`Bạn có chắc muốn xóa danh mục \"${deletingCategory?.name ?? ""}\"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
