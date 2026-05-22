'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import toast from 'react-hot-toast'

export interface AuthState {
  isAuthenticated: boolean
  walletAddress: string | null
  isLoading: boolean
  login: () => Promise<boolean>
  logout: () => Promise<void>
}

export function useAuth(): AuthState {
  const { account, connected, signMessage } = useWallet()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check session khi mount
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.walletAddress) setIsAuthenticated(true)
      })
      .catch(() => {})
  }, [])

  const login = useCallback(async (): Promise<boolean> => {
    if (!connected || !account) {
      toast.error('Vui lòng kết nối ví trước')
      return false
    }

    setIsLoading(true)
    try {
      // 1. Lấy nonce
      const nonceRes = await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: account.address }),
      })
      const { nonce, message } = await nonceRes.json()

      // 2. Ký message
      const result = await signMessage({
        message,
        nonce,
      })

      // 3. Verify signature
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: account.address,
          signature: result.signature,
          nonce,
        }),
      })

      if (!verifyRes.ok) throw new Error('Xác thực thất bại')

      setIsAuthenticated(true)
      toast.success('Đăng nhập thành công!')
      return true
    } catch (err: unknown) {
      const error = err as Error
      console.error('Login error:', error)
      if (error.message?.includes('reject') || error.message?.includes('cancel')) {
        toast.error('Bạn đã từ chối ký')
      } else {
        toast.error('Đăng nhập thất bại')
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }, [connected, account, signMessage])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setIsAuthenticated(false)
    toast.success('Đã đăng xuất')
  }, [])

  return {
    isAuthenticated,
    walletAddress: account?.address?.toString() || null,
    isLoading,
    login,
    logout,
  }
}
