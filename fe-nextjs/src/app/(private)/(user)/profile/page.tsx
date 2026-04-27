"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, MapPin, Plus, Trash2, User } from "lucide-react";
import { Button } from "@/app/components/shared/Button";
import { Input } from "@/app/components/shared/Input";
import { useAuth } from "@/contexts/auth-context";
import { addressApi } from "@/services/api";
import { useUIStore } from "@/stores/ui-store";
import type {
  AddressApiModel,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "@/types/api";

type AddressFormValues = {
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  detail: string;
  isDefault: boolean;
};

const INITIAL_ADDRESS_FORM: AddressFormValues = {
  receiverName: "",
  receiverPhone: "",
  province: "",
  district: "",
  ward: "",
  street: "",
  detail: "",
  isDefault: false,
};

function mapAddressToFormValue(address: AddressApiModel): AddressFormValues {
  return {
    receiverName: address.receiverName,
    receiverPhone: address.receiverPhone,
    province: address.province,
    district: address.district,
    ward: address.ward,
    street: address.street ?? "",
    detail: address.detail ?? "",
    isDefault: address.isDefault,
  };
}

function formatAddressLine(address: AddressApiModel): string {
  return [address.street, address.ward, address.district, address.province]
    .filter(Boolean)
    .join(", ");
}

function toAddressCreatePayload(form: AddressFormValues): CreateAddressRequest {
  return {
    receiverName: form.receiverName.trim(),
    receiverPhone: form.receiverPhone.trim(),
    province: form.province.trim(),
    district: form.district.trim(),
    ward: form.ward.trim(),
    street: form.street.trim() || undefined,
    detail: form.detail.trim() || undefined,
    isDefault: form.isDefault,
  };
}

function toAddressUpdatePayload(form: AddressFormValues): UpdateAddressRequest {
  return {
    receiverName: form.receiverName.trim(),
    receiverPhone: form.receiverPhone.trim(),
    province: form.province.trim(),
    district: form.district.trim(),
    ward: form.ward.trim(),
    street: form.street.trim() || undefined,
    detail: form.detail.trim() || undefined,
  };
}

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const { setError: setErrorStatus, setSuccess } = useUIStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });

  const [addresses, setAddresses] = useState<AddressApiModel[]>([]);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] =
    useState<AddressFormValues>(INITIAL_ADDRESS_FORM);
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false);
  const [workingAddressId, setWorkingAddressId] = useState<string | null>(null);

  useEffect(() => {
    setProfileDraft({
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    });
  }, [user?.email, user?.name, user?.phone]);

  const loadAddresses = useCallback(async () => {
    setIsAddressLoading(true);

    try {
      const response = await addressApi.list({
        page: 1,
        limit: 50,
      });

      setAddresses(response.items ?? []);
    } catch (error) {
      setErrorStatus(
        error instanceof Error ? error.message : "Không thể tải địa chỉ",
      );
    } finally {
      setIsAddressLoading(false);
    }
  }, [setErrorStatus]);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? null,
    [addresses],
  );

  const resetAddressForm = () => {
    setAddressForm(INITIAL_ADDRESS_FORM);
    setEditingAddressId(null);
  };

  const handleStartCreateAddress = () => {
    resetAddressForm();
    setIsAddressFormOpen(true);
  };

  const handleStartEditAddress = (address: AddressApiModel) => {
    setAddressForm(mapAddressToFormValue(address));
    setEditingAddressId(address.id);
    setIsAddressFormOpen(true);
  };

  const handleCancelAddressForm = () => {
    resetAddressForm();
    setIsAddressFormOpen(false);
  };

  const handleSubmitAddress = async () => {
    const hasRequiredAddress =
      addressForm.receiverName.trim() &&
      addressForm.receiverPhone.trim() &&
      addressForm.province.trim() &&
      addressForm.district.trim() &&
      addressForm.ward.trim();

    if (!hasRequiredAddress) {
      setErrorStatus("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setIsAddressSubmitting(true);

    try {
      if (editingAddressId) {
        await addressApi.update(
          editingAddressId,
          toAddressUpdatePayload(addressForm),
        );

        if (addressForm.isDefault) {
          await addressApi.setDefault(editingAddressId, { isDefault: true });
        }
      } else {
        await addressApi.create(toAddressCreatePayload(addressForm));
      }

      await loadAddresses();

      setSuccess(
        editingAddressId
          ? "Cập nhật địa chỉ thành công"
          : "Thêm địa chỉ thành công",
      );

      handleCancelAddressForm();
    } catch (error) {
      setErrorStatus(
        error instanceof Error ? error.message : "Không thể lưu địa chỉ",
      );
    } finally {
      setIsAddressSubmitting(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    setWorkingAddressId(addressId);

    try {
      await addressApi.setDefault(addressId, { isDefault: true });
      await loadAddresses();
      setSuccess("Đã đặt địa chỉ mặc định");
    } catch (error) {
      setErrorStatus(
        error instanceof Error
          ? error.message
          : "Không thể đặt địa chỉ mặc định",
      );
    } finally {
      setWorkingAddressId(null);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa địa chỉ này?");
    if (!confirmed) return;

    setWorkingAddressId(addressId);

    try {
      await addressApi.delete(addressId);
      await loadAddresses();
      setSuccess("Đã xóa địa chỉ");
    } catch (error) {
      setErrorStatus(
        error instanceof Error ? error.message : "Không thể xóa địa chỉ",
      );
    } finally {
      setWorkingAddressId(null);
    }
  };

  const handleSaveProfileDraft = () => {
    setIsEditingProfile(false);
    setSuccess("Thông tin cá nhân chưa kết nối API");
  };

  const displayName = user?.name || "Người dùng";

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-beige/40 via-white to-brand-amber/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-brand-amber/20 bg-white shadow-sm">
          <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-8 text-white sm:px-8">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-16 h-20 w-20 rounded-full bg-white/10 blur-xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                  Tài khoản của tôi
                </p>
                <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
                  Thông tin cá nhân
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                  Quản lý thông tin cá nhân và địa chỉ giao hàng của bạn.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingProfile((prev) => !prev)}
                className="w-fit rounded-full border border-white/40 bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white hover:text-brand-brown hover:shadow-md"
              >
                {isEditingProfile ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-brand-brown">
                Thông tin cơ bản
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Cập nhật họ tên, số điện thoại và email.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Họ và tên"
                value={profileDraft.name}
                onChange={(event) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                readOnly={!isEditingProfile}
              />

              <Input
                label="Số điện thoại"
                value={profileDraft.phone}
                onChange={(event) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
                readOnly={!isEditingProfile}
              />

              <div className="md:col-span-2">
                <Input
                  label="Email"
                  value={profileDraft.email}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  readOnly={!isEditingProfile}
                />
              </div>
            </div>

            {isEditingProfile && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingProfile(false)}
                >
                  Hủy
                </Button>

                <Button type="button" onClick={handleSaveProfileDraft}>
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-brand-brown">
                Địa chỉ giao hàng
              </h2>
              <p className="mt-2 inline-flex rounded-full bg-brand-beige px-3 py-1 text-xs font-medium text-brand-brown">
                {defaultAddress
                  ? "Đã có địa chỉ mặc định"
                  : "Chưa có địa chỉ mặc định"}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Thêm, sửa và chọn địa chỉ mặc định.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartCreateAddress}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-amber px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-yellow hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Thêm địa chỉ
            </button>
          </div>

          {isAddressFormOpen && (
            <div className="mb-6 rounded-3xl border border-brand-amber/20 bg-brand-beige/30 p-5 sm:p-6">
              <h3 className="mb-4 text-lg font-bold text-brand-brown">
                {editingAddressId ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Người nhận"
                  value={addressForm.receiverName}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      receiverName: event.target.value,
                    }))
                  }
                />

                <Input
                  label="Số điện thoại"
                  value={addressForm.receiverPhone}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      receiverPhone: event.target.value,
                    }))
                  }
                />

                <Input
                  label="Tỉnh/Thành phố"
                  value={addressForm.province}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      province: event.target.value,
                    }))
                  }
                />

                <Input
                  label="Quận/Huyện"
                  value={addressForm.district}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      district: event.target.value,
                    }))
                  }
                />

                <Input
                  label="Phường/Xã"
                  value={addressForm.ward}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      ward: event.target.value,
                    }))
                  }
                />

                <Input
                  label="Đường"
                  value={addressForm.street}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      street: event.target.value,
                    }))
                  }
                />

                <div className="md:col-span-2">
                  <Input
                    label="Chi tiết/Ghi chú"
                    value={addressForm.detail}
                    onChange={(event) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        detail: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(event) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          isDefault: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-gray-300 accent-brand-amber"
                    />
                    Đặt làm địa chỉ mặc định
                  </label>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  className="flex-1"
                  isLoading={isAddressSubmitting}
                  onClick={() => void handleSubmitAddress()}
                >
                  {editingAddressId ? "Lưu thay đổi" : "Lưu địa chỉ"}
                </Button>

                <Button
                  type="button"
                  className="flex-1"
                  variant="outline"
                  onClick={handleCancelAddressForm}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {isAddressLoading ? (
            <div className="inline-flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải địa chỉ...
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-beige">
                <MapPin className="h-6 w-6 text-brand-amber" />
              </div>
              <p className="font-semibold text-brand-brown">
                Bạn chưa có địa chỉ giao hàng nào
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Thêm địa chỉ để đặt món nhanh hơn.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`rounded-3xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${address.isDefault
                    ? "border-brand-amber bg-brand-beige/40"
                    : "border-gray-100 bg-white hover:border-brand-amber/40"
                    }`}
                >
                  <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-beige">
                        <MapPin className="h-5 w-5 text-brand-amber" />
                      </div>

                      <div>
                        <h3 className="font-bold text-brand-brown">
                          {address.receiverName} - {address.receiverPhone}
                        </h3>

                        {address.isDefault && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-brand-amber shadow-sm">
                            <Check className="h-3 w-3" />
                            Mặc định
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 sm:justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEditAddress(address)}
                      >
                        Sửa
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        isLoading={workingAddressId === address.id}
                        onClick={() => void handleDeleteAddress(address.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-gray-900">
                      {formatAddressLine(address)}
                    </p>

                    {address.detail && (
                      <p className="italic text-gray-500">
                        Ghi chú: {address.detail}
                      </p>
                    )}
                  </div>

                  {!address.isDefault && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="mt-4"
                      isLoading={workingAddressId === address.id}
                      onClick={() => void handleSetDefaultAddress(address.id)}
                    >
                      Đặt làm mặc định
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}