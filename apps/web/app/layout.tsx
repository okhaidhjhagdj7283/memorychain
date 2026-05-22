import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'MemoryChain — Lưu trữ ký ức gia đình phi tập trung',
  description: 'Nền tảng lưu trữ ký ức gia đình phi tập trung trên Shelby Protocol & Aptos. Lưu ảnh, video, câu chuyện gia đình an toàn, mãi mãi.',
  keywords: 'MemoryChain, ký ức gia đình, lưu trữ phi tập trung, Shelby, Aptos, blockchain',
  openGraph: {
    title: 'MemoryChain',
    description: 'Lưu trữ ký ức gia đình phi tập trung',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
