'use client'

import Link from 'next/link'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import {
  ArrowRight, Shield, Lock, Star, Check, Heart,
} from 'lucide-react'


export default function LandingPage() {
  const { connected } = useWallet()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none bg-grid opacity-50" />
      <div className="fixed inset-0 pointer-events-none bg-noise" />
      {/* Radial glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }}
      />

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto stagger">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 text-xs font-semibold"
            style={{
              background: 'var(--indigo-dim)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: 'var(--indigo-light)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-soft"
              style={{ background: 'var(--indigo-light)' }}
            />
            Trên Shelby Protocol &amp; Aptos Blockchain
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight">
            <span style={{ color: 'var(--text-1)' }}>Lưu ký ức gia đình</span>
            <br />
            <span className="gradient-text">mãi mãi trên blockchain</span>
          </h1>

          <p
            className="text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'var(--text-2)' }}
          >
            MemoryChain bảo vệ ảnh, video và câu chuyện gia đình bằng công nghệ
            phi tập trung — không ai có thể xóa, chặn hay làm mất ký ức của bạn.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={connected ? '/dashboard' : '/login'} className="no-underline">
              <button className="btn-primary text-sm px-6 py-2.5">
                Bắt đầu miễn phí <ArrowRight size={15} />
              </button>
            </Link>
            <Link href="/explore" className="no-underline">
              <button className="btn-ghost text-sm px-6 py-2.5">
                Khám phá ký ức công khai
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { value: '∞',    label: 'Lưu trữ vĩnh viễn', icon: Shield },
              { value: '100%', label: 'Quyền sở hữu',       icon: Lock },
              { value: '0₫',   label: 'Không phí ẩn',       icon: Star },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="card p-4 sm:p-5 text-center">
                <Icon size={16} className="mx-auto mb-2" style={{ color: 'var(--indigo-light)' }} />
                <div className="text-xl sm:text-2xl font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>{value}</div>
                <div className="text-[11px] sm:text-xs" style={{ color: 'var(--text-3)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="card p-6 sm:p-8" style={{ border: '1px solid rgba(239,68,68,0.12)' }}>
            <div className="flex items-center gap-2 justify-center mb-6">
              <Heart size={18} style={{ color: 'var(--red)' }} />
              <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-1)' }}>
                Vì sao ký ức gia đình hay bị{' '}
                <span style={{ color: 'var(--red)' }}>mất?</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                ['📱', 'Điện thoại hỏng, mất hết ảnh'],
                ['☁️', 'Google Drive / iCloud hết dung lượng'],
                ['👴', 'Người thân mất, không ai có quyền truy cập'],
                ['🗂️', 'File phân tán nhiều thiết bị, thất lạc'],
                ['🔒', 'File định dạng cũ, không mở được'],
                ['💔', 'Ký ức gia đình không ai lưu hệ thống'],
              ].map(([emoji, text], i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg text-sm"
                  style={{
                    background: 'rgba(239,68,68,0.04)',
                    border: '1px solid rgba(239,68,68,0.08)',
                    color: 'var(--text-2)',
                  }}
                >
                  <span className="text-base flex-shrink-0">{emoji}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-1)' }}>
              MemoryChain giải quyết <span className="gradient-text">tất cả</span>
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              Công nghệ phi tập trung bảo vệ ký ức gia đình bạn
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="card p-5 transition-all duration-200 hover:-translate-y-1"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 text-lg"
                  style={{ background: f.bg }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1.5" style={{ color: 'var(--text-1)' }}>{f.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-1)' }}>
              Cách sử dụng
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>Đơn giản như lưu ảnh vào máy</p>
          </div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="card p-4 sm:p-5 flex gap-4 items-start">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--indigo), #7c3aed)' }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-1)' }}>{step.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEMORY TYPES ───────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: 'var(--text-1)' }}>
            Lưu mọi loại ký ức
          </h2>
          <p className="text-center mb-8 text-sm" style={{ color: 'var(--text-2)' }}>
            Hỗ trợ tất cả định dạng quan trọng
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {memoryTypes.map((t, i) => (
              <div key={i} className="card p-3.5 sm:p-4 flex items-center gap-3">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{t.label}</div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="max-w-xl mx-auto text-center">
          <div
            className="card p-8 sm:p-10 relative overflow-hidden"
            style={{ border: '1px solid rgba(99,102,241,0.2)' }}
          >
            {/* Radial glow inside card */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 60%)',
              }}
            />
            <div className="relative">
              <div className="text-3xl mb-3">🏡</div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text-1)' }}>
                Bắt đầu lưu trữ ngay hôm nay
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>
                Tạo vault gia đình đầu tiên. Miễn phí. Không cần thẻ tín dụng.
              </p>
              <Link href={connected ? '/dashboard' : '/login'} className="no-underline">
                <button className="btn-primary px-7 py-2.5">
                  Tạo vault gia đình <ArrowRight size={15} />
                </button>
              </Link>
              <div className="flex items-center justify-center gap-4 mt-5">
                {['Bảo mật', 'Miễn phí', 'Phi tập trung'].map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-3)' }}>
                    <Check size={11} style={{ color: 'var(--green)' }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="px-4 sm:px-6 py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--indigo), #7c3aed)' }}
            >
              M
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>MemoryChain</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>
            © 2024 MemoryChain. Xây dựng trên Shelby Protocol &amp; Aptos.
          </p>
          <div className="flex gap-5 text-xs" style={{ color: 'var(--text-3)' }}>
            <Link href="/explore" className="hover:text-white transition-colors no-underline">Khám phá</Link>
            <a href="https://docs.shelby.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors no-underline">Shelby Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  { icon: '🔗', title: 'Phi tập trung thực sự',  desc: 'File lưu trên Shelby Protocol, metadata hash lên Aptos. Không ai có thể xóa hay chặn truy cập.', bg: 'var(--indigo-dim)' },
  { icon: '🔒', title: 'Mã hóa end-to-end',      desc: 'File riêng tư được mã hóa AES-256 ngay trên trình duyệt. Chỉ gia đình mới đọc được.',           bg: 'var(--amber-dim)' },
  { icon: '👨‍👩‍👧‍👦', title: 'Quản lý theo gia đình', desc: 'Tạo vault riêng cho từng gia đình. Phân quyền Owner / Editor / Viewer / Heir linh hoạt.',      bg: 'var(--green-dim)' },
  { icon: '🌳', title: 'Cây gia phả số',         desc: 'Xây dựng cây gia phả trực quan. Gắn ký ức với từng thành viên, kể câu chuyện của họ.',            bg: 'rgba(167,139,250,0.1)' },
  { icon: '🏛️', title: 'Kế thừa ký ức',          desc: 'Đặt quy tắc kế thừa: trao tay, khóa thời gian, hoặc xác nhận đa thành viên.',                    bg: 'var(--blue-dim)' },
  { icon: '✅', title: 'Chứng minh sở hữu',       desc: 'Mỗi file có hash lưu on-chain. Chứng minh bạn là người đầu tiên lưu, không thể làm giả.',         bg: 'rgba(251,191,36,0.08)' },
]

const steps = [
  { title: 'Kết nối ví Aptos',    desc: 'Dùng Petra Wallet, Nightly hoặc bất kỳ ví AIP-62 nào. Ký message đăng nhập — không cần mật khẩu.' },
  { title: 'Tạo vault gia đình',  desc: 'Đặt tên vault, chọn chế độ riêng tư. Proof được ghi lên Aptos blockchain tự động.' },
  { title: 'Upload ký ức',        desc: 'Kéo thả ảnh, video, âm thanh, tài liệu. File được hash, upload lên Shelby, metadata lưu vào database.' },
  { title: 'Chia sẻ với gia đình', desc: 'Thêm ví của người thân, chọn quyền phù hợp. Họ connect ví là xem được vault ngay.' },
]

const memoryTypes = [
  { icon: '📷', label: 'Ảnh gia đình',   desc: 'JPG, PNG, HEIC, WebP' },
  { icon: '🎬', label: 'Video kỷ niệm',  desc: 'MP4, MOV, WebM' },
  { icon: '🎵', label: 'Âm thanh',       desc: 'MP3, WAV, M4A' },
  { icon: '📄', label: 'Tài liệu',       desc: 'PDF, DOC, DOCX' },
  { icon: '✉️', label: 'Thư tay scan',   desc: 'Ảnh scan thư cũ' },
  { icon: '📖', label: 'Câu chuyện',     desc: 'Văn bản, nhật ký số' },
]
