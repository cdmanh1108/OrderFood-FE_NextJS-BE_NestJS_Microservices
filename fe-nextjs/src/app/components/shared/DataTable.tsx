import React from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  emptyState?: {
    title: string;
    description?: string;
  };
  isLoading?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  actions,
  emptyState,
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-brand-gray-50 px-6 py-4 border-b border-brand-gray-200">
            <div className="h-4 bg-brand-gray-200 rounded w-1/4" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-brand-gray-100">
              <div className="h-4 bg-brand-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
        <EmptyState
          title={emptyState?.title || 'Không có dữ liệu'}
          description={emptyState?.description}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-brand-gray-50 border-b border-brand-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-semibold text-brand-gray-700 uppercase tracking-wider',
                    column.className
                  )}
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-semibold text-brand-gray-700 uppercase tracking-wider">
                  Thao Tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-brand-gray-50'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-6 py-4 text-sm text-brand-gray-900', column.className)}
                  >
                    {column.render
                      ? column.render(row)
                      : (row as Record<string, unknown>)[column.key]?.toString()}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
