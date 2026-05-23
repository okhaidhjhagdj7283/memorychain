'use client'

import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useState } from 'react'
import { Wallet, ChevronDown, LogOut, Copy, Check } from 'lucide-react'
import { truncateAddress } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function WalletButton() {
  const { connected, account, connect, disconnect, wallets } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showWallets, setShowWallets] = useState(false)

  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (connected && account) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all text-sm font-medium"
          style={{
            background: showDropdown ? 'var(--bg-hover)' : 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-1)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-hover)'
            e.currentTarget.style.background = 'var(--bg-hover)'
          }}
          onMouseLeave={e => {
            if (!showDropdown) {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--bg-elevated)'
            }
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
          {truncateAddress(account.address.toString())}
          <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div
            className="absolute right-0 top-12 w-56 rounded-xl p-1.5 z-50 animate-fade-in shadow-xl"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="px-3 py-2.5 mb-1">
              <p className="text-[11px] mb-0.5" style={{ color: 'var(--text-3)' }}>Ví đang kết nối</p>
              <p className="text-xs font-mono font-medium" style={{ color: 'var(--text-1)' }}>
                {truncateAddress(account.address.toString(), 10)}
              </p>
            </div>
            <div className="h-px w-full my-1" style={{ background: 'var(--border)' }} />
            
            <button
              onClick={copyAddress}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ color: 'var(--text-2)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-hover)'
                e.currentTarget.style.color = 'var(--text-1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-2)'
              }}
            >
              {copied ? <Check size={14} style={{ color: 'var(--green)' }} /> : <Copy size={14} />}
              {copied ? 'Đã sao chép' : 'Sao chép địa chỉ'}
            </button>
            
            <button
              onClick={() => { disconnect(); setShowDropdown(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors mt-0.5"
              style={{ color: 'var(--red)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--red-dim)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <LogOut size={14} />
              Ngắt kết nối
            </button>
          </div>
        )}
      </div>
    )
  }

  if (showWallets) {
    return (
      <div className="relative inline-block text-left">
        <Button onClick={() => setShowWallets(false)} variant="ghost" size="sm" icon={<Wallet size={15} />}>
          Đóng
        </Button>
        <div
          className="absolute right-0 top-12 w-64 rounded-xl p-2 z-50 animate-slide-up shadow-xl"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs mb-2.5 px-2" style={{ color: 'var(--text-3)' }}>Chọn ví Aptos của bạn:</p>
          <div className="space-y-1">
            {wallets?.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => { connect(wallet.name); setShowWallets(false) }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left"
                style={{ color: 'var(--text-1)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {wallet.icon && <img src={wallet.icon} alt={wallet.name} className="w-6 h-6 rounded-md" />}
                <span className="text-sm font-medium">{wallet.name}</span>
              </button>
            ))}
            {(!wallets || wallets.length === 0) && (
              <p className="text-xs px-2 pb-1" style={{ color: 'var(--text-3)' }}>
                Không tìm thấy ví. Cài đặt Petra hoặc Nightly.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button onClick={() => setShowWallets(true)} icon={<Wallet size={15} />}>
      Kết nối ví
    </Button>
  )
}
