"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardPen,
  CreditCard,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { Button } from "@/app/components/shared/Button";
import { Input } from "@/app/components/shared/Input";
import { Modal } from "@/app/components/shared/Modal";
import { useCart } from "@/contexts/cart-context";
import { addressApi, categoryApi, menuItemApi } from "@/services/api";
import { checkoutApi } from "@/services/api/checkout.api";
import { orderApi } from "@/services/api/order.api";
import type { CheckoutPricingResponse } from "@/services/api/checkout.api";
import { useUI } from "@/contexts/ui-context";
import type { MenuItem } from "@/types";
import type {
  AddressApiModel,
  CreateAddressRequest,
  MenuCategorySimpleApiModel,
  MenuItemSimpleApiModel,
  UpdateAddressRequest,
} from "@/types/api";
import { formatCurrency, toSlug } from "@/utils/cn";

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

type PaymentMethod = "cash" | "momo" | "banking";

const ALL_CATEGORY_ID = "all";
const SHIPPING_FEE = 15000;

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

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  title: string;
  description: string;
}> = [
  {
    id: "cash",
    title: "Tiền mặt",
    description: "Thanh toán khi nhận hàng",
  },
  {
    id: "momo",
    title: "Ví MoMo",
    description: "Thanh toán qua ví điện tử",
  },
  {
    id: "banking",
    title: "Chuyển khoản",
    description: "Thanh toán qua internet banking",
  },
];

function mapMenuCardToCartMenuItem(
  item: MenuItemSimpleApiModel,
  selectedCategoryId: string,
): MenuItem {
  const now = new Date().toISOString();

  return {
    id: item.id,
    categoryId:
      selectedCategoryId === ALL_CATEGORY_ID
        ? ALL_CATEGORY_ID
        : selectedCategoryId,
    name: item.name,
    slug: toSlug(item.name),
    description: item.description ?? undefined,
    price: item.price,
    image: item.image ?? undefined,
    isAvailable: true,
    isFeatured: false,
    order: 0,
    createdAt: now,
    updatedAt: now,
  };
}

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

export default function CustomerMenuPage() {
  const {
    cart,
    activeAddressId,
    addItem,
    clearCart,
    getItemCount,
    removeItem,
    setAddress,
    updateNotes,
    updateQuantity,
  } = useCart();
  const { setError: setErrorStatus, setSuccess } = useUI();

  const [categories, setCategories] = useState<MenuCategorySimpleApiModel[]>(
    [],
  );
  const [menuItems, setMenuItems] = useState<MenuItemSimpleApiModel[]>([]);

  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [isMenuLoading, setIsMenuLoading] = useState(true);

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<AddressApiModel[]>([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] =
    useState<AddressFormValues>(INITIAL_ADDRESS_FORM);
  const [isAddressSubmitting, setIsAddressSubmitting] = useState(false);
  const [selectingAddressId, setSelectingAddressId] = useState<string | null>(
    null,
  );
  const [defaultingAddressId, setDefaultingAddressId] = useState<string | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const categoryOptions = useMemo(
    () => [
      {
        id: ALL_CATEGORY_ID,
        name: "Tất cả",
      },
      ...categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    ],
    [categories],
  );

  const cartTotalWithShipping = useMemo(
    () => cart.total + SHIPPING_FEE,
    [cart.total],
  );
  const selectedAddress = useMemo(() => {
    if (addresses.length === 0) {
      return null;
    }

    return (
      addresses.find((address) => address.id === activeAddressId) ??
      addresses.find((address) => address.isDefault) ??
      null
    );
  }, [activeAddressId, addresses]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedKeyword(searchQuery.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchQuery]);

  const loadCategories = useCallback(async () => {
    setIsCategoryLoading(true);

    try {
      const response = await categoryApi.menuCategories();
      setCategories(response);
    } catch (error) {
      setErrorStatus(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách danh mục",
      );
    } finally {
      setIsCategoryLoading(false);
    }
  }, [setErrorStatus]);

  const loadMenuItems = useCallback(async () => {
    setIsMenuLoading(true);

    try {
      const response = await menuItemApi.menu({
        keyword: debouncedKeyword || undefined,
        categoryId:
          selectedCategory === ALL_CATEGORY_ID ? undefined : selectedCategory,
        limit: 100,
      });

      setMenuItems(response);
    } catch (error) {
      setMenuItems([]);
      setErrorStatus(
        error instanceof Error ? error.message : "Không thể tải menu món ăn",
      );
    } finally {
      setIsMenuLoading(false);
    }
  }, [debouncedKeyword, selectedCategory, setErrorStatus]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadMenuItems();
  }, [loadMenuItems]);

  const loadAddresses = useCallback(async () => {
    setIsAddressLoading(true);

    try {
      const response = await addressApi.list({
        page: 1,
        limit: 20,
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
    if (!isCartModalOpen) {
      return;
    }

    void loadAddresses();
  }, [isCartModalOpen, loadAddresses]);

  const getSelectedQuantity = (itemId: string): number => {
    return quantities[itemId] ?? 1;
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] ?? 1;
      return {
        ...prev,
        [itemId]: Math.max(1, current + delta),
      };
    });
  };

  const handleAddToCart = async (item: MenuItemSimpleApiModel) => {
    const quantity = getSelectedQuantity(item.id);
    const cartMenuItem = mapMenuCardToCartMenuItem(item, selectedCategory);

    try {
      await addItem(cartMenuItem, quantity);
      setSuccess(`Đã thêm ${quantity} x ${item.name} vào giỏ hàng`);
    } catch (error) {
      setErrorStatus(
        error instanceof Error
          ? error.message
          : "Không thể thêm món vào giỏ hàng",
      );
    }
  };

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
      setErrorStatus("Vui lòng nhập đầy đủ thông tin địa chỉ");
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
        if (activeAddressId === editingAddressId || addressForm.isDefault) {
          await setAddress(editingAddressId);
        }
      } else {
        const createdAddress = await addressApi.create(
          toAddressCreatePayload(addressForm),
        );
        await setAddress(createdAddress.id);
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

  const handleSelectAddress = async (addressId: string) => {
    if (activeAddressId === addressId) {
      return;
    }

    setSelectingAddressId(addressId);

    try {
      await setAddress(addressId);
      setSuccess("Đã cập nhật địa chỉ cho giỏ hàng");
    } catch (error) {
      setErrorStatus(
        error instanceof Error
          ? error.message
          : "Không thể gán địa chỉ cho giỏ hàng",
      );
    } finally {
      setSelectingAddressId(null);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    setDefaultingAddressId(addressId);

    try {
      await addressApi.setDefault(addressId, { isDefault: true });
      await setAddress(addressId);
      await loadAddresses();
      setSuccess("Da dat dia chi mac dinh");
    } catch (error) {
      setErrorStatus(
        error instanceof Error ? error.message : "Khong the dat mac dinh",
      );
    } finally {
      setDefaultingAddressId(null);
    }
  };

  const handleClearCartAddress = async () => {
    setSelectingAddressId("clear");

    try {
      await setAddress(undefined);
      setSuccess("Đã bỏ địa chỉ khỏi giỏ hàng");
    } catch (error) {
      setErrorStatus(
        error instanceof Error
          ? error.message
          : "Không thể bỏ địa chỉ khỏi giỏ hàng",
      );
    } finally {
      setSelectingAddressId(null);
    }
  };

  const [pricing, setPricing] = useState<CheckoutPricingResponse | null>(null);

  const handleCalculateCheckout = async () => {
    if (cart.items.length === 0) {
      setErrorStatus("Giỏ hàng đang trống");
      return;
    }

    const addressToUse = activeAddressId || selectedAddress?.id;
    if (!addressToUse) {
      setErrorStatus("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (!activeAddressId && selectedAddress) {
      try {
        await setAddress(selectedAddress.id);
      } catch (error) {
        setErrorStatus(
          error instanceof Error
            ? error.message
            : "Không thể gán địa chỉ giao hàng",
        );
        return;
      }
    }

    setIsPlacingOrder(true);
    try {
      const payload = {
        items: cart.items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          unitPrice: i.menuItem.price,
        })),
        shippingAddressId: addressToUse,
      };
      const result = await checkoutApi.calculate(payload);
      setPricing(result);
      setIsCartModalOpen(false);
      setIsCheckoutModalOpen(true);
    } catch (error: any) {
      setErrorStatus(error.message || "Lỗi tính toán hóa đơn");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!pricing || !selectedAddress) return;
    
    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        channel: 'ONLINE' as const,
        source: 'WEB' as const,
        items: cart.items.map((i) => ({
          menuItemId: i.menuItem.id,
          menuItemName: i.menuItem.name,
          menuItemImageUrl: i.menuItem.image,
          unitPrice: i.menuItem.price,
          quantity: i.quantity,
        })),
        shippingAddress: {
          receiverName: selectedAddress.receiverName,
          receiverPhone: selectedAddress.receiverPhone,
          province: selectedAddress.province,
          district: selectedAddress.district,
          ward: selectedAddress.ward,
          street: selectedAddress.street ?? undefined,
          detail: selectedAddress.detail ?? undefined,
        },
      };

      await orderApi.create(orderPayload);
      setSuccess("Đặt hàng thành công!");
      await clearCart();
      setIsCartModalOpen(false);
      setIsCheckoutModalOpen(false);
      setPricing(null);
    } catch (error: any) {
      setErrorStatus(error.message || "Đặt hàng thất bại");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-beige/50 via-white to-brand-amber/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-8 pb-20">
      <section className="overflow-hidden rounded-[2rem] border border-brand-amber/20 bg-white shadow-sm">
        <div className="relative bg-gradient-to-r from-brand-brown via-brand-coffee to-brand-amber px-6 py-8 text-white sm:px-8 lg:px-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-24 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
              Đặt Món Trực Tuyến
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Chọn món bạn muốn ăn hôm nay
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/80 lg:text-base">
              Gọi API menu theo từ khóa và danh mục, thêm món vào giỏ và thanh
              toán nhanh.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCartModalOpen(true)}
            className="relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-brand-brown shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <ShoppingCart className="h-5 w-5" />
            Giỏ hàng
            {getItemCount() > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-danger px-1 text-xs font-bold text-white ring-2 ring-white">
                {getItemCount()}
              </span>
            )}
          </button>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-brand-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <Input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Tìm món ăn theo tên..."
          leftIcon={<Search className="h-4 w-4" />}
        />

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {isCategoryLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-9 w-24 animate-pulse rounded-full bg-brand-gray-100"
              />
            ))}

          {!isCategoryLoading &&
            categoryOptions.map((category) => {
              const isActive = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-brown text-white shadow-sm"
                      : "border border-brand-gray-200 bg-white text-brand-gray-700 hover:border-brand-amber hover:bg-brand-beige/50 hover:text-brand-brown"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
        </div>
      </section>

      {isMenuLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-brand-gray-100 bg-white shadow-sm"
            >
              <div className="aspect-[4/3] animate-pulse bg-brand-gray-100" />
              <div className="space-y-3 p-4">
                <div className="h-5 w-2/3 animate-pulse rounded bg-brand-gray-100" />
                <div className="h-4 w-full animate-pulse rounded bg-brand-gray-100" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-brand-gray-100" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-brand-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : menuItems.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-brand-gray-300 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-brand-brown">
            Không tìm thấy món phù hợp
          </p>
          <p className="mt-2 text-sm text-brand-gray-600">
            Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {menuItems.map((item) => {
            const quantity = getSelectedQuantity(item.id);

            return (
              <article
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-brand-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-amber/40 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-beige text-sm font-medium text-brand-brown">
                      Chưa có hình ảnh
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="line-clamp-1 text-lg font-semibold text-brand-brown">
                      {item.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-brand-gray-600">
                      {item.description || "Món ăn đặc trưng của quán"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-brand-coffee">
                      {formatCurrency(item.price)}
                    </p>

                    <div className="flex items-center overflow-hidden rounded-lg border border-brand-gray-200">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="px-2.5 py-1.5 text-brand-gray-600 transition hover:bg-brand-gray-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-brand-brown">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="px-2.5 py-1.5 text-brand-gray-600 transition hover:bg-brand-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    variant="secondary"
                    onClick={() => void handleAddToCart(item)}
                  >
                    Thêm vào giỏ
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsCartModalOpen(true)}
        className="fixed bottom-6 right-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-brown text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-coffee lg:hidden"
      >
        <ShoppingCart className="h-6 w-6" />
        {getItemCount() > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-danger px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {getItemCount()}
          </span>
        )}
      </button>

      <Modal
        isOpen={isCartModalOpen}
        onClose={() => {
          setIsCartModalOpen(false);
          handleCancelAddressForm();
        }}
        size="xl"
        title="Chi tiết giỏ hàng"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCartModalOpen(false)}
            >
              Tiếp tục chọn món
            </Button>
            <Button
              type="button"
              onClick={() => void handleCalculateCheckout()}
              disabled={cart.items.length === 0}
              isLoading={isPlacingOrder}
              leftIcon={!isPlacingOrder ? <CreditCard size={16} /> : undefined}
            >
              Tiến hành thanh toán
            </Button>
          </>
        }
      >
        {cart.items.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCart className="mx-auto h-14 w-14 text-brand-gray-300" />
            <p className="mt-4 text-lg font-semibold text-brand-brown">
              Giỏ hàng đang trống
            </p>
            <p className="mt-2 text-sm text-brand-gray-600">
              Bạn hãy thêm món để tiếp tục đặt hàng.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-2xl border border-brand-amber/20 bg-brand-beige/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-brand-amber" />
                  <div>
                    <p className="font-semibold text-brand-brown">
                      Địa chỉ giao hàng
                    </p>
                    {selectedAddress ? (
                      <>
                        <p className="mt-1 text-sm text-brand-gray-700">
                          {selectedAddress.receiverName} -{" "}
                          {selectedAddress.receiverPhone}
                        </p>
                        <p className="text-sm text-brand-gray-700">
                          {formatAddressLine(selectedAddress)}
                        </p>
                        {selectedAddress.detail && (
                          <p className="text-xs text-brand-gray-500">
                            Ghi chú: {selectedAddress.detail}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-brand-gray-500">
                        Chưa có địa chỉ giao hàng. Hãy thêm địa chỉ mới.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  {activeAddressId && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      isLoading={selectingAddressId === "clear"}
                      onClick={() => void handleClearCartAddress()}
                    >
                      Bỏ địa chỉ
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    leftIcon={<ClipboardPen size={14} />}
                    onClick={handleStartCreateAddress}
                  >
                    Thêm địa chỉ
                  </Button>
                </div>
              </div>

              {isAddressLoading ? (
                <div className="mt-4 rounded-xl border border-brand-gray-200 bg-white px-4 py-3 text-sm text-brand-gray-600">
                  Đang tải địa chỉ...
                </div>
              ) : addresses.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {addresses.map((address) => {
                    const isSelected = activeAddressId === address.id;

                    return (
                      <div
                        key={address.id}
                        className={`rounded-lg border p-3 ${
                          isSelected
                            ? "border-brand-amber bg-white shadow-sm"
                            : "border-brand-gray-200 bg-white hover:border-brand-amber/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-brand-brown">
                              {address.receiverName} - {address.receiverPhone}
                            </p>
                            <p className="text-sm text-brand-gray-700">
                              {formatAddressLine(address)}
                            </p>
                            {address.detail && (
                              <p className="text-xs text-brand-gray-500">
                                Ghi chú: {address.detail}
                              </p>
                            )}
                            <div className="mt-1 flex items-center gap-2 text-xs">
                              {address.isDefault && (
                                <span className="rounded-full bg-brand-amber/20 px-2 py-0.5 font-medium text-brand-brown">
                                  Mặc định
                                </span>
                              )}
                              {isSelected && (
                                <span className="rounded-full bg-brand-brown/10 px-2 py-0.5 font-medium text-brand-brown">
                                  Đang dùng
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              isLoading={selectingAddressId === address.id}
                              onClick={() =>
                                void handleSelectAddress(address.id)
                              }
                              disabled={isSelected}
                            >
                              Chọn
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEditAddress(address)}
                            >
                              Sửa
                            </Button>
                            {!address.isDefault && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                isLoading={defaultingAddressId === address.id}
                                onClick={() =>
                                  void handleSetDefaultAddress(address.id)
                                }
                              >
                                Mặc định
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {isAddressFormOpen && (
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    label="Người nhận"
                    value={addressForm.receiverName}
                    onChange={(event) =>
                      setAddressForm((prev) => ({
                        ...prev,
                        receiverName: event.target.value,
                      }))
                    }
                    placeholder="Tên người nhận"
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
                    placeholder="Số điện thoại"
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
                    placeholder="Ví dụ: Hà Nội"
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
                    placeholder="Ví dụ: Hai Bà Trưng"
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
                    placeholder="Ví dụ: Bách Khoa"
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
                    placeholder="Ví dụ: Trần Đại Nghĩa"
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
                      placeholder="Số nhà, tòa nhà, hướng dẫn giao..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="inline-flex items-center gap-2 text-sm text-brand-gray-700">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(event) =>
                          setAddressForm((prev) => ({
                            ...prev,
                            isDefault: event.target.checked,
                          }))
                        }
                      />
                      Đặt làm địa chỉ mặc định
                    </label>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelAddressForm}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      isLoading={isAddressSubmitting}
                      onClick={() => void handleSubmitAddress()}
                    >
                      {editingAddressId ? "Lưu thay đổi" : "Lưu địa chỉ"}
                    </Button>
                  </div>
                </div>
              )}

              {!isAddressFormOpen &&
                addresses.length === 0 &&
                !isAddressLoading && (
                  <div className="mt-4 rounded-lg border border-dashed border-brand-gray-300 px-4 py-3 text-sm text-brand-gray-600">
                    Chưa có địa chỉ nào. Nhấn Thêm địa chi để bắt đầu.
                  </div>
                )}
            </section>

            <section className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="rounded-2xl border border-brand-gray-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-brand-gray-100">
                      {item.menuItem.image ? (
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-brand-gray-500">
                          Không có hình ảnh
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="line-clamp-1 font-semibold text-brand-brown">
                            {item.menuItem.name}
                          </h4>
                          <p className="text-sm text-brand-gray-600">
                            {formatCurrency(item.menuItem.price)} / phần
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            void removeItem(item.menuItem.id).catch((error) => {
                              setErrorStatus(
                                error instanceof Error
                                  ? error.message
                                  : "Khong the xoa mon khoi gio hang",
                              );
                            })
                          }
                          className="rounded-lg p-2 text-brand-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center overflow-hidden rounded-lg border border-brand-gray-200">
                          <button
                            type="button"
                            onClick={() =>
                              void updateQuantity(
                                item.menuItem.id,
                                item.quantity - 1,
                              ).catch((error) => {
                                setErrorStatus(
                                  error instanceof Error
                                    ? error.message
                                    : "Không thể cập nhật số lượng món",
                                );
                              })
                            }
                            disabled={item.quantity <= 1}
                            className="px-2 py-1.5 text-brand-gray-600 transition hover:bg-brand-gray-100 disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-brand-brown">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              void updateQuantity(
                                item.menuItem.id,
                                item.quantity + 1,
                              ).catch((error) => {
                                setErrorStatus(
                                  error instanceof Error
                                    ? error.message
                                    : "Không thể cập nhật số lượng món",
                                );
                              })
                            }
                            className="px-2 py-1.5 text-brand-gray-600 transition hover:bg-brand-gray-100"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-brand-coffee">
                          {formatCurrency(item.menuItem.price * item.quantity)}
                        </p>
                      </div>

                      <Input
                        className="mt-3"
                        value={item.note ?? ""}
                        onChange={(event) =>
                          void updateNotes(
                            item.menuItem.id,
                            event.target.value,
                          ).catch((error) => {
                            setErrorStatus(
                              error instanceof Error
                                ? error.message
                                : "Không thể cập nhật ghi chú món",
                            );
                          })
                        }
                        placeholder="Ghi chú cho món này (không bắt buộc)"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-brand-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand-amber" />
                <p className="font-semibold text-brand-brown">
                  Phương thức thanh toán
                </p>
              </div>

              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition ${
                      paymentMethod === method.id
                        ? "border-brand-amber bg-brand-beige/40"
                        : "border-brand-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block text-sm font-medium text-brand-brown">
                        {method.title}
                      </span>
                      <span className="text-xs text-brand-gray-600">
                        {method.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-brand-amber/20 bg-brand-beige/30 p-4">
              <div className="flex items-center justify-between text-sm text-brand-gray-700">
                <span>Tạm tính (chưa phí ship)</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="mt-3 border-t border-brand-gray-200 pt-3">
                <div className="flex items-center justify-between text-base font-bold text-brand-brown">
                  <span>Tổng tiền</span>
                  <span>{formatCurrency(cart.total)}</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          setIsCheckoutModalOpen(false);
          setPricing(null);
          setIsCartModalOpen(true);
        }}
        size="md"
        title="Xác nhận đơn hàng"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCheckoutModalOpen(false);
                setPricing(null);
                setIsCartModalOpen(true);
              }}
            >
              Quay lại giỏ hàng
            </Button>
            <Button
              type="button"
              onClick={() => void handlePlaceOrder()}
              isLoading={isPlacingOrder}
              className="bg-brand-amber hover:bg-brand-amber/90 text-white"
              leftIcon={!isPlacingOrder ? <CreditCard size={16} /> : undefined}
            >
              Xác nhận đặt hàng
            </Button>
          </>
        }
      >
        {pricing && selectedAddress && (
          <div className="space-y-4">
            <section className="rounded-xl border border-brand-amber/20 bg-brand-beige/30 p-4">
              <h3 className="font-semibold text-brand-brown mb-1">Địa chỉ nhận hàng</h3>
              <p className="text-sm font-medium">{selectedAddress.receiverName} - {selectedAddress.receiverPhone}</p>
              <p className="text-sm text-brand-gray-600">{formatAddressLine(selectedAddress)}</p>
            </section>
            
            <section className="rounded-xl border border-brand-gray-100 bg-white p-4">
              <h3 className="font-semibold text-brand-brown mb-3">Món đã chọn</h3>
              <div className="space-y-2">
                {cart.items.map(item => (
                   <div key={item.menuItem.id} className="flex justify-between text-sm">
                     <span className="font-medium">{item.quantity}x {item.menuItem.name}</span>
                     <span className="text-brand-gray-700">{formatCurrency(item.menuItem.price * item.quantity)}</span>
                   </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-brand-gray-100 bg-white p-4">
              <h3 className="font-semibold text-brand-brown mb-3">Phương thức thanh toán</h3>
              <p className="text-sm">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.title || 'Chưa chọn'}</p>
            </section>

            <section className="rounded-xl border border-brand-amber/20 bg-brand-beige/30 p-4">
               <div className="flex justify-between text-sm mb-1 text-brand-gray-700">
                 <span>Tổng tiền món</span>
                 <span>{formatCurrency(pricing.itemsSubtotal)}</span>
               </div>
               <div className="flex justify-between text-sm mb-1 text-brand-gray-700">
                 <span>Phí giao hàng</span>
                 <span>{formatCurrency(pricing.shippingFee)}</span>
               </div>
               {pricing.discountTotal > 0 && (
                 <div className="flex justify-between text-sm text-brand-danger mb-1">
                   <span>Khuyến mãi</span>
                   <span>-{formatCurrency(pricing.discountTotal)}</span>
                 </div>
               )}
               <div className="flex justify-between font-bold text-base mt-3 pt-3 border-t border-brand-gray-200">
                 <span className="text-brand-brown">Tổng thanh toán</span>
                 <span className="text-brand-amber text-xl">{formatCurrency(pricing.grandTotal)}</span>
               </div>
            </section>
          </div>
        )}
      </Modal>

      {isPlacingOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-brand-brown shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo đơn hàng...
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
