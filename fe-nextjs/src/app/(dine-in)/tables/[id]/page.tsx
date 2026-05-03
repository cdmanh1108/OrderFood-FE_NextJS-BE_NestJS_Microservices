"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  MapPin,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { useTableSession } from "@/contexts/table-session-context";
import { tableApi } from "@/services/api";
import type { TableApiModel } from "@/types/api";

type PageState = "loading" | "ready" | "joining" | "error";

export default function QREntryPage() {
  const { id: tableId } = useParams<{ id: string }>();
  const router = useRouter();
  const { joinSession, currentSession, isHydrated } = useTableSession();

  const [state, setState] = useState<PageState>("loading");
  const [table, setTable] = useState<TableApiModel | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Determine if we have an active session for THIS table
  // Only check after hydration to avoid false negatives on refresh
  const hasActiveSession =
    isHydrated && !!currentSession && currentSession.tableId === tableId;

  // Load table info on mount
  useEffect(() => {
    if (!tableId) {
      setErrorMsg("Mã bàn không hợp lệ");
      setState("error");
      return;
    }

    const load = async () => {
      try {
        const data = await tableApi.getById(tableId);
        setTable(data);
        setState("ready");
      } catch {
        setErrorMsg("Không tìm thấy bàn hoặc bàn không khả dụng");
        setState("error");
      }
    };

    void load();
  }, [tableId]);

  const handleStart = async () => {
    if (!tableId) return;

    if (hasActiveSession && currentSession) {
      // Already have session — just navigate
      router.push(`/sessions/${currentSession.id}/menu`);
      return;
    }

    setState("joining");
    try {
      const session = await joinSession(tableId);
      router.push(`/sessions/${session.id}/menu`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Không thể kết nối đến bàn",
      );
      setState("error");
    }
  };

  const isNewSession = !hasActiveSession;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-beige/70 via-white to-brand-yellow/20 p-4">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute left-10 top-16 h-40 w-40 rounded-full bg-brand-yellow/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 right-10 h-52 w-52 rounded-full bg-brand-amber/20 blur-3xl" />

      <section className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-brand-amber/20 bg-white shadow-2xl">
        {/* ── Header gradient ── */}
        <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-8 text-center text-white">
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

          <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm">
            {state === "error" ? (
              <XCircle className="h-9 w-9 text-white" />
            ) : (
              <UtensilsCrossed className="h-9 w-9 text-white" />
            )}
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Bún Đậu Làng Mơ
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white">
            {state === "error"
              ? "Không thể kết nối"
              : state === "loading"
                ? "Đang tải..."
                : "Đặt món tại bàn"}
          </h1>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-8 sm:px-8">
          {/* Loading state */}
          {state === "loading" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-brand-amber" />
              <p className="text-sm text-brand-gray-600">
                Đang kiểm tra thông tin bàn...
              </p>
            </div>
          )}

          {/* Error state */}
          {state === "error" && (
            <>
              <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMsg}
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-amber px-5 py-2.5 text-sm font-semibold text-brand-amber transition hover:-translate-y-0.5 hover:bg-brand-amber hover:text-white hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay về trang chủ
              </Link>
            </>
          )}

          {/* Ready / Joining state */}
          {(state === "ready" || state === "joining") && table && (
            <>
              {/* Table info card */}
              <div className="mb-6 overflow-hidden rounded-2xl border border-brand-amber/20 bg-gradient-to-br from-brand-beige/60 to-brand-yellow/10">
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-amber">
                    Thông tin bàn
                  </p>
                  <p className="mt-2 text-4xl font-extrabold text-brand-brown">
                    Bàn {table.number}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-brand-gray-600">
                      <UtensilsCrossed className="h-4 w-4 text-brand-amber" />
                      {table.seats} chỗ ngồi
                    </span>
                    {table.note && (
                      <span className="flex items-center gap-1 text-sm text-brand-gray-600">
                        <MapPin className="h-4 w-4 text-brand-amber" />
                        {table.note}
                      </span>
                    )}
                  </div>
                </div>

                {/* Session status indicator */}
                <div
                  className={`px-5 py-2.5 text-sm font-medium ${
                    hasActiveSession
                      ? "bg-green-50 text-green-700"
                      : "bg-brand-beige/80 text-brand-gray-600"
                  }`}
                >
                  {hasActiveSession
                    ? "✓ Bạn đang có phiên gọi món đang hoạt động"
                    : "Chưa có phiên gọi món nào"}
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={handleStart}
                disabled={state === "joining"}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-brand-brown to-brand-coffee px-6 py-4 text-base font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {state === "joining" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang kết nối...
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="h-5 w-5" />
                    {hasActiveSession ? "Tiếp tục gọi món" : "Gọi món ngay"}
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-relaxed text-brand-gray-500">
                Bằng cách tiếp tục, bạn đồng ý với{" "}
                <span className="text-brand-amber">điều khoản dịch vụ</span> của
                chúng tôi.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}