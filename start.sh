#!/bin/bash

echo "🚀 Bắt đầu vận hành MemoryChain..."

# Kiểm tra Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Không tìm thấy Node.js. Vui lòng cài đặt Node.js v20."
    exit 1
fi

# Kiểm tra pnpm
if ! command -v pnpm &> /dev/null
then
    echo "⚠️ Không tìm thấy pnpm. Đang tự động cài đặt pnpm..."
    npm install -g pnpm
fi

# Tạo .env nếu chưa có
if [ ! -f .env ]; then
    echo "📋 Chưa có file .env — tự động tạo từ .env.example..."
    cp .env.example .env
    # Dùng đường dẫn tuyệt đối để tránh lỗi khi chạy từ nhiều thư mục
    DB_PATH="$(pwd)/packages/db/prisma/dev.db"
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"file:${DB_PATH}\"|" .env
    echo "✅ Đã tạo .env với DATABASE_URL=file:${DB_PATH}"
fi

# Copy .env sang apps/web/.env.local nếu chưa có
if [ ! -f apps/web/.env.local ]; then
    cp .env apps/web/.env.local
    echo "✅ Đã copy .env → apps/web/.env.local"
fi

echo "📦 1. Cài đặt các thư viện (pnpm workspace)..."
pnpm install --no-frozen-lockfile

if [ $? -ne 0 ]; then
    echo "❌ Lỗi cài đặt dependencies. Thử xóa lockfile và cài lại..."
    rm -f pnpm-lock.yaml
    pnpm install --no-frozen-lockfile
fi

echo "🗄️ 2. Đồng bộ SQLite Database (Prisma db push)..."
DB_PATH="$(pwd)/packages/db/prisma/dev.db"
cd packages/db
DATABASE_URL="file:${DB_PATH}" npx prisma generate
DATABASE_URL="file:${DB_PATH}" npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Lỗi đồng bộ database. Kiểm tra lại schema.prisma"
    exit 1
fi

echo "✅ SQLite database sẵn sàng tại: ${DB_PATH}"
cd ../../

echo "🌐 3. Khởi động Web Server..."
cd apps/web
pnpm dev
