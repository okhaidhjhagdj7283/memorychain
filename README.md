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
- [Ghi chú kỹ thuật & Lỗi đã fix](#-ghi-chú-kỹ-thuật--lỗi-đã-fix)

---

## 🌟 Tổng Quan Dự Án

**MemoryChain** là ứng dụng Web3 cho phép các gia đình:

- 📸 **Lưu trữ ký ức** (ảnh, video, tài liệu, thư tay, câu chuyện) dưới dạng mã hóa trên **Shelby Blob Storage**
- 👨‍👩‍👧‍👦 **Quản lý gia đình** với phân quyền: Owner, Editor, Viewer, Heir
- 🔐 **Mã hóa đầu cuối (AES)** để bảo vệ ký ức riêng tư
- ⛓️ **Ghi nhận lên Aptos Blockchain** để bất biến và minh bạch
- 📜 **Thiết lập di chúc thừa kế** — tự động chuyển giao quyền truy cập cho thế hệ sau

> **Database**: Dự án dùng **100% SQLite** — không cần cài đặt bất kỳ database server nào (PostgreSQL, MySQL, etc.). File `dev.db` được tự động tạo khi chạy `prisma db push`.

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
│  ┌──────────────────────┐    ┌────────────────────────┐  │
│  │  SQLite (dev.db)     │    │  Shelby Blob Storage   │  │
│  │  Prisma ORM 5.22     │    │  ảnh / video / file    │  │
│  │  packages/db/prisma/ │    │  @shelby-protocol/sdk  │  │
│  └──────────────────────┘    └────────────────────────┘  │
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
| **Database** | **SQLite** (100%, không cần server) | — |
| ORM | Prisma Client | 5.22.0 |
| Blockchain | Aptos (Testnet) | SDK 1.30.x |
| Blob Storage | Shelby Protocol | SDK 0.3.1 |
| Auth | JWT (jose) | 5.x |
| State | TanStack Query | 5.x |
| Forms | React Hook Form | 7.x |
| Icons | Lucide React | 0.460.x |
| Smart Contract | Move Language | — |
| Package Manager | pnpm (workspace monorepo) | 8.x+ |

---

## 📁 Cấu Trúc Thư Mục

```
memorychain/
├── apps/
│   └── web/                          # Next.js web application
│       ├── app/
│       │   ├── api/
│       │   │   ├── auth/             # Xác thực bằng ví Aptos + JWT
│       │   │   ├── blob/             # Upload/Download file qua Shelby
│       │   │   ├── families/         # CRUD gia đình & thành viên
│       │   │   ├── memories/         # CRUD ký ức & mã hóa
│       │   │   └── inheritance/      # Quy tắc thừa kế
│       │   ├── dashboard/            # Trang chính sau đăng nhập
│       │   ├── explore/              # Khám phá ký ức public
│       │   ├── family/               # Quản lý gia đình
│       │   ├── login/                # Trang kết nối ví
│       │   ├── layout.tsx
│       │   └── page.tsx              # Landing page
│       ├── components/
│       │   ├── family/               # Components quản lý gia đình
│       │   ├── layout/               # Header, Sidebar, Navigation
│       │   ├── memory/               # Upload ký ức, gallery
│       │   ├── ui/                   # Button, Modal, Card, Toast...
│       │   └── WalletButton.tsx
│       ├── hooks/                    # Custom React hooks
│       ├── lib/                      # Utilities, helpers
│       ├── types/                    # TypeScript definitions
│       ├── .env.local                # Biến môi trường (copy từ root .env)
│       └── next.config.js
│
├── packages/
│   └── db/                           # Shared database package (@memorychain/db)
│       ├── prisma/
│       │   ├── schema.prisma         # Schema SQLite (provider = "sqlite")
│       │   └── dev.db                # SQLite file — tự tạo sau prisma db push
│       ├── src/
│       │   └── index.ts              # Export PrismaClient
│       └── package.json              # name: "@memorychain/db", exports: "."
│
├── contracts/
│   └── memory_chain/                 # Aptos Move Smart Contract
│       ├── Move.toml
│       └── sources/
│           └── memory_chain.move
│
├── .env                              # Biến môi trường root (không commit)
├── .env.example                      # Template — DATABASE_URL dùng SQLite
├── .npmrc                            # pnpm: link-workspace-packages=true
├── docker-compose.yml                # Prisma Studio (tùy chọn, xem data GUI)
├── package.json                      # Root workspace scripts
├── pnpm-workspace.yaml               # Khai báo apps/* và packages/*
└── start.sh                          # Script khởi động tự động
```

---

## 🗄️ Schema Cơ Sở Dữ Liệu

Dự án dùng **100% SQLite** — file `packages/db/prisma/dev.db`, quản lý qua **Prisma ORM 5.22**.

**Không cần cài đặt bất kỳ database server nào.** File `dev.db` được tự động tạo khi chạy `prisma db push`.

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

### Enum (lưu dạng String trong SQLite)

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

| Yêu cầu | Phiên bản |
|---------|-----------|
| Node.js | 20.x trở lên |
| pnpm | 8.x trở lên |
| OS | Linux / macOS / Windows |
| Ví Aptos | Petra, Pontem, hoặc Martian |
| Database server | ❌ Không cần — dùng SQLite |

---

## 🚀 Cài Đặt & Vận Hành

### Cách 1: Chạy tự động (Khuyến nghị)

```bash
chmod +x start.sh
./start.sh
```

Script `start.sh` sẽ tự động:
1. Kiểm tra Node.js & cài pnpm nếu thiếu
2. Tạo file `.env` (nếu chưa có) với `DATABASE_URL` đường dẫn tuyệt đối
3. Copy `.env` → `apps/web/.env.local`
4. Cài tất cả dependencies (`pnpm install`)
5. Generate Prisma Client & tạo `dev.db`
6. Khởi động Next.js dev server

---

### Cách 2: Thủ công từng bước

#### Bước 1 — Clone & cấu hình

```bash
git clone <repo-url>
cd memorychain

# Tạo .env từ template
cp .env.example .env
cp .env apps/web/.env.local
```

Mở `.env`, sửa `DATABASE_URL` thành đường dẫn tuyệt đối của máy bạn:

```env
# Thay /root/memorychain bằng đường dẫn thực tế
DATABASE_URL="file:/root/memorychain/packages/db/prisma/dev.db"
```

#### Bước 2 — Cài dependencies

```bash
pnpm install --no-frozen-lockfile
```

> ℹ️ File `.npmrc` đã có `link-workspace-packages=true` để pnpm nhận `@memorychain/db` là package nội bộ, không tìm trên npm registry.

#### Bước 3 — Khởi tạo SQLite database

```bash
cd packages/db
DB_PATH="$(pwd)/prisma/dev.db"
DATABASE_URL="file:${DB_PATH}" npx prisma generate
DATABASE_URL="file:${DB_PATH}" npx prisma db push
cd ../..
```

Thành công khi thấy:
```
✔ Your database is now in sync with your Prisma schema.
```

File `packages/db/prisma/dev.db` được tự động tạo.

#### Bước 4 — Khởi động Web

```bash
cd apps/web && pnpm dev
```

Truy cập: **http://localhost:3000** 🎉

---

### Lệnh hữu ích

```bash
# Xem dữ liệu qua Prisma Studio (GUI trình duyệt)
cd packages/db && DATABASE_URL="file:$(pwd)/prisma/dev.db" npx prisma studio

# Generate lại Prisma Client sau khi sửa schema.prisma
pnpm db:generate

# Build production
pnpm build
```

---

## 🌍 Biến Môi Trường

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `DATABASE_URL` | ✅ | SQLite: `file:/đường/dẫn/tuyệt/đối/dev.db` |
| `JWT_SECRET` | ✅ | Khóa bí mật ký JWT token |
| `JWT_EXPIRES_IN` | ✅ | Thời hạn token, vd: `7d` |
| `SHELBY_RPC_URL` | ✅ | URL Shelby Protocol RPC |
| `SHELBY_API_KEY` | ⬜ | API key Shelby (nếu cần) |
| `APTOS_NODE_URL` | ✅ | URL Aptos Full Node |
| `APTOS_NETWORK` | ✅ | `testnet` hoặc `mainnet` |
| `NEXT_PUBLIC_SHELBY_RPC_URL` | ✅ | Shelby URL phía client |
| `NEXT_PUBLIC_APTOS_NETWORK` | ✅ | Aptos network phía client |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL app, vd: `http://localhost:3000` |

> ⚠️ **Quan trọng**: `DATABASE_URL` phải dùng **đường dẫn tuyệt đối** (`file:/root/...`), không dùng relative (`file:./dev.db`) vì Prisma có thể chạy từ nhiều thư mục khác nhau.

---

## ⛓️ Smart Contract (Move)

Contract được viết bằng **Move Language**, deploy trên **Aptos Testnet**.

**Vị trí:** `contracts/memory_chain/sources/memory_chain.move`

### Chức năng chính

- `create_family_record` — Ghi nhận tạo gia đình on-chain
- `register_memory` — Ghi hash ký ức (bất biến)
- `set_inheritance_rule` — Thiết lập quy tắc thừa kế

### Deploy Contract

```bash
# Cài Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3

aptos init

cd contracts/memory_chain
aptos move publish --named-addresses memory_chain=<YOUR_ACCOUNT_ADDRESS>
```

---

## 🔄 Luồng Hoạt Động

```
1. Người dùng kết nối ví Aptos (Petra / Pontem / Martian)
        ↓
2. Ký message xác thực → Server cấp JWT token
        ↓
3. Tạo / tham gia Gia đình (Family)
        ↓
4. Upload Ký ức:
   a. File → Shelby Blob Storage (mã hóa AES nếu private)
   b. Metadata → SQLite Database (dev.db)
   c. Hash → Aptos Blockchain (on-chain, bất biến)
        ↓
5. Chia sẻ với thành viên theo phân quyền (Owner/Editor/Viewer/Heir)
        ↓
6. Thiết lập Thừa kế → Smart contract ghi on-chain
        ↓
7. Người thừa kế unlock ký ức sau sự kiện kích hoạt
```

---

## 🔧 Ghi Chú Kỹ Thuật & Lỗi Đã Fix

### Fix 1 — ERR_PNPM_FETCH_404 (@memorychain/db)

**Triệu chứng:** pnpm tìm `@memorychain/db` trên npm public registry, không thấy.

**Nguyên nhân:** Thiếu `.npmrc` với config workspace.

**Fix:**
```ini
# .npmrc
link-workspace-packages=true
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

Thêm `exports` vào `packages/db/package.json`:
```json
{
  "exports": { ".": "./src/index.ts" }
}
```

---

### Fix 2 — Next.js 15: serverComponentsExternalPackages deprecated

**Triệu chứng:** Warning hoặc lỗi config khi build.

**Fix trong `next.config.js`:**
```js
// ❌ Cũ (Next.js 14)
serverComponentsExternalPackages: ['@prisma/client']

// ✅ Mới (Next.js 15)
serverExternalPackages: ['@prisma/client', 'prisma']
```

---

### Fix 3 — DATABASE_URL path lỗi khi chạy từ thư mục khác

**Triệu chứng:** Prisma báo `Environment variable not found: DATABASE_URL`.

**Nguyên nhân:** Dùng relative path `file:./dev.db` nhưng Prisma chạy từ thư mục khác.

**Fix — dùng đường dẫn tuyệt đối:**
```env
# ✅ Đúng
DATABASE_URL="file:/root/memorychain/packages/db/prisma/dev.db"

# ⚠️ Có thể lỗi
DATABASE_URL="file:./dev.db"
```

Hoặc truyền inline khi chạy lệnh:
```bash
DATABASE_URL="file:$(pwd)/prisma/dev.db" npx prisma db push
```

---

### Fix 4 — node_modules missing / next: not found

**Triệu chứng:** `sh: next: not found` khi chạy `pnpm dev`.

**Fix:**
```bash
cd ~/memorychain
rm -f pnpm-lock.yaml
rm -rf node_modules apps/web/node_modules packages/db/node_modules
pnpm install --no-frozen-lockfile
```

---

## 📄 License

MIT © 2025 MemoryChain Team
