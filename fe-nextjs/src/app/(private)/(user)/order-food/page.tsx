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
import { categoryApi, menuItemApi } from "@/services/api";
import { useUIStore } from "@/stores/ui-store";
import type { MenuItem } from "@/types";
import type {
  MenuCategorySimpleApiModel,
  MenuItemSimpleApiModel,
} from "@/types/api";
import { formatCurrency, toSlug } from "@/utils/cn";

type DeliveryAddress = {
  recipientName: string;
  recipientPhone: string;
  fullAddress: string;
  note: string;
};

type PaymentMethod = "cash" | "momo" | "banking";

const ALL_CATEGORY_ID = "all";
const SHIPPING_FEE = 15000;

const INITIAL_ADDRESS: DeliveryAddress = {
  recipientName: "Nguyễn Văn A",
  recipientPhone: "0912345678",
  fullAddress: "123 Trần Đại Nghĩa, Hai Bà Trưng, Hà Nội",
  note: "Gọi trước 5 phút khi giao",
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

export default function CustomerMenuPage() {
  const {
    cart,
    addItem,
    clearCart,
    getItemCount,
    removeItem,
    updateNotes,
    updateQuantity,
  } = useCart();
  const { setError: setErrorStatus, setSuccess } = useUIStore();

  const [categories, setCategories] = useState<MenuCategorySimpleApiModel[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemSimpleApiModel[]>([]);

  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [isMenuLoading, setIsMenuLoading] = useState(true);

  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] =
    useState<DeliveryAddress>(INITIAL_ADDRESS);
  const [addressDraft, setAddressDraft] =
    useState<DeliveryAddress>(INITIAL_ADDRESS);
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
          : "Khong the tai danh sach danh muc",
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

  const handleAddToCart = (item: MenuItemSimpleApiModel) => {
    const quantity = getSelectedQuantity(item.id);
    const cartMenuItem = mapMenuCardToCartMenuItem(item, selectedCategory);

    addItem(cartMenuItem, quantity);
    setSuccess(`Đã thêm ${quantity} x ${item.name} vào giỏ hàng`);
  };

  const handleStartEditAddress = () => {
    setAddressDraft(deliveryAddress);
    setIsAddressEditing(true);
  };

  const handleSaveAddress = () => {
    const hasRequiredAddress =
      addressDraft.recipientName.trim() &&
      addressDraft.recipientPhone.trim() &&
      addressDraft.fullAddress.trim();

    if (!hasRequiredAddress) {
      setErrorStatus("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }

    setDeliveryAddress(addressDraft);
    setIsAddressEditing(false);
    setSuccess("Đã cập nhật địa chỉ giao hàng (mock)");
  };

  const handleMockCheckout = async () => {
    if (cart.items.length === 0) {
      setErrorStatus("Giỏ hàng đang trống");
      return;
    }

    setIsPlacingOrder(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      clearCart();
      setIsCartModalOpen(false);
      setSuccess("Đặt hàng thành công (mock). Bạn có thể kết nối API sau.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <section className="rounded-3xl border border-brand-amber/30 bg-gradient-to-br from-brand-yellow/20 via-white to-brand-amber/20 p-5 lg:p-7 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-brand-gray-500">
              Đặt Món Trực Tuyến
            </p>
            <h1 className="mt-2 text-2xl font-bold text-brand-brown lg:text-3xl">
              Chọn món bạn muốn ăn hôm nay
            </h1>
            <p className="mt-2 text-sm text-brand-gray-600 lg:text-base">
              Gọi API menu theo từ khóa và danh mục, thêm món vào giỏ và thanh
              toán nhanh.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCartModalOpen(true)}
            className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-brand-brown px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-coffee"
          >
            <ShoppingCart className="h-5 w-5" />
            Giỏ hàng
            {getItemCount() > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-danger px-1 text-xs font-bold text-white">
                {getItemCount()}
              </span>
            )}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-gray-200 bg-white p-4 shadow-sm">
        <Input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Tìm món ăn theo tên..."
          leftIcon={<Search className="h-4 w-4" />}
        />

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
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
                      : "border border-brand-gray-200 bg-white text-brand-gray-700 hover:border-brand-amber hover:text-brand-brown"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
        </div>
      </section>

      {isMenuLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-brand-gray-200 bg-white"
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
        <div className="rounded-2xl border border-dashed border-brand-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-brand-brown">
            Không tìm thấy món phù hợp
          </p>
          <p className="mt-2 text-sm text-brand-gray-600">
            Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {menuItems.map((item) => {
            const quantity = getSelectedQuantity(item.id);

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-brand-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-beige text-sm font-medium text-brand-brown">
                      Chưa có hình ảnh
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-4">
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
                    onClick={() => handleAddToCart(item)}
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
        className="fixed bottom-6 right-6 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-brown text-white shadow-lg transition hover:bg-brand-coffee lg:hidden"
      >
        <ShoppingCart className="h-6 w-6" />
        {getItemCount() > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-danger px-1 text-[10px] font-bold text-white">
            {getItemCount()}
          </span>
        )}
      </button>

      <Modal
        isOpen={isCartModalOpen}
        onClose={() => {
          setIsCartModalOpen(false);
          setIsAddressEditing(false);
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
              onClick={() => void handleMockCheckout()}
              disabled={cart.items.length === 0}
              isLoading={isPlacingOrder}
              leftIcon={!isPlacingOrder ? <CreditCard size={16} /> : undefined}
            >
              Thanh toán (mock)
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
            <section className="rounded-xl border border-brand-gray-200 bg-brand-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-brand-amber" />
                  <div>
                    <p className="font-semibold text-brand-brown">
                      Địa chỉ giao hàng
                    </p>
                    {!isAddressEditing ? (
                      <>
                        <p className="mt-1 text-sm text-brand-gray-700">
                          {deliveryAddress.recipientName} -{" "}
                          {deliveryAddress.recipientPhone}
                        </p>
                        <p className="text-sm text-brand-gray-700">
                          {deliveryAddress.fullAddress}
                        </p>
                        {deliveryAddress.note && (
                          <p className="text-xs text-brand-gray-500">
                            Ghi chú: {deliveryAddress.note}
                          </p>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>

                {!isAddressEditing && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    leftIcon={<ClipboardPen size={14} />}
                    onClick={handleStartEditAddress}
                  >
                    Chỉnh địa chỉ
                  </Button>
                )}
              </div>

              {isAddressEditing && (
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    label="Người nhận"
                    value={addressDraft.recipientName}
                    onChange={(event) =>
                      setAddressDraft((prev) => ({
                        ...prev,
                        recipientName: event.target.value,
                      }))
                    }
                    placeholder="Tên người nhận"
                  />
                  <Input
                    label="Số điện thoại"
                    value={addressDraft.recipientPhone}
                    onChange={(event) =>
                      setAddressDraft((prev) => ({
                        ...prev,
                        recipientPhone: event.target.value,
                      }))
                    }
                    placeholder="Số điện thoại"
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Địa chỉ"
                      value={addressDraft.fullAddress}
                      onChange={(event) =>
                        setAddressDraft((prev) => ({
                          ...prev,
                          fullAddress: event.target.value,
                        }))
                      }
                      placeholder="Địa chỉ giao hàng"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Ghi chú"
                      value={addressDraft.note}
                      onChange={(event) =>
                        setAddressDraft((prev) => ({
                          ...prev,
                          note: event.target.value,
                        }))
                      }
                      placeholder="Thêm ghi chú cho shipper"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddressEditing(false)}
                    >
                      Hủy
                    </Button>
                    <Button type="button" size="sm" onClick={handleSaveAddress}>
                      Lưu địa chỉ
                    </Button>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="rounded-xl border border-brand-gray-200 bg-white p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-brand-gray-100">
                      {item.menuItem.image ? (
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-brand-gray-500">
                          No image
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
                          onClick={() => removeItem(item.menuItem.id)}
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
                              updateQuantity(
                                item.menuItem.id,
                                item.quantity - 1,
                              )
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
                              updateQuantity(
                                item.menuItem.id,
                                item.quantity + 1,
                              )
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
                          updateNotes(item.menuItem.id, event.target.value)
                        }
                        placeholder="Ghi chú cho món này (không bắt buộc)"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-xl border border-brand-gray-200 bg-white p-4">
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
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 transition ${
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

            <section className="rounded-xl border border-brand-gray-200 bg-brand-gray-50 p-4">
              <div className="flex items-center justify-between text-sm text-brand-gray-700">
                <span>Tạm tính</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-brand-gray-700">
                <span>VAT (8%)</span>
                <span>{formatCurrency(cart.tax)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-brand-gray-700">
                <span className="inline-flex items-center gap-1">
                  <Truck size={14} /> Phí giao hàng (mock)
                </span>
                <span>{formatCurrency(SHIPPING_FEE)}</span>
              </div>
              <div className="mt-3 border-t border-brand-gray-200 pt-3">
                <div className="flex items-center justify-between text-base font-bold text-brand-brown">
                  <span>Tổng thanh toán</span>
                  <span>{formatCurrency(cartTotalWithShipping)}</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </Modal>

      {isPlacingOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-brand-brown shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang tạo đơn hàng...
          </div>
        </div>
      )}
    </div>
  );
}
