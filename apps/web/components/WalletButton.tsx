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
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm text-white"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          {truncateAddress(account.address.toString())}
          <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-12 w-56 glass rounded-xl p-2 z-50">
            <div className="px-3 py-2 mb-1">
              <p className="text-xs text-slate-500">Ví đang kết nối</p>
              <p className="text-xs text-white font-mono mt-0.5">{truncateAddress(account.address.toString(), 10)}</p>
            </div>
            <div className="divider my-1" />
            <button onClick={copyAddress} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Đã sao chép' : 'Sao chép địa chỉ'}
            </button>
            <button onClick={() => { disconnect(); setShowDropdown(false) }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors">
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
      <div className="relative">
        <div className="absolute right-0 top-12 w-64 glass rounded-xl p-3 z-50">
          <p className="text-xs text-slate-400 mb-3 px-2">Chọn ví Aptos của bạn:</p>
          {wallets?.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => { connect(wallet.name); setShowWallets(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left"
            >
              {wallet.icon && <img src={wallet.icon} alt={wallet.name} className="w-7 h-7 rounded-lg" />}
              <span className="text-sm text-white">{wallet.name}</span>
            </button>
          ))}
          {(!wallets || wallets.length === 0) && (
            <p className="text-xs text-slate-500 px-2">Không tìm thấy ví. Cài Petra hoặc Nightly.</p>
          )}
        </div>
        <Button onClick={() => setShowWallets(false)} variant="ghost" size="sm">
          <Wallet size={15} /> Đóng
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={() => setShowWallets(true)} icon={<Wallet size={15} />}>
      Kết nối ví
    </Button>
  )
}
