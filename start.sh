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

echo "📦 1. Cài đặt các thư viện (Dependencies)..."
pnpm install

echo "🗄️ 2. Đồng bộ Cơ sở dữ liệu (Prisma db push)..."
cd packages/db
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ Lỗi kết nối Database. Vui lòng kiểm tra lại DATABASE_URL trong file .env"
    exit 1
fi

cd ../../

echo "🌐 3. Khởi động Web Server..."
cd apps/web
pnpm dev
