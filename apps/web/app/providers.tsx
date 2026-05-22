'use client'

import { ReactNode } from 'react'
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 2,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect={true}
        dappConfig={{
          network: (process.env.NEXT_PUBLIC_APTOS_NETWORK as 'testnet' | 'mainnet') || 'testnet',
        }}
        onError={(error) => {
          console.error('Wallet error:', error)
        }}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0f1526',
              color: '#f1f5f9',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '12px',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#0f1526' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#0f1526' },
            },
          }}
        />
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  )
}
