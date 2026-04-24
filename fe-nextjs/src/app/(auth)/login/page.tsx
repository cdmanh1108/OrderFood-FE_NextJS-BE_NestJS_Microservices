"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import Image from "next/image";
import { Input } from "../../components/shared/Input";
import { PasswordInput } from "../../components/shared/PasswordInput";
import { Button } from "../../components/shared/Button";
import { VerifyEmailModal } from "../../components/auth/VerifyEmailModal";
import { useAuth } from "../../../contexts/auth-context";
import { authApi } from "@/services/api";
import { useUIStore } from "../../../stores/ui-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const {
    startLoading,
    stopLoading,
    setError: setErrorStatus,
    setSuccess,
  } = useUIStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorStatus("Vui lòng nhập email");
      return;
    }

    if (!password) {
      setErrorStatus("Vui lòng nhập mật khẩu");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorStatus("Email không hợp lệ");
      return;
    }

    try {
      startLoading("Đang đăng nhập...");
      const loginResult = await login({ email: trimmedEmail, password });

      if (!loginResult.isEmailVerified) {
        setVerifyEmail(trimmedEmail);
        setVerifyCode("");
        setIsVerifyModalOpen(true);
        setSuccess("Email chưa xác thực. Vui lòng nhập mã đã gửi qua email");
        return;
      }

      setSuccess("Đăng nhập thành công");
      router.push("/dashboard");
    } catch (err) {
      setErrorStatus(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      stopLoading();
    }
  };

  const handleVerifyEmail = async () => {
    const normalizedCode = verifyCode.trim();

    if (!verifyEmail) {
      setErrorStatus("Không tìm thấy email để xác thực");
      return;
    }

    if (normalizedCode.length !== 6) {
      setErrorStatus("Mã xác thực gồm 6 số");
      return;
    }

    try {
      setIsVerifying(true);

      await authApi.verifyEmail({
        email: verifyEmail,
        code: normalizedCode,
      });

      const loginResult = await login({ email: verifyEmail, password });
      if (!loginResult.isEmailVerified) {
        setErrorStatus("Tài khoản chưa được xác thực. Vui lòng thử lại");
        return;
      }

      setIsVerifyModalOpen(false);
      setVerifyCode("");
      setSuccess("Xác thực email thành công");
      router.push("/dashboard");
    } catch (error) {
      setErrorStatus(
        error instanceof Error ? error.message : "Không thể xác thực email",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-beige via-brand-white to-brand-yellow/10 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-yellow rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-amber rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-wood)] overflow-hidden">
          <div className="bg-gradient-to-br from-brand-yellow to-brand-amber px-8 py-10 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-lg">
              <Image
                src="/images/logo.jpg"
                alt="Bún Đậu Làng Mơ logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-brand-brown mb-2">
              Bún Đậu Làng Mơ
            </h1>
            <p className="text-sm text-brand-brown/80">
              Hệ thống quản lý nhà hàng
            </p>
          </div>

          <div className="px-8 py-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-brand-brown mb-2">
                Đăng nhập
              </h2>
              <p className="text-sm text-brand-gray-600">
                Nhập thông tin để truy cập hệ thống
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail size={18} />}
                disabled={isLoading || isVerifying}
                autoComplete="email"
              />

              <PasswordInput
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={18} />}
                disabled={isLoading || isVerifying}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={isVerifying}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-brand-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  href="/signup"
                  className="text-brand-brown hover:text-brand-coffee font-medium"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-brand-gray-600">
          <p>Copyright 2026 Bún Đậu Làng Mơ</p>
        </div>
      </div>

      <VerifyEmailModal
        isOpen={isVerifyModalOpen}
        email={verifyEmail}
        code={verifyCode}
        onCodeChange={setVerifyCode}
        onSubmit={handleVerifyEmail}
        onClose={() => {
          if (!isVerifying) {
            setIsVerifyModalOpen(false);
          }
        }}
        isLoading={isVerifying}
      />
    </div>
  );
}
