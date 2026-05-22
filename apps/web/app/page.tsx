'use client'

import Link from 'next/link'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { ArrowRight, Shield, Zap, Heart, Lock, Globe, ChevronRight, Star, Users, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  const { connected } = useWallet()

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-indigo w-96 h-96 top-[-100px] left-[-100px]" style={{ animationDelay: '0s' }} />
        <div className="orb orb-amber w-80 h-80 top-[30%] right-[-80px]" style={{ animationDelay: '2s' }} />
        <div className="orb orb-emerald w-64 h-64 bottom-[20%] left-[20%]" style={{ animationDelay: '4s' }} />
        <div className="bg-grid absolute inset-0" />
      </div>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium text-indigo-300"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Zap size={14} className="text-amber-400" />
            Xây dựng trên Shelby Protocol & Aptos Blockchain
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Lưu ký ức</span>
            <br />
            <span className="gradient-text">mãi mãi cho gia đình</span>
          </h1>

          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            MemoryChain là nền tảng lưu trữ ký ức gia đình phi tập trung đầu tiên tại Việt Nam.
            Ảnh, video, câu chuyện — được bảo vệ bởi blockchain, truyền lại cho đời sau.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href={connected ? '/dashboard' : '/login'}>
              <button className="btn-primary text-base px-8 py-3.5">
                Bắt đầu ngay <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/explore">
              <button className="btn-ghost text-base px-8 py-3.5">
                Khám phá ký ức công khai
              </button>
            </Link>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { value: '∞', label: 'Lưu trữ vĩnh viễn', icon: <Shield size={20} className="text-indigo-400" /> },
              { value: '100%', label: 'Quyền sở hữu của bạn', icon: <Lock size={20} className="text-amber-400" /> },
              { value: '0₫', label: 'Phí ẩn', icon: <Star size={20} className="text-emerald-400" /> },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-10 gradient-border">
            <h2 className="font-display text-3xl font-bold text-white mb-6 text-center">
              Vì sao ký ức gia đình thường bị <span className="text-red-400">mất?</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                '📱 Điện thoại hỏng, mất hết ảnh',
                '☁️ Google Drive/iCloud hết dung lượng',
                '👴 Người thân mất, không ai có quyền truy cập',
                '🗂️ File phân tán nhiều thiết bị, thất lạc',
                '🔒 Ảnh cũ định dạng cũ, không mở được',
                '💔 Ký ức gia đình không ai lưu lại hệ thống',
              ].map((problem, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                  <span className="text-lg">{problem.split(' ')[0]}</span>
                  <span className="text-slate-300 text-sm">{problem.slice(problem.indexOf(' ') + 1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              MemoryChain giải quyết <span className="gradient-text">tất cả</span>
            </h2>
            <p className="text-slate-400 text-lg">Công nghệ phi tập trung bảo vệ ký ức gia đình bạn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-6 group hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
                  style={{ background: feature.bg }}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">Cách sử dụng</h2>
            <p className="text-slate-400">Đơn giản như lưu ảnh vào máy</p>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 to-transparent hidden md:block" />
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-6 md:ml-8">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl relative"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                    {i + 1}
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-500 hidden md:block" />
                  </div>
                  <div className="glass rounded-2xl p-5 flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">{step.title}</h3>
                    <p className="text-slate-400 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Memory types */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-white mb-4 text-center">Lưu mọi loại ký ức</h2>
          <p className="text-slate-400 text-center mb-12">Hỗ trợ tất cả định dạng quan trọng của gia đình bạn</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {memoryTypes.map((type, i) => (
              <div key={i} className="glass rounded-2xl p-5 flex items-center gap-4 group hover:-translate-y-1 transition-all">
                <span className="text-3xl">{type.icon}</span>
                <div>
                  <div className="font-semibold text-white text-sm">{type.label}</div>
                  <div className="text-slate-500 text-xs">{type.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 gradient-border">
            <Heart size={48} className="text-red-400 mx-auto mb-6" />
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Bắt đầu lưu trữ ký ức ngay hôm nay
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Tạo vault gia đình đầu tiên. Miễn phí. Không cần thẻ tín dụng.
            </p>
            <Link href={connected ? '/dashboard' : '/login'}>
              <button className="btn-primary text-lg px-10 py-4">
                Tạo vault gia đình <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">M</div>
            <span className="font-bold text-white">MemoryChain</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 MemoryChain. Xây dựng trên Shelby Protocol & Aptos.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/explore" className="hover:text-white transition-colors no-underline">Khám phá</Link>
            <a href="https://docs.shelby.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors no-underline">Shelby Docs</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: '🔗',
    title: 'Phi tập trung thực sự',
    desc: 'File lưu trên Shelby Protocol, metadata hash lên Aptos. Không ai có thể xóa hay chặn truy cập của bạn.',
    bg: 'rgba(99,102,241,0.1)',
  },
  {
    icon: '🔒',
    title: 'Mã hóa end-to-end',
    desc: 'File riêng tư được mã hóa AES-256 ngay trên trình duyệt trước khi upload. Chỉ bạn và gia đình mới đọc được.',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Quản lý theo gia đình',
    desc: 'Tạo vault riêng cho từng gia đình. Phân quyền Owner/Editor/Viewer/Heir cho từng thành viên.',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    icon: '🌳',
    title: 'Cây gia phả số',
    desc: 'Xây dựng cây gia phả trực quan. Gắn ký ức với từng thành viên, kể câu chuyện của họ.',
    bg: 'rgba(167,139,250,0.1)',
  },
  {
    icon: '🏛️',
    title: 'Kế thừa ký ức',
    desc: 'Đặt quy tắc kế thừa: trao tay, khóa thời gian, hoặc xác nhận đa thành viên. Ký ức truyền mãi.',
    bg: 'rgba(96,165,250,0.1)',
  },
  {
    icon: '✅',
    title: 'Chứng minh sở hữu',
    desc: 'Mỗi file có hash lưu on-chain. Chứng minh bạn là người đầu tiên lưu, không thể làm giả.',
    bg: 'rgba(251,191,36,0.1)',
  },
]

const steps = [
  {
    title: 'Kết nối ví Aptos',
    desc: 'Dùng Petra Wallet, Nightly hoặc bất kỳ ví AIP-62 nào. Ký message đăng nhập — không cần mật khẩu.',
  },
  {
    title: 'Tạo vault gia đình',
    desc: 'Đặt tên vault, chọn chế độ riêng tư. Proof của vault được ghi lên Aptos blockchain tự động.',
  },
  {
    title: 'Upload ký ức',
    desc: 'Kéo thả ảnh, video, âm thanh, tài liệu. File được hash, upload lên Shelby, metadata lưu vào database.',
  },
  {
    title: 'Chia sẻ với gia đình',
    desc: 'Thêm ví của người thân, chọn quyền phù hợp. Họ connect ví là xem được vault ngay.',
  },
]

const memoryTypes = [
  { icon: '📷', label: 'Ảnh gia đình', desc: 'JPG, PNG, HEIC, WebP' },
  { icon: '🎬', label: 'Video kỷ niệm', desc: 'MP4, MOV, WebM' },
  { icon: '🎵', label: 'Âm thanh', desc: 'MP3, WAV, M4A' },
  { icon: '📄', label: 'Tài liệu', desc: 'PDF, DOC, DOCX' },
  { icon: '✉️', label: 'Thư tay scan', desc: 'Ảnh scan thư cũ' },
  { icon: '📖', label: 'Câu chuyện', desc: 'Văn bản, nhật ký số' },
]
