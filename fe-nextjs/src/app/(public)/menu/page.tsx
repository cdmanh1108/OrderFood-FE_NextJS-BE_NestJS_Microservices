"use client";

import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { Button } from '../../components/shared/Button';
import { Badge } from '../../components/shared/Badge';
import { mockMenuItems, mockCategories, getMenuItemsByCategory } from '../../../services/mock-data';
import { formatCurrency } from '../../../utils/cn';
import type { CartItem } from '../../../types';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);

  const displayItems = selectedCategory === 'all' 
    ? mockMenuItems 
    : getMenuItemsByCategory(selectedCategory);

  const addToCart = (menuItemId: string) => {
    const menuItem = mockMenuItems.find((item) => item.id === menuItemId);
    if (!menuItem) return;

    const existingItem = cart.find((item) => item.menuItem.id === menuItemId);
    
    if (existingItem) {
      setCart(cart.map((item) =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { menuItem, quantity: 1 }]);
    }
  };

  const removeFromCart = (menuItemId: string) => {
    const existingItem = cart.find((item) => item.menuItem.id === menuItemId);
    
    if (!existingItem) return;

    if (existingItem.quantity === 1) {
      setCart(cart.filter((item) => item.menuItem.id !== menuItemId));
    } else {
      setCart(cart.map((item) =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    }
  };

  const getItemQuantity = (menuItemId: string): number => {
    const item = cart.find((item) => item.menuItem.id === menuItemId);
    return item?.quantity || 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-brand-white">
      <PublicHeader cartItemsCount={totalItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-brand-brown mb-2">
            Thực Đơn
          </h1>
          <p className="text-lg text-brand-gray-600">
            Chọn món và thưởng thức hương vị truyền thống
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-brand-brown text-white shadow-sm'
                  : 'bg-white text-brand-gray-600 hover:bg-brand-gray-50'
              }`}
            >
              Tất Cả
            </button>
            {mockCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-brand-brown text-white shadow-sm'
                    : 'bg-white text-brand-gray-600 hover:bg-brand-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
          {displayItems.map((item) => {
            const quantity = getItemQuantity(item.id);
            
            return (
              <div
                key={item.id}
                className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-yellow/20 to-brand-amber/20 flex items-center justify-center relative">
                  <span className="text-6xl">🍽️</span>
                  {item.isFeatured && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="warning" size="sm">Đặc Trưng</Badge>
                    </div>
                  )}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="danger">Hết Món</Badge>
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-brand-brown mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-brand-gray-600 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-brand-brown">
                      {formatCurrency(item.price)}
                    </span>
                    
                    {quantity === 0 ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => addToCart(item.id)}
                        disabled={!item.isAvailable}
                        leftIcon={<Plus size={16} />}
                      >
                        Thêm
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-gray-100 hover:bg-brand-gray-200 text-brand-brown transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-semibold text-brand-brown">
                          {quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-yellow hover:bg-brand-amber text-brand-brown transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Cart Summary */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-gray-200 shadow-[var(--shadow-wood)] z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-yellow/20">
                    <ShoppingCart className="text-brand-brown" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-gray-600">
                      {totalItems} món
                    </p>
                    <p className="text-lg font-bold text-brand-brown">
                      {formatCurrency(totalPrice)}
                    </p>
                  </div>
                </div>
                <Button variant="primary" size="lg">
                  Đặt Hàng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
