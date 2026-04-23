import type {
  User,
  Category,
  MenuItem,
  Table,
  Order,
  DashboardStats,
  RestaurantSettings,
} from '../types';
import { UserRole, TableStatus, OrderStatus, PaymentStatus } from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn Admin',
    phone: '0912345678',
    role: UserRole.ADMIN,
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
  },
  {
    id: '2',
    name: 'Trần Thị Quản Lý',
    phone: '0923456789',
    role: UserRole.USER,
    createdAt: '2024-01-15T00:00:00Z',
    isActive: true,
  },
  {
    id: '3',
    name: 'Lê Văn Nhân Viên',
    phone: '0934567890',
    role: UserRole.STAFF,
    createdAt: '2024-02-01T00:00:00Z',
    isActive: true,
  },
];

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Bún Đậu',
    slug: 'bun-dau',
    description: 'Các món bún đậu đặc trưng',
    order: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Mắm Tôm',
    slug: 'mam-tom',
    description: 'Các loại mắm tôm',
    order: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Món Ăn Kèm',
    slug: 'mon-an-kem',
    description: 'Các món ăn kèm',
    order: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Đồ Uống',
    slug: 'do-uong',
    description: 'Nước giải khát',
    order: 4,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    categoryId: '1',
    name: 'Bún Đậu Mắm Tôm',
    slug: 'bun-dau-mam-tom',
    description: 'Bún đậu truyền thống kèm mắm tôm chuẩn vị',
    price: 45000,
    isAvailable: true,
    isFeatured: true,
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    categoryId: '1',
    name: 'Bún Đậu Chả Cốm',
    slug: 'bun-dau-cha-com',
    description: 'Bún đậu kèm chả cốm thơm ngon',
    price: 50000,
    isAvailable: true,
    isFeatured: true,
    order: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    categoryId: '1',
    name: 'Bún Đậu Nem Chua Rán',
    slug: 'bun-dau-nem-chua-ran',
    description: 'Bún đậu kèm nem chua rán giòn rụm',
    price: 55000,
    isAvailable: true,
    isFeatured: false,
    order: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    categoryId: '2',
    name: 'Mắm Tôm Chuẩn Vị',
    slug: 'mam-tom-chuan-vi',
    description: 'Mắm tôm truyền thống',
    price: 10000,
    isAvailable: true,
    isFeatured: false,
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    categoryId: '2',
    name: 'Mắm Tôm Đặc Biệt',
    slug: 'mam-tom-dac-biet',
    description: 'Mắm tôm pha chế đặc biệt',
    price: 15000,
    isAvailable: true,
    isFeatured: false,
    order: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    categoryId: '3',
    name: 'Chả Cốm',
    slug: 'cha-com',
    description: 'Chả cốm Hà Nội thơm ngon',
    price: 20000,
    isAvailable: true,
    isFeatured: false,
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    categoryId: '3',
    name: 'Nem Chua Rán',
    slug: 'nem-chua-ran',
    description: 'Nem chua rán giòn tan',
    price: 25000,
    isAvailable: true,
    isFeatured: false,
    order: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '8',
    categoryId: '3',
    name: 'Chả Lụa',
    slug: 'cha-lua',
    description: 'Chả lụa Hà Nội',
    price: 15000,
    isAvailable: true,
    isFeatured: false,
    order: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '9',
    categoryId: '4',
    name: 'Trà Đá',
    slug: 'tra-da',
    description: 'Trà đá miễn phí',
    price: 0,
    isAvailable: true,
    isFeatured: false,
    order: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '10',
    categoryId: '4',
    name: 'Nước Ngọt',
    slug: 'nuoc-ngot',
    description: 'Các loại nước ngọt',
    price: 15000,
    isAvailable: true,
    isFeatured: false,
    order: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Tables
export const mockTables: Table[] = [
  {
    id: '1',
    number: 'B01',
    seats: 4,
    status: TableStatus.AVAILABLE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    number: 'B02',
    seats: 4,
    status: TableStatus.OCCUPIED,
    currentOrderId: 'ORD001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    number: 'B03',
    seats: 6,
    status: TableStatus.AVAILABLE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    number: 'B04',
    seats: 2,
    status: TableStatus.RESERVED,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    number: 'B05',
    seats: 8,
    status: TableStatus.OCCUPIED,
    currentOrderId: 'ORD002',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    orderNumber: '#001',
    tableId: '2',
    table: mockTables[1],
    customerName: 'Khách hàng A',
    customerPhone: '0901234567',
    items: [
      {
        id: '1',
        menuItemId: '1',
        menuItem: mockMenuItems[0],
        quantity: 2,
        price: 45000,
      },
      {
        id: '2',
        menuItemId: '6',
        menuItem: mockMenuItems[5],
        quantity: 1,
        price: 20000,
      },
    ],
    subtotal: 110000,
    tax: 11000,
    total: 121000,
    status: OrderStatus.PREPARING,
    paymentStatus: PaymentStatus.UNPAID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ORD002',
    orderNumber: '#002',
    tableId: '5',
    table: mockTables[4],
    customerName: 'Khách hàng B',
    items: [
      {
        id: '3',
        menuItemId: '2',
        menuItem: mockMenuItems[1],
        quantity: 3,
        price: 50000,
      },
      {
        id: '4',
        menuItemId: '7',
        menuItem: mockMenuItems[6],
        quantity: 2,
        price: 25000,
      },
    ],
    subtotal: 200000,
    tax: 20000,
    total: 220000,
    status: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.UNPAID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  todayRevenue: 2450000,
  todayOrders: 42,
  activeOrders: 8,
  availableTables: 12,
  topSellingItems: [
    {
      menuItem: mockMenuItems[0],
      totalQuantity: 45,
      totalRevenue: 2025000,
    },
    {
      menuItem: mockMenuItems[1],
      totalQuantity: 32,
      totalRevenue: 1600000,
    },
    {
      menuItem: mockMenuItems[2],
      totalQuantity: 28,
      totalRevenue: 1540000,
    },
  ],
  recentOrders: mockOrders,
};

// Mock Restaurant Settings
export const mockSettings: RestaurantSettings = {
  name: 'Bún Đậu Làng Mơ',
  address: '123 Phố Huế, Hai Bà Trưng, Hà Nội',
  phone: '024.3456.7890',
  email: 'bundaulangmo@gmail.com',
  openTime: '08:00',
  closeTime: '22:00',
  taxRate: 10,
  currency: 'VND',
};

// Helper function to get menu items by category
export function getMenuItemsByCategory(categoryId: string): MenuItem[] {
  return mockMenuItems.filter((item) => item.categoryId === categoryId);
}

// Helper function to get category by id
export function getCategoryById(id: string): Category | undefined {
  return mockCategories.find((cat) => cat.id === id);
}

// Helper function to get menu item by id
export function getMenuItemById(id: string): MenuItem | undefined {
  return mockMenuItems.find((item) => item.id === id);
}

