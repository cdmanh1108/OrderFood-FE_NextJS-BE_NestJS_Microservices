"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/app/components/shared/Button";
import { Input } from "@/app/components/shared/Input";
import { Modal } from "@/app/components/shared/Modal";
import { Badge } from "@/app/components/shared/Badge";
import { DataTable, Column } from "@/app/components/shared/DataTable";
import { ConfirmDialog } from "@/app/components/shared/ConfirmDialog";
import { useUIStore } from "@/stores/ui-store";
import { formatCurrency, toSlug } from "@/utils/cn";
import { resolveImageContentType } from "../../../../../utils/media";
import { categoryApi, mediaApi, menuItemApi } from "@/services/api";
import {
  MenuItemApiModel,
  SUPPORTED_IMAGE_TYPES,
  type CategoryApiModel,
  type CreateMenuItemRequest,
  type UpdateMenuItemRequest,
} from "@/types/api";

type MenuItemFormState = {
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  sku: string;
  sortOrder: number;
  categoryId: string;
  isAvailable: boolean;
  isActive: boolean;
};

const DEFAULT_FORM: MenuItemFormState = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  image: "",
  sku: "",
  sortOrder: 0,
  categoryId: "",
  isAvailable: true,
  isActive: true,
};

export default function MenuItemPage() {
  const { setError: setErrorStatus, setSuccess } = useUIStore();

  const [menuItems, setMenuItems] = useState<MenuItemApiModel[]>([]);
  const [categories, setCategories] = useState<CategoryApiModel[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeChangingId, setActiveChangingId] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemApiModel | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItemApiModel | null>(
    null,
  );
  const [formData, setFormData] = useState<MenuItemFormState>(DEFAULT_FORM);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const isEditMode = editingItem !== null;

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categories]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await categoryApi.list({
        page: 1,
        limit: 100,
        sortBy: "sortOrder",
        sortOrder: "asc",
      });
      setCategories(response.items);
      return response.items;
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể tải danh sách danh mục",
      );
      return [] as CategoryApiModel[];
    }
  }, [setErrorStatus]);

  const loadMenuItems = useCallback(async () => {
    setIsTableLoading(true);

    try {
      const response = await menuItemApi.list({
        keyword: searchQuery.trim() || undefined,
        page: 1,
        limit: 100,
        sortBy: "sortOrder",
        sortOrder: "asc",
      });
      setMenuItems(response.items);
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể tải danh sách món ăn",
      );
    } finally {
      setIsTableLoading(false);
    }
  }, [searchQuery, setErrorStatus]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMenuItems();
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadMenuItems]);

  const openCreateModal = async () => {
    let nextCategories = categories;
    if (nextCategories.length === 0) {
      nextCategories = await loadCategories();
    }

    setEditingItem(null);
    setFormData({
      ...DEFAULT_FORM,
      categoryId: nextCategories[0]?.id ?? "",
      sortOrder: menuItems.length,
      isAvailable: true,
      isActive: true,
    });
    setImagePreviewUrl("");
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: MenuItemApiModel) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      price: item.price,
      image: item.image ?? "",
      sku: item.sku ?? "",
      sortOrder: item.sortOrder,
      categoryId: item.categoryId,
      isAvailable: item.isAvailable,
      isActive: item.isActive,
    });
    setImagePreviewUrl(item.image ?? "");
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingItem(null);
    setFormData(DEFAULT_FORM);
    setImagePreviewUrl("");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: toSlug(name),
    }));
  };

  const handleImageUpload = async (file: File) => {
    const contentType = resolveImageContentType(file);

    if (!contentType) {
      setErrorStatus("Chỉ hỗ trợ upload image jpeg, jpg, png, webp");
      return;
    }

    setIsUploadingImage(true);

    try {
      const presigned = await mediaApi.createUploadUrl({
        fileName: file.name,
        contentType,
        folder: "menu-items",
      });

      const uploadResponse = await fetch(presigned.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload file to S3 failed");
      }

      setFormData((prev) => ({
        ...prev,
        image: presigned.key,
      }));
      setImagePreviewUrl(presigned.publicUrl);

      setSuccess("Upload ảnh thành công");
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể upload ảnh",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    const name = formData.name.trim();
    const slug = formData.slug.trim() || toSlug(name);

    if (!name) {
      setErrorStatus("Vui lòng nhập tên món ăn");
      return;
    }

    if (!slug) {
      setErrorStatus("Vui lòng kiểm tra lại slug");
      return;
    }

    if (!formData.categoryId) {
      setErrorStatus("Vui lòng chọn danh mục cho món ăn");
      return;
    }

    if (formData.price < 0) {
      setErrorStatus("Giá phải lớn hơn hoặc bằng 0");
      return;
    }

    setIsSaving(true);

    try {
      if (editingItem) {
        const updatePayload: UpdateMenuItemRequest = {
          name,
          slug,
          description: formData.description.trim() || undefined,
          categoryId: formData.categoryId,
          price: formData.price,
          image: formData.image.trim() || undefined,
          sku: formData.sku.trim() || undefined,
          isAvailable: formData.isAvailable,
          sortOrder: Math.max(0, formData.sortOrder),
        };

        const updated = await menuItemApi.update(editingItem.id, updatePayload);

        if (formData.isActive !== updated.isActive) {
          await menuItemApi.setActive(updated.id, {
            isActive: formData.isActive,
          });
        }

        setSuccess("Cập nhật món ăn thành công");
      } else {
        const createPayload: CreateMenuItemRequest = {
          name,
          slug,
          description: formData.description.trim() || undefined,
          categoryId: formData.categoryId,
          price: formData.price,
          image: formData.image.trim() || undefined,
          sku: formData.sku.trim() || undefined,
          isAvailable: formData.isAvailable,
          isActive: formData.isActive,
          sortOrder: Math.max(0, formData.sortOrder),
        };

        await menuItemApi.create(createPayload);
        setSuccess("Tạo món ăn thành công");
      }

      closeFormModal();
      await loadMenuItems();
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể lưu món ăn",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item: MenuItemApiModel) => {
    setActiveChangingId(item.id);

    try {
      const updated = await menuItemApi.setActive(item.id, {
        isActive: !item.isActive,
      });

      setMenuItems((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
      setSuccess(updated.isActive ? "Đã kích hoạt món" : "Đã tạm dừng món");
    } catch (err) {
      setErrorStatus(
        err instanceof Error
          ? err.message
          : "Không thể cập nhật trạng thái món ăn",
      );
    } finally {
      setActiveChangingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) {
      return;
    }

    setIsDeleting(true);

    try {
      await menuItemApi.delete(deletingItem.id);
      setSuccess("Xóa món ăn thành công");
      setDeletingItem(null);
      await loadMenuItems();
    } catch (err) {
      setErrorStatus(
        err instanceof Error ? err.message : "Không thể xóa món ăn",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<MenuItemApiModel>[] = useMemo(
    () => [
      {
        key: "image",
        label: "Ảnh",
        className: "w-24",
        render: (item) =>
          item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              width={48}
              height={48}
              unoptimized
              className="h-12 w-12 rounded-lg object-cover border border-brand-gray-200"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-brand-gray-100 border border-brand-gray-200 flex items-center justify-center text-xs text-brand-gray-500">
              N/A
            </div>
          ),
      },
      {
        key: "name",
        label: "Tên Món",
        render: (item) => (
          <div>
            <p className="font-medium text-brand-brown">{item.name}</p>
            <p className="text-xs text-brand-gray-500">{item.slug}</p>
          </div>
        ),
      },
      {
        key: "category",
        label: "Danh mục",
        render: (item) => categoryNameMap.get(item.categoryId) ?? "N/A",
      },
      {
        key: "price",
        label: "Giá",
        render: (item) => (
          <span className="font-semibold text-brand-brown">
            {formatCurrency(item.price)}
          </span>
        ),
      },
      {
        key: "isAvailable",
        label: "Trạng Thái",
        render: (item) => (
          <Badge variant={item.isAvailable ? "success" : "warning"} size="sm">
            {item.isAvailable ? "Còn món" : "Hết món"}
          </Badge>
        ),
      },
      {
        key: "isActive",
        label: "Kích Hoạt",
        render: (item) => (
          <Badge variant={item.isActive ? "success" : "danger"} size="sm">
            {item.isActive ? "Kích hoạt" : "Không kích hoạt"}
          </Badge>
        ),
      },
    ],
    [categoryNameMap],
  );

  return (
    <>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-2">
              Quản lý món ăn
            </h1>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={20} />}
            onClick={() => void openCreateModal()}
          >
            Thêm Món Ăn
          </Button>
        </div>

        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4">
          <Input
            placeholder="Tìm kiếm theo tên món, slug, sku..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>

        <DataTable
          columns={columns}
          data={menuItems}
          isLoading={isTableLoading}
          actions={(item) => (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditModal(item)}
                leftIcon={<Edit size={16} />}
              >
                Sửa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleToggleActive(item)}
                isLoading={activeChangingId === item.id}
              >
                {item.isActive ? "Tạm dừng" : "Kích hoạt"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeletingItem(item)}
                className="text-brand-danger hover:text-brand-danger"
                leftIcon={<Trash2 size={16} />}
              >
                Xóa
              </Button>
            </>
          )}
          emptyState={{
            title: "Không tìm thấy món ăn",
            description: "Thử lại từ khóa tìm kiếm hoặc tạo món mới",
          }}
        />
      </div>

      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={isEditMode ? "Cập Nhật Món Ăn" : "Thêm Món Ăn Mới"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeFormModal}
              disabled={isSaving || isUploadingImage}
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
            label="Tên Món Ăn"
            placeholder="Ví dụ: Bún Đậu Đặc Biệt"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <Input
            label="Slug (bắt buộc - tự động sinh)"
            placeholder="bun-dau-dac-biet"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: toSlug(e.target.value) }))
            }
            required
          />

          <div>
            <label className="block mb-2 text-brand-gray-700">
              Danh mục (bắt buộc)
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              className="w-full px-4 py-2.5 bg-white border border-brand-gray-200 rounded-[var(--radius-input)] text-brand-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
            >
              <option value="" disabled>
                Chọn danh mục
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="menu-item-description"
              className="block mb-2 text-brand-gray-700"
            >
              Mô tả
            </label>
            <textarea
              id="menu-item-description"
              rows={3}
              placeholder="Nhập mô tả (không bắt buộc)"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 bg-white border border-brand-gray-200 rounded-[var(--radius-input)] text-brand-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent resize-none"
            />
          </div>

          <Input
            label="Giá (VND)"
            type="number"
            min="0"
            step="1000"
            value={formData.price.toString()}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                price: Number.parseInt(e.target.value, 10) || 0,
              }))
            }
            required
          />

          <Input
            label="SKU"
            placeholder="MENU-001 (không bắt buộc)"
            value={formData.sku}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, sku: e.target.value }))
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

          <div className="space-y-2">
            <label className="block text-brand-gray-700">
              Hình ảnh món ăn (upload S3)
            </label>
            <input
              type="file"
              accept={SUPPORTED_IMAGE_TYPES.join(",")}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleImageUpload(file);
                }
              }}
              className="block w-full text-sm text-brand-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-brand-beige file:text-brand-brown hover:file:bg-brand-yellow"
            />
            {isUploadingImage && (
              <p className="text-sm text-brand-gray-500">Đang upload ảnh...</p>
            )}
            {imagePreviewUrl && (
              <div className="flex items-center gap-3">
                <Image
                  src={imagePreviewUrl}
                  alt="Preview"
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 rounded-lg object-cover border border-brand-gray-200"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, image: "" }));
                    setImagePreviewUrl("");
                  }}
                  disabled={isUploadingImage}
                >
                  Xóa ảnh
                </Button>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-brand-gray-700">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isAvailable: e.target.checked,
                }))
              }
            />
            Trạng thái còn món
          </label>

          <label className="flex items-center gap-2 text-sm text-brand-gray-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Kích hoạt món ăn
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deletingItem !== null}
        onClose={() => setDeletingItem(null)}
        onConfirm={() => void handleDelete()}
        title="Xóa Món Ăn"
        message={`Bạn có chắc muốn xóa món \"${deletingItem?.name ?? ""}\"?`}
        confirmText="Xóa"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
