'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Shield, Wallet, Key, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { WalletButton } from '@/components/WalletButton'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const { connected, account } = useWallet()
  const { isAuthenticated, isLoading, login } = useAuth()
  const [step, setStep] = useState<'connect' | 'sign' | 'done'>('connect')

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard')
  }, [isAuthenticated, router])

  useEffect(() => {
    if (connected && !isAuthenticated) setStep('sign')
    else if (!connected) setStep('connect')
  }, [connected, isAuthenticated])

  const handleLogin = async () => {
    const success = await login()
    if (success) {
      setStep('done')
      setTimeout(() => router.push('/dashboard'), 1000)
    }
  }

  const stepOrder = { connect: 0, sign: 1, done: 2 }
  const currentOrder = stepOrder[step]

  const stepDefs = [
    { key: 'connect' as const, label: 'Kết nối', icon: Wallet },
    { key: 'sign'    as const, label: 'Xác thực', icon: Key },
    { key: 'done'   as const, label: 'Hoàn tất', icon: CheckCircle },
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="fixed inset-0 pointer-events-none bg-grid opacity-40" />
      {/* Glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-7">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, var(--indigo), #7c3aed)' }}
          >
            M
          </div>
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>
            Đăng nhập MemoryChain
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Kết nối ví Aptos để truy cập vault gia đình
          </p>
        </div>

        {/* Card */}
        <div className="card p-5 sm:p-6 mb-4">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-6">
            {stepDefs.map(({ key, label, icon: Icon }, i) => {
              const thisOrder = stepOrder[key]
              const isActive  = key === step
              const isDone    = thisOrder < currentOrder

              return (
                <div key={key} className="flex items-center gap-1.5 flex-1">
                  <div
                    className="step-dot"
                    style={{
                      background: isDone
                        ? 'var(--green)'
                        : isActive
                        ? 'var(--indigo)'
                        : 'rgba(255,255,255,0.05)',
                      color: isDone || isActive ? '#fff' : 'var(--text-3)',
                    }}
                  >
                    {isDone ? <CheckCircle size={12} /> : <Icon size={12} />}
                  </div>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: isActive ? 'var(--text-1)' : 'var(--text-3)' }}
                  >
                    {label}
                  </span>
                  {i < 2 && (
                    <div
                      className="flex-1 h-px"
                      style={{ background: isDone ? 'rgba(34,197,94,0.35)' : 'var(--border)' }}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step: Connect */}
          {step === 'connect' && (
            <div className="text-center space-y-5 animate-fade-in">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
                style={{ background: 'var(--indigo-dim)', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <Wallet size={26} style={{ color: 'var(--indigo-light)' }} />
              </div>
              <div>
                <h2 className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Kết nối ví Aptos</h2>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                  Hỗ trợ Petra, Nightly và tất cả ví AIP-62.
                </p>
              </div>
              <WalletButton />
            </div>
          )}

          {/* Step: Sign */}
          {step === 'sign' && (
            <div className="text-center space-y-5 animate-fade-in">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
                style={{ background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <Key size={26} style={{ color: 'var(--amber)' }} />
              </div>
              <div>
                <h2 className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Xác thực danh tính</h2>
                <p className="text-sm mb-2.5" style={{ color: 'var(--text-2)' }}>
                  Ký message để chứng minh bạn là chủ ví.{' '}
                  <span style={{ color: 'var(--text-1)' }}>Không tốn phí gas.</span>
                </p>
                <div
                  className="text-xs font-mono px-3 py-2 rounded-md break-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {account?.address?.toString().slice(0, 28)}…
                </div>
              </div>
              <Button onClick={handleLogin} loading={isLoading} className="w-full" size="lg">
                <Key size={14} /> Ký xác thực
              </Button>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="text-center space-y-5 animate-scale-in">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
                style={{ background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <CheckCircle size={26} style={{ color: 'var(--green)' }} />
              </div>
              <div>
                <h2 className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Đăng nhập thành công!</h2>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>Đang chuyển hướng…</p>
              </div>
            </div>
          )}
        </div>

        {/* Security note */}
        <div
          className="flex items-start gap-2.5 px-4 py-3 rounded-lg text-xs mb-4"
          style={{
            background: 'var(--green-dim)',
            border: '1px solid rgba(34,197,94,0.12)',
            color: 'var(--text-2)',
          }}
        >
          <Shield size={13} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
          <span>
            MemoryChain không bao giờ yêu cầu private key hay seed phrase của bạn.
          </span>
        </div>

        {/* Tech badges */}
        <div className="flex justify-center gap-2">
          {['Shelby Protocol', 'Aptos', 'JWT Auth'].map(t => (
            <span key={t} className="badge badge-slate">{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
