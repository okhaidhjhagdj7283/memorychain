# 🧬 MemoryChain — Lưu Giữ Ký Ức Gia Đình Trên Blockchain

> Nền tảng lưu trữ ký ức gia đình phi tập trung, sử dụng **Aptos Blockchain**, **Shelby Protocol** và **SQLite** để bảo toàn những kỷ niệm quý giá qua nhiều thế hệ.

---

## 📋 Mục Lục

- [Tổng quan dự án](#-tổng-quan-dự-án)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Schema Cơ sở dữ liệu](#-schema-cơ-sở-dữ-liệu)
- [API Endpoints](#-api-endpoints)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt & Vận hành](#-cài-đặt--vận-hành)
- [Biến môi trường](#-biến-môi-trường)
- [Smart Contract (Move)](#-smart-contract-move)
- [Luồng hoạt động](#-luồng-hoạt-động)

---

## 🌟 Tổng Quan Dự Án

**MemoryChain** là ứng dụng Web3 cho phép các gia đình:

- 📸 **Lưu trữ ký ức** (ảnh, video, tài liệu, thư tay, câu chuyện) dưới dạng mã hóa trên **Shelby Blob Storage**
- 👨‍👩‍👧‍👦 **Quản lý gia đình** với phân quyền: Owner, Editor, Viewer, Heir
- 🔐 **Mã hóa đầu cuối (AES)** để bảo vệ ký ức riêng tư
- ⛓️ **Ghi nhận lên Aptos Blockchain** để bất biến và minh bạch
- 📜 **Thiết lập di chúc thừa kế** — tự động chuyển giao quyền truy cập cho thế hệ sau

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│         Next.js 15 + React 19 + TailwindCSS             │
│   Aptos Wallet Adapter ↔ Petra / Pontem / Martian       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP API
┌────────────────────▼────────────────────────────────────┐
│                 SERVER (Next.js API Routes)               │
│  /api/auth  /api/families  /api/memories                 │
│  /api/blob  /api/inheritance                             │
│                                                         │
│  ┌──────────────┐    ┌──────────────────────────────┐   │
│  │  SQLite DB   │    │     Shelby Blob Storage       │   │
│  │  (Prisma 5)  │    │  (file lớn: ảnh/video/doc)   │   │
│  │  dev.db      │    │  sdk: @shelby-protocol/sdk    │   │
│  └──────────────┘    └──────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Aptos Blockchain (Testnet)               │   │
│  │  Smart Contract Move: memory_chain               │   │
│  │  Ghi hash ký ức + quy tắc thừa kế               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Công Nghệ Sử Dụng

| Lớp | Công nghệ | Phiên bản |
|-----|-----------|-----------|
| Frontend | Next.js | 15.1.0 |
| UI Framework | React | 19.0.0 |
| Styling | TailwindCSS | 3.4.x |
| Animation | Framer Motion | 11.x |
| **Database** | **SQLite (via Prisma)** | **5.22.0** |
| ORM | Prisma Client | 5.22.0 |
| Blockchain | Aptos (Testnet) | SDK 1.30.x |
| Blob Storage | Shelby Protocol | SDK 0.3.1 |
| Auth | JWT (jose) | 5.x |
| State | TanStack Query | 5.x |
| Forms | React Hook Form | 7.x |
| Icons | Lucide React | 0.460.x |
| Smart Contract | Move Language | — |

---

## 📁 Cấu Trúc Thư Mục

```
memorychain/
├── apps/
│   └── web/                        # Next.js web application
│       ├── app/
│       │   ├── api/
│       │   │   ├── auth/           # Xác thực bằng ví Aptos + JWT
│       │   │   ├── blob/           # Upload/Download file qua Shelby
│       │   │   ├── families/       # CRUD gia đình & thành viên
│       │   │   ├── memories/       # CRUD ký ức & mã hóa
│       │   │   └── inheritance/    # Quy tắc thừa kế
│       │   ├── dashboard/          # Trang chính sau đăng nhập
│       │   ├── explore/            # Khám phá ký ức public
│       │   ├── family/             # Quản lý gia đình
│       │   ├── login/              # Trang kết nối ví
│       │   ├── layout.tsx          # Root layout
│       │   └── page.tsx            # Landing page
│       ├── components/
│       │   ├── family/             # Components quản lý gia đình
│       │   ├── layout/             # Header, Sidebar, Navigation
│       │   ├── memory/             # Upload ký ức, hiển thị gallery
│       │   ├── ui/                 # Button, Modal, Card, Toast...
│       │   └── WalletButton.tsx    # Kết nối ví Aptos
│       ├── hooks/                  # Custom React hooks
│       ├── lib/                    # Utilities, Prisma client
│       └── types/                  # TypeScript definitions
│
├── packages/
│   └── db/                         # Database package (shared)
│       ├── prisma/
│       │   └── schema.prisma       # Định nghĩa toàn bộ schema DB
│       └── src/
│           └── index.ts            # Export Prisma client
│
├── contracts/
│   └── memory_chain/               # Aptos Move Smart Contract
│       ├── Move.toml
│       └── sources/
│           └── memory_chain.move   # Logic on-chain
│
├── .env                            # Biến môi trường (không commit)
├── .env.example                    # Template biến môi trường
├── docker-compose.yml              # (Tùy chọn) PostgreSQL + pgAdmin
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml
└── start.sh                        # Script khởi động nhanh
```

---

## 🗄️ Schema Cơ Sở Dữ Liệu

Dự án sử dụng **SQLite** (file `packages/db/prisma/dev.db`) quản lý qua **Prisma ORM**.

> **Lưu ý**: SQLite được chọn cho môi trường development để không cần cài đặt database server. Để production, có thể chuyển sang PostgreSQL bằng cách đổi `provider` trong `schema.prisma`.

### Sơ đồ quan hệ

```
User (walletAddress) ──┬──< FamilyMember >──┐
                       │                    │
                       └──< Family >────────┤
                              │             │
                              ├──< Memory >─┤
                              │      │      │
                              │      └──< Comment >── User
                              │
                              ├──< InheritanceRule >── User (heir)
                              │
                              └──< ActivityLog >── User
```

### Các bảng chính

| Bảng | Mô tả |
|------|-------|
| `users` | Thông tin người dùng, định danh bằng `walletAddress` |
| `families` | Nhóm gia đình, có cài đặt riêng tư |
| `family_members` | Thành viên trong gia đình, phân quyền role |
| `memories` | Ký ức (ảnh/video/tài liệu), metadata & encryption info |
| `comments` | Bình luận trên ký ức |
| `inheritance_rules` | Quy tắc thừa kế tài sản số |
| `activity_logs` | Lịch sử hoạt động hệ thống |

### Enum (dạng String trong SQLite)

```
PrivacyMode:       PRIVATE | FAMILY_ONLY | PUBLIC
MemberRole:        OWNER | EDITOR | VIEWER | HEIR
MemoryType:        PHOTO | VIDEO | AUDIO | DOCUMENT | LETTER | STORY
VisibilityMode:    PRIVATE | FAMILY | PUBLIC
TriggerType:       MANUAL_RELEASE | TIME_LOCK | MULTI_MEMBER_APPROVAL
InheritanceStatus: PENDING | ACTIVE | CLAIMED | REVOKED
```

---

## 🔌 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/auth/login` | Đăng nhập bằng chữ ký ví Aptos |
| `GET` | `/api/auth/me` | Lấy thông tin user hiện tại |
| `GET` | `/api/families` | Danh sách gia đình của user |
| `POST` | `/api/families` | Tạo gia đình mới |
| `GET` | `/api/families/[id]` | Chi tiết một gia đình |
| `POST` | `/api/families/[id]/members` | Thêm thành viên |
| `GET` | `/api/memories` | Danh sách ký ức |
| `POST` | `/api/memories` | Tạo ký ức mới |
| `GET` | `/api/memories/[id]` | Chi tiết ký ức |
| `DELETE` | `/api/memories/[id]` | Xóa ký ức |
| `POST` | `/api/blob/upload` | Upload file lên Shelby |
| `GET` | `/api/blob/[name]` | Lấy file từ Shelby |
| `GET` | `/api/inheritance` | Danh sách quy tắc thừa kế |
| `POST` | `/api/inheritance` | Tạo quy tắc thừa kế |

---

## 💻 Yêu Cầu Hệ Thống

| Yêu cầu | Phiên bản tối thiểu |
|---------|---------------------|
| Node.js | 20.x trở lên |
| pnpm | 8.x trở lên |
| Hệ điều hành | Linux / macOS / Windows |
| Ví Aptos | Petra, Pontem, hoặc Martian |

> **SQLite không cần cài đặt thêm** — file database được tự động tạo tại `packages/db/prisma/dev.db`

---

## 🚀 Cài Đặt & Vận Hành

### Cách 1: Chạy tự động (Khuyến nghị)

```bash
# Cấp quyền thực thi và chạy
chmod +x start.sh
./start.sh
```

Script sẽ tự động:
1. Kiểm tra Node.js và cài pnpm nếu thiếu
2. Cài đặt tất cả dependencies
3. Đồng bộ schema lên SQLite database
4. Khởi động Next.js dev server

---

### Cách 2: Chạy từng bước

#### Bước 1 — Clone & cài đặt

```bash
git clone <repo-url>
cd memorychain
pnpm install
```

#### Bước 2 — Cấu hình môi trường

```bash
cp .env.example .env
```

Mở file `.env` và chỉnh sửa:

```env
# Database (SQLite — không cần thay đổi cho local)
DATABASE_URL="file:./dev.db"

# Auth
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Shelby Protocol (Blob Storage)
SHELBY_RPC_URL="https://api.testnet.shelby.xyz/shelby"
SHELBY_API_KEY=""

# Aptos Blockchain
APTOS_NODE_URL="https://api.testnet.aptoslabs.com/v1"
APTOS_NETWORK="testnet"

# Next.js Public
NEXT_PUBLIC_SHELBY_RPC_URL="https://api.testnet.shelby.xyz/shelby"
NEXT_PUBLIC_APTOS_NETWORK="testnet"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Bước 3 — Đồng bộ Database

```bash
cd packages/db
npx prisma db push
```

Lệnh này sẽ:
- Tự tạo file `dev.db` nếu chưa có
- Tạo toàn bộ bảng theo `schema.prisma`

*(Thành công khi thấy: `✔ Generated Prisma Client`)*

#### Bước 4 — Khởi động Web

```bash
cd ../../apps/web
pnpm dev
```

Truy cập: **http://localhost:3000** 🎉

---

### Lệnh hữu ích khác

```bash
# Xem dữ liệu qua Prisma Studio (GUI)
pnpm db:studio

# Generate lại Prisma Client sau khi sửa schema
pnpm db:generate

# Chạy migration (nếu dùng PostgreSQL production)
pnpm db:migrate

# Build production
pnpm build
```

---

## 🌍 Biến Môi Trường

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `DATABASE_URL` | ✅ | Đường dẫn SQLite: `file:./dev.db` |
| `JWT_SECRET` | ✅ | Khóa bí mật để ký JWT token |
| `JWT_EXPIRES_IN` | ✅ | Thời gian sống của token (vd: `7d`) |
| `SHELBY_RPC_URL` | ✅ | URL Shelby Protocol RPC |
| `SHELBY_API_KEY` | ⬜ | API key Shelby (nếu cần) |
| `APTOS_NODE_URL` | ✅ | URL Aptos Full Node |
| `APTOS_NETWORK` | ✅ | `testnet` hoặc `mainnet` |
| `NEXT_PUBLIC_SHELBY_RPC_URL` | ✅ | Shelby URL phía client |
| `NEXT_PUBLIC_APTOS_NETWORK` | ✅ | Aptos network phía client |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL ứng dụng (vd: `http://localhost:3000`) |

---

## ⛓️ Smart Contract (Move)

Contract được viết bằng **Move Language** và deploy trên **Aptos Testnet**.

**Vị trí:** `contracts/memory_chain/sources/memory_chain.move`

### Chức năng chính

- `create_family_record` — Ghi nhận tạo gia đình on-chain
- `register_memory` — Ghi hash của ký ức (bất biến)
- `set_inheritance_rule` — Thiết lập quy tắc thừa kế

### Deploy Contract

```bash
# Cài Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

# Init account
aptos init

# Deploy lên testnet
cd contracts/memory_chain
aptos move publish --named-addresses memory_chain=<YOUR_ACCOUNT_ADDRESS>
```

---

## 🔄 Luồng Hoạt Động

```
1. Người dùng kết nối ví Aptos (Petra/Pontem/Martian)
        ↓
2. Ký message xác thực → Server tạo JWT token
        ↓
3. Tạo/tham gia Gia đình (Family)
        ↓
4. Upload Ký ức:
   a. File → Shelby Blob Storage (mã hóa AES nếu private)
   b. Metadata → SQLite Database
   c. Hash → Aptos Blockchain (on-chain record)
        ↓
5. Chia sẻ với thành viên gia đình theo phân quyền
        ↓
6. Thiết lập Thừa kế → Smart contract ghi on-chain
        ↓
7. Người thừa kế unlock ký ức sau sự kiện kích hoạt
```

---

## 🗒️ Ghi Chú Phát Triển

### Chuyển sang PostgreSQL (Production)

Nếu muốn dùng PostgreSQL thay SQLite:

1. Sửa `packages/db/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Đổi từ "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Cập nhật `DATABASE_URL` trong `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/memorychain"
   ```

3. Chạy lại:
   ```bash
   cd packages/db && npx prisma db push
   ```

   Hoặc dùng Docker Compose đã có sẵn:
   ```bash
   docker-compose up -d
   ```
   *(PostgreSQL sẽ chạy tại `localhost:5432`, pgAdmin tại `http://localhost:5050`)*

---

## 📄 License

MIT © 2025 MemoryChain Team
