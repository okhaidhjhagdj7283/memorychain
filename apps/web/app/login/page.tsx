'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Shield, Wallet, Lock, Key, CheckCircle, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { WalletButton } from '@/components/WalletButton'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const { connected, account } = useWallet()
  const { isAuthenticated, isLoading, login } = useAuth()
  const [step, setStep] = useState<'connect' | 'sign' | 'done'>('connect')

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (connected && !isAuthenticated) {
      setStep('sign')
    } else if (!connected) {
      setStep('connect')
    }
  }, [connected, isAuthenticated])

  const handleLogin = async () => {
    const success = await login()
    if (success) {
      setStep('done')
      setTimeout(() => router.push('/dashboard'), 1000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg-primary)' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-indigo w-80 h-80 top-1/4 left-1/4" />
        <div className="orb orb-amber w-60 h-60 bottom-1/4 right-1/4" style={{ animationDelay: '3s' }} />
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 glow-indigo">
            M
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Đăng nhập MemoryChain</h1>
          <p className="text-slate-400">Kết nối ví Aptos để truy cập vault gia đình của bạn</p>
        </div>

        {/* Steps */}
        <div className="glass rounded-2xl p-8 mb-6">
          {/* Step indicators */}
          <div className="flex items-center gap-3 mb-8">
            {[
              { key: 'connect', label: 'Kết nối', icon: Wallet },
              { key: 'sign', label: 'Xác thực', icon: Key },
              { key: 'done', label: 'Hoàn tất', icon: CheckCircle },
            ].map(({ key, label, icon: Icon }, i) => {
              const stepOrder = { connect: 0, sign: 1, done: 2 }
              const currentOrder = stepOrder[step]
              const thisOrder = stepOrder[key as 'connect' | 'sign' | 'done']
              const isActive = key === step
              const isDone = thisOrder < currentOrder

              return (
                <div key={key} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all ${
                    isDone ? 'bg-emerald-500 text-white' :
                    isActive ? 'bg-indigo-500 text-white' :
                    'bg-white/5 text-slate-500'
                  }`}>
                    {isDone ? <CheckCircle size={14} /> : <Icon size={14} />}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-slate-500'}`}>
                    {label}
                  </span>
                  {i < 2 && <div className={`flex-1 h-px ${isDone ? 'bg-emerald-500/50' : 'bg-white/10'}`} />}
                </div>
              )
            })}
          </div>

          {/* Step content */}
          {step === 'connect' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto border border-indigo-500/20">
                <Wallet size={32} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Kết nối ví Aptos</h2>
                <p className="text-slate-400 text-sm">
                  Chọn ví Aptos của bạn. Hỗ trợ Petra, Nightly và tất cả ví AIP-62.
                </p>
              </div>
              <WalletButton />
            </div>
          )}

          {step === 'sign' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20">
                <Key size={32} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Xác thực danh tính</h2>
                <p className="text-slate-400 text-sm mb-2">
                  Ký một message để xác thực bạn là chủ ví.
                  Hành động này <strong className="text-white">không tốn phí gas</strong> và không cho phép bất kỳ giao dịch nào.
                </p>
                <div className="text-xs text-slate-500 font-mono px-4 py-2 rounded-lg bg-white/5 break-all">
                  {account?.address?.toString().slice(0, 20)}...
                </div>
              </div>
              <Button
                onClick={handleLogin}
                loading={isLoading}
                className="w-full"
                size="lg"
              >
                <Key size={16} />
                Ký xác thực
              </Button>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20 animate-scale-in">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Đăng nhập thành công!</h2>
                <p className="text-slate-400 text-sm">Đang chuyển hướng đến Dashboard...</p>
              </div>
            </div>
          )}
        </div>

        {/* Security note */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm text-slate-400"
          style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
          <Shield size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            MemoryChain không bao giờ yêu cầu private key hoặc seed phrase của bạn.
            Chúng tôi chỉ dùng chữ ký để xác thực danh tính.
          </span>
        </div>

        {/* Tech badges */}
        <div className="flex justify-center gap-3 mt-6">
          {['Shelby Protocol', 'Aptos Blockchain', 'JWT Auth'].map(tech => (
            <span key={tech} className="badge badge-slate">{tech}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
