// User & Auth Types
export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  STAFF = "STAFF",
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  order: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
  isActive?: boolean;
}

// MenuItem Types
export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemWithCategory extends MenuItem {
  category: Category;
}

export interface CreateMenuItemInput {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  order: number;
}

export interface UpdateMenuItemInput extends Partial<CreateMenuItemInput> {
  id: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
}

// Table Types
export enum TableStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  RESERVED = "reserved",
  CLEANING = "cleaning",
}

export interface Table {
  id: string;
  number: string;
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableInput {
  number: string;
  seats: number;
}

export interface UpdateTableInput extends Partial<CreateTableInput> {
  id: string;
  status?: TableStatus;
}

// Order Types
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY = "ready",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
  REFUNDED = "refunded",
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId?: string;
  table?: Table;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateOrderInput {
  tableId?: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    note?: string;
  }>;
  note?: string;
}

export interface UpdateOrderInput {
  id: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}

// Cart Types
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  note?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

// Settings Types
export interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  openTime: string;
  closeTime: string;
  taxRate: number;
  currency: string;
  logo?: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeOrders: number;
  availableTables: number;
  topSellingItems: Array<{
    menuItem: MenuItem;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  recentOrders: Order[];
}
