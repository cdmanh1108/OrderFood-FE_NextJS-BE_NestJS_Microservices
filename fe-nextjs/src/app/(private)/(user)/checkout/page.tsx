'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { checkoutApi, CheckoutPricingResponse } from '@/services/api/checkout.api';
import { orderApi } from '@/services/api/order.api';
import { useUI } from '@/contexts/ui-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { items } = cart;
  const { setSuccess, setError: setErrorStatus } = useUI();
  
  const [pricing, setPricing] = useState<CheckoutPricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [addressId, setAddressId] = useState<string>(''); // Will hook up to real addresses later
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // Load cart and calculate checkout
  useEffect(() => {
    if (items.length === 0) {
      setErrorStatus('Giỏ hàng trống');
      router.push('/order-food');
      return;
    }
    
    calculatePricing();
  }, [items, addressId]);

  const calculatePricing = async () => {
    try {
      setLoading(true);
      const payload = {
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          unitPrice: i.menuItem.price,
        })),
        shippingAddressId: addressId || undefined,
      };
      const result = await checkoutApi.calculate(payload);
      setPricing(result);
    } catch (error: any) {
      setErrorStatus('Lỗi tính toán hóa đơn');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      // Construct the CreateOrderCommand payload
      const orderPayload = {
        channel: 'ONLINE' as const,
        source: 'WEB' as const,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          menuItemName: i.menuItem.name,
          menuItemImageUrl: i.menuItem.image,
          unitPrice: i.menuItem.price,
          quantity: i.quantity,
        })),
        // Mock shipping address for now, since we haven't built the address picker UI yet
        shippingAddress: {
          receiverName: 'Khách hàng',
          receiverPhone: '0987654321',
          province: 'Hà Nội',
          district: 'Cầu Giấy',
          ward: 'Dịch Vọng',
          street: 'Khúc Thừa Dụ',
          detail: 'Số 1',
        },
      };

      await orderApi.create(orderPayload);
      setSuccess('Đặt hàng thành công!');
      clearCart();
      router.push('/order-history');
    } catch (error: any) {
      setErrorStatus('Đặt hàng thất bại');
      console.error(error);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!pricing) return <div className="p-8 text-center">Đang tải hóa đơn...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Thanh Toán</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Cart & Address */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Món đã chọn</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.menuItem.name}</p>
                    <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{(item.menuItem.price * item.quantity).toLocaleString()}đ</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Giao hàng & Thanh toán</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="COD">Thanh toán tiền mặt khi nhận hàng (COD)</option>
                <option value="VNPAY" disabled>Thanh toán qua VNPay (Sắp ra mắt)</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chọn địa chỉ (Demo Phí ship)</label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2"
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
              >
                <option value="">Ăn tại quán (Miễn phí ship)</option>
                <option value="address-1">Địa chỉ nhà (Phí ship 15k)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Col: Bill Summary */}
        <div>
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Hóa đơn</h2>
            
            <div className="space-y-3 text-gray-600 border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between">
                <span>Tổng tiền món</span>
                <span>{pricing.itemsSubtotal.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng</span>
                <span>{pricing.shippingFee.toLocaleString()}đ</span>
              </div>
              {pricing.discountTotal > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Khuyến mãi</span>
                  <span>-{pricing.discountTotal.toLocaleString()}đ</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold">Tổng thanh toán</span>
              <span className="text-2xl font-bold text-orange-500">
                {pricing.grandTotal.toLocaleString()}đ
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {placingOrder ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
