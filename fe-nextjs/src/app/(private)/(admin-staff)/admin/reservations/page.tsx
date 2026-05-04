// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import { Calendar, RefreshCw } from "lucide-react";
// import { Badge } from "@/app/components/shared/Badge";
// import { DataTable, Column } from "@/app/components/shared/DataTable";
// import { Button } from "@/app/components/shared/Button";
// import { ConfirmDialog } from "@/app/components/shared/ConfirmDialog";
// import { reservationApi } from "@/services/api";
// import type {
//   ReservationApiModel,
//   ReservationStatusApi,
// } from "@/types/api";

// function formatDateTime(value: string) {
//   return new Date(value).toLocaleDateString("vi-VN", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// const STATUS_CONFIG: Record<
//   ReservationStatusApi,
//   { variant: "warning" | "info" | "success" | "danger" | "default"; label: string }
// > = {
//   PENDING: { variant: "warning", label: "Chờ xác nhận" },
//   CONFIRMED: { variant: "info", label: "Đã xác nhận" },
//   CANCELED: { variant: "danger", label: "Đã hủy" },
//   COMPLETED: { variant: "success", label: "Hoàn thành" },
//   NO_SHOW: { variant: "danger", label: "Không đến" },
// };

// const STATUS_TRANSITIONS: Record<ReservationStatusApi, { value: ReservationStatusApi; label: string }[]> = {
//   PENDING: [
//     { value: "CONFIRMED", label: "Xác nhận" },
//     { value: "CANCELED", label: "Hủy bỏ" },
//   ],
//   CONFIRMED: [
//     { value: "COMPLETED", label: "Hoàn thành" },
//     { value: "NO_SHOW", label: "Không đến" },
//     { value: "CANCELED", label: "Hủy bỏ" },
//   ],
//   COMPLETED: [],
//   CANCELED: [],
//   NO_SHOW: [],
// };

// export default function ReservationsPage() {
//   const [reservations, setReservations] = useState<ReservationApiModel[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [dateFilter, setDateFilter] = useState(() => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   });
//   const [statusFilter, setStatusFilter] = useState<ReservationStatusApi | "">("");
//   const [statusModal, setStatusModal] = useState<{
//     reservation: ReservationApiModel;
//     newStatus: ReservationStatusApi;
//   } | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const fetchReservations = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const result = await reservationApi.list({
//         date: dateFilter || undefined,
//         status: statusFilter || undefined,
//         limit: 100,
//       });
//       setReservations(result.items);
//     } catch {
//       setError("Không thể tải danh sách đặt bàn.");
//     } finally {
//       setIsLoading(false);
//     }
//   }, [dateFilter, statusFilter]);

//   useEffect(() => {
//     void fetchReservations();
//   }, [fetchReservations]);

//   const handleUpdateStatus = async () => {
//     if (!statusModal) return;
//     setIsSubmitting(true);
//     try {
//       await reservationApi.updateStatus(statusModal.reservation.id, {
//         status: statusModal.newStatus,
//       });
//       setStatusModal(null);
//       await fetchReservations();
//     } catch {
//       setError("Cập nhật trạng thái thất bại.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const columns: Column<ReservationApiModel>[] = [
//     {
//       key: "table",
//       label: "Bàn",
//       render: (r) => (
//         <span className="font-bold text-brand-brown text-lg">
//           {r.tableNumber}
//         </span>
//       ),
//     },
//     {
//       key: "guest",
//       label: "Khách hàng",
//       render: (r) => (
//         <div>
//           <p className="font-medium text-brand-brown">{r.guestName}</p>
//           <p className="text-sm text-brand-gray-500">{r.guestPhone}</p>
//         </div>
//       ),
//     },
//     {
//       key: "partySize",
//       label: "Số người",
//       render: (r) => <span>{r.partySize} người</span>,
//     },
//     {
//       key: "scheduledAt",
//       label: "Thời gian đặt",
//       render: (r) => (
//         <span className="text-sm">{formatDateTime(r.scheduledAt)}</span>
//       ),
//     },
//     {
//       key: "note",
//       label: "Ghi chú",
//       render: (r) => (
//         <span className="text-sm text-brand-gray-600 italic">
//           {r.note || "—"}
//         </span>
//       ),
//     },
//     {
//       key: "status",
//       label: "Trạng thái",
//       render: (r) => {
//         const cfg = STATUS_CONFIG[r.status];
//         return (
//           <Badge variant={cfg.variant} size="sm">
//             {cfg.label}
//           </Badge>
//         );
//       },
//     },
//   ];

//   const getNewStatusLabel = (status: ReservationStatusApi) =>
//     STATUS_CONFIG[status]?.label || status;

//   return (
//     <div className="p-4 lg:p-6 space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl lg:text-3xl font-bold text-brand-brown mb-2">
//             Quản Lý Đặt Bàn
//           </h1>
//           <p className="text-brand-gray-600">
//             Xem và xác nhận lịch đặt bàn của khách
//           </p>
//         </div>
//         <Button
//           variant="outline"
//           leftIcon={<RefreshCw size={16} />}
//           onClick={fetchReservations}
//           disabled={isLoading}
//         >
//           Làm mới
//         </Button>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
//           <span>{error}</span>
//           <button onClick={() => setError(null)} className="underline ml-2">
//             Đóng
//           </button>
//         </div>
//       )}

//       {/* Filters */}
//       <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4 flex flex-wrap gap-4 items-end">
//         <div className="flex flex-col gap-1">
//           <label className="text-sm font-medium text-brand-brown flex items-center gap-1">
//             <Calendar size={14} /> Ngày
//           </label>
//           <input
//             type="date"
//             value={dateFilter}
//             onChange={(e) => setDateFilter(e.target.value)}
//             className="border border-brand-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
//           />
//         </div>
//         <div className="flex flex-col gap-1">
//           <label className="text-sm font-medium text-brand-brown">
//             Trạng thái
//           </label>
//           <select
//             value={statusFilter}
//             onChange={(e) =>
//               setStatusFilter(e.target.value as ReservationStatusApi | "")
//             }
//             className="border border-brand-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-amber"
//           >
//             <option value="">Tất cả</option>
//             {(Object.keys(STATUS_CONFIG) as ReservationStatusApi[]).map(
//               (s) => (
//                 <option key={s} value={s}>
//                   {STATUS_CONFIG[s].label}
//                 </option>
//               ),
//             )}
//           </select>
//         </div>
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={() => {
//             setDateFilter("");
//             setStatusFilter("");
//           }}
//         >
//           Xóa bộ lọc
//         </Button>
//       </div>

//       {isLoading ? (
//         <div className="py-8 text-center text-brand-brown">
//           Đang tải danh sách đặt bàn...
//         </div>
//       ) : (
//         <DataTable
//           columns={columns}
//           data={reservations}
//           actions={(r) => {
//             const transitions = STATUS_TRANSITIONS[r.status];
//             if (transitions.length === 0) return null;
//             return (
//               <div className="flex gap-1">
//                 {transitions.map((t) => (
//                   <Button
//                     key={t.value}
//                     variant={t.value === "CANCELED" ? "ghost" : "outline"}
//                     size="sm"
//                     className={
//                       t.value === "CANCELED" ? "text-brand-danger" : ""
//                     }
//                     onClick={() =>
//                       setStatusModal({ reservation: r, newStatus: t.value })
//                     }
//                   >
//                     {t.label}
//                   </Button>
//                 ))}
//               </div>
//             );
//           }}
//           emptyState={{
//             title: "Không có đặt bàn nào",
//             description: "Thử thay đổi bộ lọc ngày hoặc trạng thái",
//           }}
//         />
//       )}

//       {statusModal && (
//         <ConfirmDialog
//           isOpen={true}
//           title="Xác nhận thay đổi trạng thái"
//           message={`Bạn có chắc muốn đặt trạng thái thành "${getNewStatusLabel(statusModal.newStatus)}" cho đặt bàn của khách "${statusModal.reservation.guestName}"?`}
//           confirmText={isSubmitting ? "Đang lưu..." : "Xác nhận"}
//           cancelText="Hủy"
//           onConfirm={handleUpdateStatus}
//           onClose={() => setStatusModal(null)}
//           variant={statusModal.newStatus === "CANCELED" ? "danger" : "warning"}
//         />
//       )}
//     </div>
//   );
// }

export default function ReservationPage() {
  return <div>Quản lý đặt bàn</div>;
}

