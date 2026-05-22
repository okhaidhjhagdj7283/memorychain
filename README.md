# Hướng dẫn Vận hành MemoryChain MVP

Dự án MemoryChain đã được lập trình hoàn chỉnh. Dưới đây là hướng dẫn từng bước để bạn tự vận hành (chạy) dự án trên máy của mình.

## Yêu cầu hệ thống
1. **Node.js**: Phiên bản 20.x trở lên.
2. **pnpm**: Trình quản lý package (cài bằng `npm install -g pnpm`).
3. **Cơ sở dữ liệu PostgreSQL**: Vì bạn đang chạy ở user thường và không dùng được Docker/Sudo, cách nhanh nhất là dùng một database đám mây miễn phí như **Supabase** (https://supabase.com) hoặc **Neon** (https://neon.tech).

---

## Bước 1: Cấu hình môi trường (Biến môi trường)
Mở file `.env` ở thư mục gốc (`/home/vity/memorychain/.env`) và cấu hình các thông số sau:

```env
# 1. Điền đường dẫn kết nối PostgreSQL của bạn (Ví dụ dùng Supabase/Neon)
DATABASE_URL="postgresql://user:password@host:port/dbname"

# 2. Các cấu hình Shelby và Aptos (Đã được cấu hình sẵn cho Testnet)
NEXT_PUBLIC_SHELBY_RPC_URL="https://api.testnet.shelby.xyz/shelby"
NEXT_PUBLIC_APTOS_NODE_URL="https://fullnode.testnet.aptoslabs.com/v1"
NEXT_PUBLIC_APTOS_NETWORK="testnet"
```

## Bước 2: Cài đặt thư viện
Mở Terminal tại thư mục `/home/vity/memorychain` và chạy lệnh:
```bash
pnpm install
```

## Bước 3: Đồng bộ Database
Khởi tạo cấu trúc bảng (Schema) vào cơ sở dữ liệu PostgreSQL của bạn. Chạy lệnh:
```bash
cd packages/db
npx prisma db push
cd ../../
```
*(Nếu thành công, bảng `User`, `Family`, `Memory`, `InheritanceRule` sẽ được tạo trên DB của bạn).*

## Bước 4: Khởi động Ứng dụng
Cuối cùng, khởi động Next.js server để bắt đầu trải nghiệm:
```bash
cd apps/web
pnpm dev
```

Server sẽ chạy tại địa chỉ: **http://localhost:3000**

---

## Tóm tắt các thao tác nhanh (Chạy lệnh tự động)
Bạn có thể chạy toàn bộ tiến trình trên chỉ bằng 1 dòng lệnh (sau khi đã điền đúng `DATABASE_URL`):

```bash
pnpm install && cd packages/db && npx prisma db push && cd ../../apps/web && pnpm dev
```
