"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, Lock } from "lucide-react";
import { Button } from "../../components/shared/Button";
import { Input } from "../../components/shared/Input";
import { PasswordInput } from "../../components/shared/PasswordInput";
import { VerifyEmailModal } from "../../components/auth/VerifyEmailModal";
import { authApi } from "@/services/api";
import { useAuth } from "../../../contexts/auth-context";
import { useUIStore } from "../../../stores/ui-store";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const {
    isLoading,
    startLoading,
    stopLoading,
    setError: setErrorStatus,
    setSuccess,
  } = useUIStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFullName) {
      setErrorStatus("Vui lòng nhập họ và tên");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorStatus("Email không hợp lệ");
      return;
    }

    if (password.length < 6) {
      setErrorStatus("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      setErrorStatus("Mật khẩu xác nhận không khớp");
      return;
    }

    startLoading("Đang tạo tài khoản...");

    try {
      const registerResult = await authApi.register({
        email: trimmedEmail,
        password,
        fullName: trimmedFullName,
      });

      if (!registerResult.isEmailVerified) {
        setVerifyCode("");
        setIsVerifyModalOpen(true);
        setSuccess("Tài khoản đã được tạo. Vui lòng xác thực email");
        return;
      }

      const loginResult = await login({ email: trimmedEmail, password });
      if (!loginResult.isEmailVerified) {
        setVerifyCode("");
        setIsVerifyModalOpen(true);
        setSuccess("Vui lòng xác thực email để hoàn tất đăng ký");
        return;
      }

      setSuccess("Đăng ký thành công");
      router.push("/dashboard");
    } catch (err) {
      setErrorStatus(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      stopLoading();
    }
  };

  const handleVerifyEmail = async () => {
    const trimmedEmail = email.trim();
    const normalizedCode = verifyCode.trim();

    if (!trimmedEmail) {
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
        email: trimmedEmail,
        code: normalizedCode,
      });

      const loginResult = await login({ email: trimmedEmail, password });
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
        <Link href="/" className="block text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-brown mb-1 hover:text-brand-coffee transition-colors">
            Bun Dau Lang Mo
          </h1>
          <p className="text-sm text-brand-gray-600">Đăng ký tài khoản</p>
        </Link>

        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-wood)] p-6 sm:p-8">
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Họ và tên"
              type="text"
              placeholder="Nguyen Van A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User size={18} />}
              disabled={isLoading || isVerifying}
              autoComplete="name"
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              disabled={isLoading || isVerifying}
              autoComplete="email"
              required
            />

            <PasswordInput
              label="Mật khẩu"
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              disabled={isLoading || isVerifying}
              autoComplete="new-password"
              required
            />

            <PasswordInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              disabled={isLoading || isVerifying}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              disabled={isVerifying}
            >
              Đăng ký
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-brand-gray-600">
              Đã có tài khoản?{" "}
              <Link
                href="/login"
                className="text-brand-brown hover:text-brand-coffee font-medium"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-brand-brown hover:text-brand-coffee"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>

      <VerifyEmailModal
        isOpen={isVerifyModalOpen}
        email={email.trim()}
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
