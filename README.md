# 🍜 Bún Đậu Làng Mơ - Hệ Thống Quản Lý Đặt Món Đa Dịch Vụ (Microservices)

Hệ thống quản lý đặt món ăn (Order Food) toàn diện, hỗ trợ từ việc đặt món tại bàn (Dine-in) qua QR Code cho đến giao hàng tận nơi (Online Delivery). Dự án được xây dựng trên kiến trúc Microservices hiện đại, đảm bảo tính mở rộng và hiệu năng cao.

---

## 🏗️ Kiến Trúc Hệ Thống & Công Nghệ

Dự án chia làm 2 phần chính:
- **Backend**: NestJS Microservices kết hợp RabbitMQ.
- **Frontend**: Next.js 14+ (App Router) với giao diện hiện đại.

### 🚀 Công nghệ sử dụng
- **Framework**: NestJS, Next.js (TypeScript).
- **Database**: PostgreSQL (Prisma ORM).
- **Giao tiếp liên dịch vụ**: RabbitMQ (Message Queue).
- **Caching/Auth**: Redis, JWT (Access/Refresh Token).
- **Storage**: AWS S3 / Cloudfront (quản lý qua Media Service).
- **UI/UX**: TailwindCSS, Lucide Icons, Framer Motion.

---

## 📊 Sơ đồ Database (ERD)

Hệ thống sử dụng cơ sở dữ liệu phân tán, mỗi dịch vụ sở hữu DB riêng để đảm bảo tính độc lập.

![ERD Database Diagram](https://res.cloudinary.com/mysocialmediaweb/image/upload/v1778143500/weatherforecast_user_avatar/jdcno6i1cqu7lazowvh1.png) 
*(Gắn link ảnh ERD của bạn vào đây)*

---

## 🌟 Các Chức Năng Chính

### 1. Dành cho Khách hàng (User)
- **Đặt món tại bàn (Dine-in)**: Quét mã QR tại bàn để xem thực đơn và đặt món trực tiếp.
  
  
  | ![QR Vào Bàn](https://res.cloudinary.com/mysocialmediaweb/image/upload/v1778221846/weatherforecast_user_avatar/nqkznxqzct5rpu0ytgds.png) | ![QR Đặt Món](https://res.cloudinary.com/mysocialmediaweb/image/upload/v1778221913/weatherforecast_user_avatar/ud2vb53cmxekunkpw16s.png) |
  | :---: | :---: |
  | *QR Vào Bàn* | *QR Đặt Món* |


- **Đặt món giao hàng (Online)**: Tìm kiếm món ăn, quản lý giỏ hàng và đặt hàng về địa chỉ cá nhân.
- **Dashboard cá nhân**: Theo dõi tổng đơn hàng, tổng chi tiêu và lịch sử 5 đơn hàng gần nhất theo thời gian thực.
- **Hỗ trợ khách hàng**: Hệ thống gửi yêu cầu hỗ trợ và nhận thông báo.

### 2. Dành cho Quản trị & Nhân viên (Admin/Staff)
- **Quản lý Bàn & QR Code**: 
  - Tạo bàn ăn mới, hệ thống tự động sinh QR Code duy nhất chứa link định danh bàn.
  - Quản lý trạng thái bàn (Còn trống, Đang dùng, Đang dọn, Đã đặt).
- **Quản lý Đơn hàng (Order Management)**: 
  - Tách biệt luồng đơn hàng "Tại quán" và "Giao hàng".
  - Tự động đồng bộ trạng thái thanh toán (`PAID`) cho tất cả đơn hàng liên quan khi đóng phiên bàn.
- **Quản lý Thực đơn**: Quản lý danh mục, món ăn, giá cả và hình ảnh thông qua Media Service.

### 3. Dành cho Người giao hàng (Shipper)
- **Hệ thống Delivery**: Nhận đơn hàng Online, cập nhật lộ trình và trạng thái giao hàng.
- **Bằng chứng giao hàng**: Chụp ảnh và gửi xác nhận khi hoàn tất đơn hàng.

---

## 🛠️ Cấu Trúc Microservices

| Service | Chức năng chính | Trạng thái |
| :--- | :--- | :--- |
| **Gateway** | Cổng điều phối API, xác thực JWT và định tuyến yêu cầu. | ✅ Hoàn thiện |
| **IAM Service** | Quản lý định danh, phân quyền (RBAC) và Profile người dùng. | ✅ Hoàn thiện |
| **Catalog Service** | Quản lý thực đơn, danh mục và kho hàng. | ✅ Hoàn thiện |
| **Ordering Service** | Xử lý logic đặt hàng, tính toán giá và trạng thái thanh toán. | ✅ Hoàn thiện |
| **Dine-in Service** | Quản lý bàn ăn, phiên làm việc tại quán và tích hợp QR Code. | ✅ Hoàn thiện |
| **Delivery Service** | Điều phối Shipper, theo dõi vị trí và nhiệm vụ giao hàng. | 🚧 Đang code |
| **Media Service** | Xử lý upload ảnh và quản lý tệp tin tập trung. | ✅ Hoàn thiện |
| **Payment Service** | Tích hợp các cổng thanh toán (VNPay, Momo). | ✅ Hoàn thiện |
| **Notification Service** | Gửi thông báo đẩy, Email và SMS. | ⏳ Sắp phát triển |
| **Review Service** | Hệ thống đánh giá món ăn và chất lượng dịch vụ. | ⏳ Sắp phát triển |

---

## 📅 Lộ trình phát triển (Upcoming Features)

Hệ thống đang tiếp tục được mở rộng với các tính năng sau:
1. **Tích hợp Thanh toán (Payment Service)**: 
   - Hỗ trợ thanh toán Online qua VNPay, ZaloPay và Momo.
   - Xử lý hoàn tiền tự động.
2. **Hệ thống Thông báo (Notification Service)**:
   - Gửi thông báo trạng thái đơn hàng thời gian thực qua Web Push.
   - Gửi hóa đơn điện tử qua Email sau khi hoàn tất đơn hàng.
3. **Đánh giá & Phản hồi (Review Service)**:
   - Cho phép khách hàng đánh giá món ăn và dịch vụ kèm hình ảnh.
   - Thống kê xếp hạng món ăn được yêu thích nhất.
4. **Hệ thống Điểm thưởng (Loyalty Program)**:
   - Tích lũy điểm khi đặt hàng và đổi mã giảm giá.
5. **Báo cáo & Phân tích (Analytics)**:
   - Dashboard cho Admin theo dõi doanh thu, biểu đồ tăng trưởng và hiệu suất shipper.


---

## ⚙️ Cài đặt & Khởi chạy

### Yêu cầu hệ thống
- Node.js >= 18
- Docker (để chạy PostgreSQL, RabbitMQ, Redis)

### Khởi chạy Backend
1. Cài đặt dependency: `npm install`
2. Thiết lập file `.env` cho từng service.
3. Chạy các container cần thiết: `docker-compose up -d`
4. Khởi chạy toàn bộ services: `npm run start:all`

### Khởi chạy Frontend
1. Truy cập thư mục: `cd fe-nextjs`
2. Cài đặt dependency: `npm install`
3. Chạy môi trường dev: `npm run dev`

---

## 📝 Giấy phép
Dự án được phát triển bởi **Châu Mạnh** (cdmanh1108). 
