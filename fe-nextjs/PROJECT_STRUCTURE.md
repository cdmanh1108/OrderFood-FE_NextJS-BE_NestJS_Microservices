# Bún Đậu Làng Mơ - Hệ Thống Quản Lý Nhà Hàng

## 📋 Tổng Quan

Hệ thống quản lý nhà hàng toàn diện cho "Bún Đậu Làng Mơ" với thiết kế ấm áp phong cách Bắc Bộ, xây dựng với React, TypeScript, Tailwind CSS v4, và React Router.

### ✨ Tính Năng Chính

**Public Site:**
- Trang chủ với hero section, món ăn nổi bật
- Trang menu với filter theo danh mục, thêm món vào giỏ hàng
- Responsive đầy đủ (Mobile 390px, Tablet 768px, Desktop 1440px+)

**Dashboard Quản Trị:**
- Tổng quan với thống kê real-time
- Quản lý nhân viên (CRUD + phân quyền)
- Quản lý danh mục món ăn
- Quản lý món ăn (tên, giá, hình ảnh, trạng thái)
- Quản lý bàn ăn với trạng thái
- Quản lý đơn hàng với workflow đầy đủ
- Cài đặt nhà hàng

## 🗂️ Cấu Trúc Thư Mục

```
/src
├── /app
│   ├── App.tsx                      # Root component với RouterProvider
│   ├── routes.tsx                   # Route configuration
│   │
│   ├── /(public)                    # Public pages
│   │   ├── page.tsx                 # Home page
│   │   └── /menu
│   │       └── page.tsx             # Menu page
│   │
│   ├── /(auth)                      # Auth pages
│   │   └── /login
│   │       └── page.tsx             # Login page
│   │
│   ├── /(private)                   # Protected pages
│   │   └── /dashboard
│   │       ├── page.tsx             # Dashboard overview
│   │       ├── /staff/page.tsx      # Staff management
│   │       ├── /category/page.tsx   # Category management
│   │       ├── /menu-item/page.tsx  # Menu item management
│   │       ├── /tables/page.tsx     # Table management
│   │       ├── /orders/page.tsx     # Order management
│   │       └── /settings/page.tsx   # Settings
│   │
│   ├── /not-found
│   │   └── page.tsx                 # 404 page
│   │
│   └── /components
│       ├── /shared                  # Shared components
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── PasswordInput.tsx
│       │   ├── Modal.tsx
│       │   ├── Badge.tsx
│       │   ├── Alert.tsx
│       │   ├── EmptyState.tsx
│       │   ├── LoadingOverlay.tsx
│       │   ├── ConfirmDialog.tsx
│       │   └── DataTable.tsx
│       │
│       └── /layout                  # Layout components
│           ├── Sidebar.tsx
│           ├── MobileSidebar.tsx
│           ├── DashboardHeader.tsx
│           ├── DashboardLayout.tsx
│           └── PublicHeader.tsx
│
├── /types
│   └── index.ts                     # TypeScript types & interfaces
│
├── /contexts
│   └── auth-context.tsx             # Authentication context
│
├── /services
│   └── mock-data.ts                 # Mock data for development
│
├── /utils
│   └── cn.ts                        # Utility functions
│
└── /styles
    ├── index.css
    ├── tailwind.css
    ├── theme.css                    # Design tokens & CSS variables
    └── fonts.css
```

## 🎨 Design System

### Color Palette

```css
--color-brand-yellow: #FBC02D      /* Primary accent */
--color-brand-amber: #F59E0B       /* Secondary accent */
--color-brand-brown: #5D4037       /* Primary text & CTA */
--color-brand-coffee: #6D4C41      /* Hover states */
--color-brand-green: #388E3C       /* Success states */
--color-brand-beige: #FFF8E1       /* Background tint */
--color-brand-white: #FAFAFA       /* Main background */
--color-brand-danger: #DC2626      /* Error & destructive */
```

### Spacing Scale

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Border Radius

- card: 16px
- input: 12px
- button: 10px
- sm: 8px

### Shadows

- input: `0 2px 15px rgba(0, 0, 0, 0.08)`
- wood: `0 4px 20px rgba(93, 64, 55, 0.15)`
- card: `0 1px 3px rgba(0, 0, 0, 0.1)`
- hover: `0 4px 12px rgba(0, 0, 0, 0.12)`

## 📱 Responsive Breakpoints

- Mobile: 390px - 767px
- Tablet: 768px - 1439px
- Desktop: 1440px+

## 🔐 Authentication Flow

1. User accesses `/login`
2. Enter phone number and password
3. AuthContext validates credentials against mock data
4. On success: store user in localStorage, redirect to `/dashboard`
5. Protected routes check authentication via `useAuth()` hook

### Demo Accounts

```
Admin:    0912345678 (any password)
Manager:  0923456789 (any password)
Staff:    0934567890 (any password)
```

## 🧩 Component Architecture

### Shared Components

**Button** - Variants: primary, secondary, outline, ghost, danger
**Input** - With label, error, helper text, icons
**PasswordInput** - Auto toggle visibility
**Modal** - Customizable header, body, footer
**Badge** - Status indicators
**Alert** - Success, error, warning, info
**DataTable** - Generic table with sorting, actions
**ConfirmDialog** - Confirmation prompts
**EmptyState** - No data states
**LoadingOverlay** - Loading indicators

### Layout Components

**Sidebar** - Desktop navigation
**MobileSidebar** - Mobile drawer navigation
**DashboardHeader** - Top bar with user info
**DashboardLayout** - Wraps dashboard pages
**PublicHeader** - Public site header

## 🔄 State Management

- **AuthContext**: Global authentication state
- **Local State**: Component-level state with useState
- **Mock Data**: Service layer for demo data

## 🚀 Migration to Next.js 15

### Steps to Migrate

1. **Install Next.js dependencies:**
   ```bash
   npm install next@15 react react-dom
   ```

2. **Move pages to App Router structure:**
   - `src/app/(public)/page.tsx` → `app/(public)/page.tsx`
   - Keep the same route grouping structure

3. **Update imports:**
   - `react-router` → Next.js navigation
   - `Link` from `next/link`
   - `useRouter` from `next/navigation`

4. **Convert to Server/Client Components:**
   - Add `"use client"` to interactive components
   - Keep static pages as Server Components

5. **Environment Variables:**
   - Create `.env.local` for API keys
   - Use `NEXT_PUBLIC_` prefix for client-side vars

6. **API Routes:**
   - Create `app/api` directory
   - Implement real backend endpoints
   - Replace mock data with API calls

## 📝 TypeScript Types

All types defined in `/src/types/index.ts`:

- User, UserRole, LoginCredentials
- Category, CreateCategoryInput, UpdateCategoryInput
- MenuItem, MenuItemWithCategory
- Table, TableStatus
- Order, OrderStatus, PaymentStatus, OrderItem
- Cart, CartItem
- ApiResponse, PaginatedResponse
- RestaurantSettings, DashboardStats

## 🛠️ Development Guidelines

### Naming Conventions

- Components: PascalCase (e.g., `Button.tsx`)
- Files: kebab-case for pages (e.g., `menu-item/page.tsx`)
- Functions: camelCase (e.g., `handleSubmit`)
- Types: PascalCase (e.g., `UserRole`)

### Component States

All interactive components support these states:
- Default
- Hover
- Active
- Focus
- Disabled
- Loading
- Error
- Success

### Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus visible states
- Color contrast compliance

## 🧪 Testing Checklist

- [ ] All routes accessible
- [ ] Authentication flow works
- [ ] CRUD operations on all entities
- [ ] Form validation
- [ ] Responsive on all breakpoints
- [ ] Error states display correctly
- [ ] Loading states show properly
- [ ] Modal interactions work
- [ ] Navigation works on mobile
- [ ] 404 page displays

## 📦 Build & Deploy

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Future Enhancements

- [ ] Real backend API integration
- [ ] Image upload for menu items
- [ ] Real-time order updates (WebSocket)
- [ ] Print receipts
- [ ] QR code ordering
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Analytics dashboard
- [ ] Export reports (PDF, Excel)
- [ ] Payment gateway integration

## 📄 License

Proprietary - Bún Đậu Làng Mơ © 2026
