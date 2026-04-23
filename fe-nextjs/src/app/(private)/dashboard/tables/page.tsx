"use client";

import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Button } from '../../../components/shared/Button';
import { Input } from '../../../components/shared/Input';
import { Modal } from '../../../components/shared/Modal';
import { Badge } from '../../../components/shared/Badge';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { mockTables } from '../../../../services/mock-data';
import type { Table } from '../../../../types';
import { TableStatus } from '../../../../types';

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [deletingTable, setDeletingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({ number: '', seats: 4 });

  const getStatusBadge = (status: TableStatus) => {
    const config = {
      [TableStatus.AVAILABLE]: { variant: 'success' as const, label: 'Còn trống' },
      [TableStatus.OCCUPIED]: { variant: 'danger' as const, label: 'Đang sử dụng' },
      [TableStatus.RESERVED]: { variant: 'warning' as const, label: 'Đã đặt' },
      [TableStatus.CLEANING]: { variant: 'info' as const, label: 'Đang dọn' },
    };
    return config[status];
  };

  const handleSave = () => {
    if (!formData.number) return;

    if (editingTable) {
      setTables(
        tables.map((table) =>
          table.id === editingTable.id
            ? { ...table, ...formData, updatedAt: new Date().toISOString() }
            : table
        )
      );
      setEditingTable(null);
    } else {
      const newTable: Table = {
        id: `table-${Date.now()}`,
        ...formData,
        status: TableStatus.AVAILABLE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTables([...tables, newTable]);
      setIsCreateModalOpen(false);
    }

    setFormData({ number: '', seats: 4 });
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-2">
              Quản Lý Bàn Ăn
            </h1>
            <p className="text-brand-gray-600">Quản lý trạng thái và thông tin bàn ăn</p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus size={20} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Thêm Bàn
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => {
            const badge = getStatusBadge(table.status);
            return (
              <div
                key={table.id}
                className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 hover:shadow-[var(--shadow-hover)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-brand-brown mb-1">
                      {table.number}
                    </h3>
                    <p className="text-sm text-brand-gray-600">{table.seats} chỗ ngồi</p>
                  </div>
                  <Badge variant={badge.variant} size="sm">
                    {badge.label}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingTable(table);
                      setFormData({ number: table.number, seats: table.seats });
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
      </div>

      <Modal
        isOpen={isCreateModalOpen || editingTable !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTable(null);
          setFormData({ number: '', seats: 4 });
        }}
        title={editingTable ? 'Sửa Bàn Ăn' : 'Thêm Bàn Ăn Mới'}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingTable(null);
              }}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!formData.number}>
              {editingTable ? 'Cập Nhật' : 'Tạo Mới'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Số Bàn"
            placeholder="Nhập số bàn (VD: B01)"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            required
          />
          <Input
            label="Số Chỗ Ngồi"
            type="number"
            min="1"
            value={formData.seats.toString()}
            onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 1 })}
            required
          />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deletingTable !== null}
        onClose={() => setDeletingTable(null)}
        onConfirm={() => {
          if (deletingTable) {
            setTables(tables.filter((t) => t.id !== deletingTable.id));
            setDeletingTable(null);
          }
        }}
        title="Xóa Bàn Ăn"
        message={`Bạn có chắc chắn muốn xóa bàn "${deletingTable?.number}"?`}
        confirmText="Xóa"
        variant="danger"
      />
    </DashboardLayout>
  );
}
