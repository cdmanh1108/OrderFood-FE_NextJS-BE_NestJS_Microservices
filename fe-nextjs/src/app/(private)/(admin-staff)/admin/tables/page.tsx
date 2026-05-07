"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/app/components/shared/Button";
import { Input } from "@/app/components/shared/Input";
import { Modal } from "@/app/components/shared/Modal";
import { Badge } from "@/app/components/shared/Badge";
import { ConfirmDialog } from "@/app/components/shared/ConfirmDialog";
import { tableApi } from "@/services/api";
import type { TableApiModel, UpdateTableRequest } from "@/types/api";
import { TableStatusApi } from "@/types/api";

export default function TablesPage() {
  const [tables, setTables] = useState<TableApiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableApiModel | null>(null);
  const [deletingTable, setDeletingTable] = useState<TableApiModel | null>(
    null,
  );
  const [createdQrCode, setCreatedQrCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({ number: "", seats: 4, note: "" });

  const fetchTables = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await tableApi.list({ limit: 200 });
      setTables(result.items);
    } catch {
      setError("Không thể tải danh sách bàn. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const getStatusBadge = (status: TableStatusApi) => {
    const config = {
      [TableStatusApi.AVAILABLE]: {
        variant: "success" as const,
        label: "Còn trống",
      },
      [TableStatusApi.OCCUPIED]: {
        variant: "danger" as const,
        label: "Đang sử dụng",
      },
      [TableStatusApi.RESERVED]: {
        variant: "warning" as const,
        label: "Đã đặt",
      },
      [TableStatusApi.CLEANING]: {
        variant: "info" as const,
        label: "Đang dọn",
      },
    };
    return config[status];
  };

  const handleSave = async () => {
    if (!formData.number) return;
    setIsSubmitting(true);
    try {
      if (editingTable) {
        const payload: UpdateTableRequest = {
          number: formData.number,
          seats: formData.seats,
          note: formData.note || undefined,
        };
        const updated = await tableApi.update(editingTable.id, payload);
        setTables((prev) =>
          prev.map((t) => (t.id === editingTable.id ? updated : t)),
        );
        setEditingTable(null);
      } else {
        const created = await tableApi.create({
          number: formData.number,
          seats: formData.seats,
          note: formData.note || undefined,
        });
        setTables((prev) => [...prev, created]);
        setIsCreateModalOpen(false);
        if (created.qrCode) {
          setCreatedQrCode(created.qrCode);
        }
      }
      setFormData({ number: "", seats: 4, note: "" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Đã có lỗi xảy ra. Thử lại.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTable) return;
    setIsSubmitting(true);
    try {
      await tableApi.delete(deletingTable.id);
      setTables((prev) => prev.filter((t) => t.id !== deletingTable.id));
      setDeletingTable(null);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Không thể xóa bàn. Thử lại.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-2">
              Quản Lý Bàn Ăn
            </h1>
            <p className="text-brand-gray-600">
              Quản lý trạng thái và thông tin bàn ăn
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              leftIcon={<RefreshCw size={16} />}
              onClick={fetchTables}
              disabled={isLoading}
            >
              Làm mới
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus size={20} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Thêm Bàn
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline"
            >
              Đóng
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 animate-pulse"
              >
                <div className="h-8 bg-gray-200 rounded mb-2 w-16" />
                <div className="h-4 bg-gray-100 rounded mb-4 w-24" />
                <div className="h-8 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-16 text-brand-gray-600">
            <p className="text-lg">Chưa có bàn nào được tạo.</p>
            <Button
              variant="primary"
              className="mt-4"
              leftIcon={<Plus size={16} />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Thêm bàn đầu tiên
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((table) => {
              const badge = getStatusBadge(table.status);
              return (
                <div
                  key={table.id}
                  className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 hover:shadow-[var(--shadow-hover)] transition-all"
                >
                  <Link
                    href={`/admin/tables/${table.id}`}
                    className="mb-4 block"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-brand-brown mb-1">
                          {table.number}
                        </h3>
                        <p className="text-sm text-brand-gray-600">
                          {table.seats} chỗ ngồi
                        </p>
                        {table.note && (
                          <p className="text-xs text-brand-gray-500 italic mt-0.5">
                            📍 {table.note}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge variant={badge.variant} size="sm">
                          {badge.label}
                        </Badge>
                        <span className="flex items-center gap-0.5 text-xs text-brand-amber">
                          <ExternalLink size={11} />
                          Chi tiết
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingTable(table);
                        setFormData({
                          number: table.number,
                          seats: table.seats,
                          note: table.note ?? "",
                        });
                      }}
                      leftIcon={<Edit size={14} />}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingTable(table)}
                      className="text-brand-danger"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen || editingTable !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTable(null);
          setFormData({ number: "", seats: 4, note: "" });
        }}
        title={editingTable ? "Sửa Bàn Ăn" : "Thêm Bàn Ăn Mới"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingTable(null);
              }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!formData.number || isSubmitting}
            >
              {isSubmitting
                ? "Đang lưu..."
                : editingTable
                  ? "Cập Nhật"
                  : "Tạo Mới"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Số Bàn"
            placeholder="Nhập số bàn (VD: B01)"
            value={formData.number}
            onChange={(e) =>
              setFormData({ ...formData, number: e.target.value })
            }
            required
          />
          <Input
            label="Số Chỗ Ngồi"
            type="number"
            min="1"
            value={formData.seats.toString()}
            onChange={(e) =>
              setFormData({
                ...formData,
                seats: parseInt(e.target.value) || 1,
              })
            }
            required
          />
          <Input
            label="Ghi chú vị trí"
            placeholder="VD: Tầng 1, góc cửa sổ"
            value={formData.note}
            onChange={(e) =>
              setFormData({ ...formData, note: e.target.value })
            }
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deletingTable !== null}
        onClose={() => setDeletingTable(null)}
        onConfirm={handleDelete}
        title="Xóa Bàn Ăn"
        message={`Bạn có chắc chắn muốn xóa bàn "${deletingTable?.number}"?`}
        confirmText={isSubmitting ? "Đang xóa..." : "Xóa"}
        variant="danger"
      />

      {/* QR Code Result Modal */}
      <Modal
        isOpen={createdQrCode !== null}
        onClose={() => setCreatedQrCode(null)}
        title="Bàn đã được tạo thành công!"
        footer={
          <Button
            variant="primary"
            onClick={() => setCreatedQrCode(null)}
          >
            Đã lưu, đóng lại
          </Button>
        }
      >
        <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
          <p className="text-brand-gray-600 font-medium">
            Hãy <span className="font-bold text-brand-amber">lưu ngay hình ảnh QR Code này</span> lại nhé. Nó sẽ không hiển thị lại ở bất kỳ đâu để đảm bảo tính duy nhất!
          </p>
          {createdQrCode && (
            <div className="bg-white p-4 border border-brand-beige rounded-2xl shadow-sm">
              <Image src={createdQrCode} alt="QR Code" width={256} height={256} className="object-contain" unoptimized />
            </div>
          )}
          <p className="text-sm text-brand-gray-500">
            (Chuột phải vào ảnh chọn &quot;Lưu hình ảnh dưới dạng...&quot; để tải về máy)
          </p>
        </div>
      </Modal>
    </>
  );
}
