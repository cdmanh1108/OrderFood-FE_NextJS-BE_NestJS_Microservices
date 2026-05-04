"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    QrCode,
    ReceiptText,
    RefreshCw,
    Table2,
    Users,
    Utensils,
    X,
} from "lucide-react";
import { Button } from "@/app/components/shared/Button";
import { Badge } from "@/app/components/shared/Badge";
import { tableApi, sessionApi } from "@/services/api";
import type {
    OrderApiModel,
    TableApiModel,
    TableSessionApiModel,
} from "@/types/api";
import { TableStatusApi } from "@/types/api";
import { formatCurrency, formatDateTime } from "@/utils/cn";

// ─── Thay bằng ảnh QR bank thực của bạn ─────────────────────────────────────
// Ví dụ VietQR: https://img.vietqr.io/image/VCB-1234567890-compact.png
const BANK_QR_URL = "/images/bank-qr.jpg";

// ─── Config maps ──────────────────────────────────────────────────────────────

const TABLE_STATUS_CFG: Record<
    TableStatusApi,
    { variant: "success" | "danger" | "warning" | "info" | "default"; label: string }
> = {
    [TableStatusApi.AVAILABLE]: { variant: "success", label: "Còn trống" },
    [TableStatusApi.OCCUPIED]: { variant: "danger", label: "Đang sử dụng" },
    [TableStatusApi.RESERVED]: { variant: "warning", label: "Đã đặt" },
    [TableStatusApi.CLEANING]: { variant: "info", label: "Đang dọn" },
};

const ORDER_STATUS_CFG: Record<
    OrderApiModel["status"],
    { variant: "success" | "warning" | "danger" | "info" | "default"; label: string }
> = {
    DRAFT: { variant: "default", label: "Nháp" },
    PLACED: { variant: "info", label: "Mới gọi" },
    CONFIRMED: { variant: "info", label: "Đã xác nhận" },
    COMPLETED: { variant: "success", label: "Hoàn thành" },
    CANCELED: { variant: "danger", label: "Đã hủy" },
};

const PAYMENT_LABEL: Record<OrderApiModel["paymentStatus"], string> = {
    UNPAID: "Chưa thanh toán",
    PENDING: "Đang chờ",
    PAID: "Đã thanh toán",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
};

type PaymentMethod = "CASH" | "TRANSFER";

function getOrderTotal(o: OrderApiModel) {
    return o.pricingSnapshot?.grandTotal ?? 0;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTableDetailPage() {
    const router = useRouter();
    const { id: tableId } = useParams<{ id: string }>();

    const [table, setTable] = useState<TableApiModel | null>(null);
    const [activeSession, setActiveSession] = useState<TableSessionApiModel | null>(null);
    const [orders, setOrders] = useState<OrderApiModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Payment modal state
    const [showPayment, setShowPayment] = useState(false);
    const [payMethod, setPayMethod] = useState<PaymentMethod>("CASH");
    const [isPaying, setIsPaying] = useState(false);
    const [payDone, setPayDone] = useState(false);

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const tableData = await tableApi.getById(tableId);
            setTable(tableData);
            const session = await sessionApi.getActiveByTableId(tableId);
            setActiveSession(session);
            if (!session) { setOrders([]); return; }
            const res = await sessionApi.getOrders(session.id);
            setOrders(res.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể tải chi tiết bàn.");
        } finally {
            setIsLoading(false);
        }
    }, [tableId]);

    useEffect(() => { void fetchAll(); }, [fetchAll]);

    const summary = useMemo(() => {
        const totalOrders = orders.length;
        const totalItems = orders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);
        const grandTotal = orders.reduce((s, o) => s + getOrderTotal(o), 0);
        const unpaidTotal = orders.filter(o => o.paymentStatus !== "PAID").reduce((s, o) => s + getOrderTotal(o), 0);
        return { totalOrders, totalItems, grandTotal, unpaidTotal };
    }, [orders]);

    // ── Confirm payment: close session → backend auto-marks all orders PAID ────
    const handleConfirmPayment = async () => {
        if (!activeSession) return;
        setIsPaying(true);
        setError(null);
        try {
            // Map frontend value to backend enum
            const method = payMethod === "TRANSFER" ? "BANK_TRANSFER" : "CASH";
            await sessionApi.close(activeSession.id, method);
            setPayDone(true);
            setTimeout(async () => {
                setShowPayment(false);
                setPayDone(false);
                await fetchAll();
            }, 1800);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi xử lý thanh toán.");
        } finally {
            setIsPaying(false);
        }
    };

    const tableBadge = table ? TABLE_STATUS_CFG[table.status] : null;

    return (
        <div className="space-y-6 p-4 lg:p-6">
            {/* ── Header ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <button type="button" onClick={() => router.back()}
                        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-gray-600 transition hover:text-brand-brown">
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                    <h1 className="text-2xl font-bold text-brand-brown lg:text-3xl">
                        Chi Tiết Bàn {table?.number ?? ""}
                    </h1>
                    <p className="mt-2 text-brand-gray-600">Theo dõi phiên gọi món, đơn hàng và tổng tiền.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" leftIcon={<RefreshCw size={16} />} onClick={fetchAll} disabled={isLoading}>
                        Làm mới
                    </Button>
                    <Link href="/admin/tables"><Button variant="outline">Danh sách bàn</Button></Link>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">Đóng</button>
                </div>
            )}

            {isLoading ? (
                <div className="space-y-6">
                    <div className="h-44 animate-pulse rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-28 animate-pulse rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]" />
                        ))}
                    </div>
                </div>
            ) : (
                <>
                    {/* ── Table info card ── */}
                    <section className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
                        <div className="bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-7 text-white">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Table Detail</p>
                                    <h2 className="mt-2 text-3xl font-bold">{table?.number}</h2>
                                    <p className="mt-2 text-sm text-white/80">
                                        {table?.seats ?? 0} chỗ ngồi{table?.note ? ` · ${table.note}` : ""}
                                    </p>
                                </div>
                                {tableBadge && <Badge variant={tableBadge.variant}>{tableBadge.label}</Badge>}
                            </div>
                        </div>

                        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    icon: <Table2 size={18} />, label: "Phiên bàn",
                                    value: activeSession
                                        ? `Mở lúc ${formatDateTime(activeSession.openedAt ?? activeSession.createdAt)}`
                                        : "Chưa có phiên", small: true
                                },
                                { icon: <ReceiptText size={18} />, label: "Số đơn", value: summary.totalOrders },
                                { icon: <Utensils size={18} />, label: "Tổng món", value: summary.totalItems },
                                {
                                    icon: <CreditCard size={18} />, label: "Tổng tiền",
                                    value: formatCurrency(summary.grandTotal), amber: true
                                },
                            ].map((card, i) => (
                                <div key={i} className="rounded-2xl bg-brand-gray-50 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-brown">
                                        {card.icon}{card.label}
                                    </div>
                                    <p className={`${card.small ? "truncate text-sm text-brand-gray-600" : `text-2xl font-bold ${card.amber ? "text-brand-amber" : "text-brand-brown"}`}`}>
                                        {card.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {!activeSession ? (
                        <div className="rounded-[var(--radius-card)] border border-brand-gray-200 bg-white p-10 text-center shadow-[var(--shadow-card)]">
                            <Users className="mx-auto mb-3 h-12 w-12 text-brand-gray-400" />
                            <h2 className="text-lg font-bold text-brand-brown">Bàn chưa có phiên hoạt động</h2>
                            <p className="mt-1 text-sm text-brand-gray-600">Khi khách quét QR và gọi món, session sẽ hiển thị tại đây.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                            {/* ── Orders list ── */}
                            <section className="space-y-4">
                                <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
                                    <h2 className="text-xl font-bold text-brand-brown">Đơn hàng trong phiên</h2>
                                    <p className="mt-1 text-sm text-brand-gray-600">Danh sách món khách đã gọi tại bàn này.</p>
                                </div>

                                {orders.length === 0 ? (
                                    <div className="rounded-[var(--radius-card)] border border-brand-gray-200 bg-white p-8 text-center text-brand-gray-600">
                                        Chưa có đơn hàng nào trong phiên này.
                                    </div>
                                ) : (
                                    orders.map((order) => {
                                        const sc = ORDER_STATUS_CFG[order.status];
                                        return (
                                            <article key={order.id} className="rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-hover)]">
                                                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-lg font-bold text-brand-brown">Đơn #{order.code}</h3>
                                                            <Badge variant={sc.variant}>{sc.label}</Badge>
                                                        </div>
                                                        <p className="mt-1 flex items-center gap-1.5 text-sm text-brand-gray-600">
                                                            <Clock size={14} />{formatDateTime(order.placedAt ?? order.createdAt)}
                                                        </p>
                                                        <p className="mt-1 text-sm text-brand-gray-500">
                                                            Thanh toán: <span className="font-semibold text-brand-brown">{PAYMENT_LABEL[order.paymentStatus]}</span>
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl bg-brand-beige/60 px-4 py-2 sm:text-right">
                                                        <p className="text-xs text-brand-gray-500">Tổng đơn</p>
                                                        <p className="font-bold text-brand-amber">{formatCurrency(getOrderTotal(order))}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {order.items.map((item, idx) => (
                                                        <div key={item.id ?? idx} className="flex items-center gap-3 rounded-2xl bg-brand-gray-50 p-3">
                                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-beige">
                                                                {item.menuItemImageUrl
                                                                    ? <Image src={item.menuItemImageUrl} alt={item.menuItemName} width={48} height={48} className="h-full w-full object-cover" />
                                                                    : <span className="text-xl">🍽️</span>}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="font-semibold text-brand-brown">{item.menuItemName || "—"}</p>
                                                                {item.note && <p className="mt-0.5 text-xs italic text-brand-gray-500">{item.note}</p>}
                                                            </div>
                                                            <div className="shrink-0 text-right">
                                                                <p className="text-sm font-bold text-brand-brown">x{item.quantity}</p>
                                                                <p className="text-xs text-brand-gray-600">{formatCurrency(item.unitPrice * item.quantity)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {order.note && (
                                                    <div className="mt-4 rounded-2xl border border-brand-amber/10 bg-brand-beige/40 px-4 py-3">
                                                        <p className="text-sm text-brand-gray-600">
                                                            <span className="font-bold text-brand-brown">Ghi chú:</span> {order.note}
                                                        </p>
                                                    </div>
                                                )}
                                            </article>
                                        );
                                    })
                                )}
                            </section>

                            {/* ── Summary sidebar ── */}
                            <aside>
                                <div className="sticky top-24 rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
                                    <h2 className="text-xl font-bold text-brand-brown">Tổng kết phiên</h2>

                                    <div className="mt-5 space-y-3 text-sm">
                                        {[
                                            { label: "Số đơn", value: summary.totalOrders },
                                            { label: "Tổng món", value: summary.totalItems },
                                            { label: "Chưa thanh toán", value: formatCurrency(summary.unpaidTotal) },
                                        ].map(r => (
                                            <div key={r.label} className="flex justify-between text-brand-gray-600">
                                                <span>{r.label}</span><span className="font-semibold">{r.value}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-brand-gray-100 pt-4">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-brand-brown">Tổng tiền</span>
                                                <span className="text-2xl font-bold text-brand-amber">{formatCurrency(summary.grandTotal)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {/* Payment button — primary action */}
                                        <Button
                                            variant="primary"
                                            // fullWidth
                                            disabled={orders.length === 0}
                                            onClick={() => setShowPayment(true)}
                                        >
                                            <span className="inline-flex items-center gap-2">
                                                <CreditCard size={16} /> Thanh toán
                                            </span>
                                        </Button>
                                    </div>

                                    <p className="mt-4 rounded-2xl bg-brand-beige/50 px-4 py-3 text-center text-xs leading-relaxed text-brand-gray-600">
                                        Phiên bàn sẽ tự đóng sau khi xác nhận thanh toán.
                                    </p>
                                </div>
                            </aside>
                        </div>
                    )}
                </>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* Payment Modal                                                       */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {showPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => { if (!isPaying) setShowPayment(false); }}
                    />

                    <div className="relative z-10 w-full max-w-md rounded-[2rem] bg-white shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                            <div>
                                <h3 className="text-lg font-bold text-brand-brown">Thanh toán</h3>
                                <p className="text-sm text-brand-gray-600">
                                    Bàn {table?.number} · {formatCurrency(summary.grandTotal)}
                                </p>
                            </div>
                            {!isPaying && (
                                <button
                                    onClick={() => setShowPayment(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-brand-gray-400 hover:bg-gray-100"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        <div className="p-6">
                            {payDone ? (
                                /* ── Success state ── */
                                <div className="py-6 text-center">
                                    <CheckCircle2 className="mx-auto mb-3 h-16 w-16 text-green-500" />
                                    <p className="text-lg font-bold text-brand-brown">Thanh toán thành công!</p>
                                    <p className="mt-1 text-sm text-brand-gray-600">Phiên bàn đã được đóng.</p>
                                </div>
                            ) : (
                                <>
                                    {/* ── Method selection ── */}
                                    <p className="mb-3 text-sm font-semibold text-brand-brown">Chọn hình thức thanh toán</p>
                                    <div className="mb-5 grid grid-cols-2 gap-3">
                                        {([
                                            { id: "CASH" as PaymentMethod, label: "Tiền mặt", icon: <Banknote size={22} /> },
                                            { id: "TRANSFER" as PaymentMethod, label: "Chuyển khoản", icon: <QrCode size={22} /> },
                                        ]).map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setPayMethod(opt.id)}
                                                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-sm font-semibold transition ${payMethod === opt.id
                                                    ? "border-brand-amber bg-brand-amber/5 text-brand-amber"
                                                    : "border-gray-100 bg-gray-50 text-brand-gray-600 hover:border-brand-amber/40"
                                                    }`}
                                            >
                                                {opt.icon}{opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* ── Bank QR (transfer only) ── */}
                                    {payMethod === "TRANSFER" && (
                                        <div className="mb-5 overflow-hidden rounded-2xl border border-gray-100">
                                            <div className="relative h-64 w-full bg-gray-50">
                                                <Image
                                                    src={BANK_QR_URL}
                                                    alt="Mã QR chuyển khoản"
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            </div>
                                            <p className="bg-brand-beige/50 px-4 py-2 text-center text-xs text-brand-gray-600">
                                                Khách quét mã QR để chuyển khoản · Nhân viên xác nhận sau khi nhận tiền
                                            </p>
                                        </div>
                                    )}

                                    {payMethod === "CASH" && (
                                        <div className="mb-5 rounded-2xl bg-brand-beige/50 p-4 text-sm text-brand-gray-600">
                                            💵 Thu tiền mặt từ khách rồi bấm <span className="font-semibold text-brand-brown">Xác nhận</span> để đóng phiên.
                                        </div>
                                    )}

                                    {/* ── Bill summary ── */}
                                    <div className="mb-5 rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                                        <div className="flex justify-between text-brand-gray-600">
                                            <span>Tạm tính ({summary.totalOrders} đơn)</span>
                                            <span className="font-semibold">{formatCurrency(summary.grandTotal)}</span>
                                        </div>
                                        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-bold text-brand-brown">
                                            <span>Tổng cộng</span>
                                            <span className="text-brand-amber">{formatCurrency(summary.grandTotal)}</span>
                                        </div>
                                    </div>

                                    {/* ── Confirm button ── */}
                                    <Button
                                        variant="primary"
                                        // fullWidth
                                        isLoading={isPaying}
                                        disabled={isPaying}
                                        onClick={handleConfirmPayment}
                                    >
                                        {payMethod === "TRANSFER" ? "Đã nhận chuyển khoản — Xác nhận" : "Xác nhận thanh toán tiền mặt"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}