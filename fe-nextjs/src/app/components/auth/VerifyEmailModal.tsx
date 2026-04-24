import React from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { Modal } from "../shared/Modal";
import { Input } from "../shared/Input";
import { Button } from "../shared/Button";

export interface VerifyEmailModalProps {
  isOpen: boolean;
  email: string;
  code: string;
  isLoading?: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
}

export function VerifyEmailModal({
  isOpen,
  email,
  code,
  isLoading = false,
  onCodeChange,
  onSubmit,
  onClose,
}: VerifyEmailModalProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title="Xác thực email"
      closeOnOutsideClick={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-brand-gray-200 bg-brand-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-brand-brown">
            <Mail size={16} />
            <p className="text-sm font-medium">{email}</p>
          </div>
          <p className="text-sm text-brand-gray-600">
            Hệ thống đã gửi mã xác thực 6 số vào email của bạn.
          </p>
        </div>

        <Input
          label="Mã xác thực"
          value={code}
          onChange={(event) =>
            onCodeChange(event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="Nhập 6 số"
          autoComplete="one-time-code"
          disabled={isLoading}
          leftIcon={<ShieldCheck size={16} />}
        />

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Đóng
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={code.trim().length !== 6}
          >
            Xác thực
          </Button>
        </div>
      </form>
    </Modal>
  );
}
