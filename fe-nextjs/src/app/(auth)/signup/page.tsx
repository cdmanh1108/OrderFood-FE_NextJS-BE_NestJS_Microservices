"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, Lock } from "lucide-react";
import { Button } from "../../components/shared/Button";
import { Input } from "../../components/shared/Input";
import { PasswordInput } from "../../components/shared/PasswordInput";
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

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorStatus("Vui lòng nhập họ và tên");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
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
      await authApi.register({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });

      await login({ email: email.trim(), password });
      setSuccess("Đăng ký thành công");
      router.push("/dashboard");
    } catch (err) {
      setErrorStatus(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      stopLoading();
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
            Bún Đậu Làng Mơ
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
              disabled={isLoading}
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
              disabled={isLoading}
              autoComplete="email"
              required
            />

            <PasswordInput
              label="Mật khẩu"
              placeholder="Ít nhất 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />

            <PasswordInput
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              disabled={isLoading}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
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
    </div>
  );
}
