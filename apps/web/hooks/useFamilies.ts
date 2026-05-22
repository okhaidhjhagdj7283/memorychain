'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Family } from '@/types'
import toast from 'react-hot-toast'

export function useFamilies() {
  return useQuery<Family[]>({
    queryKey: ['families'],
    queryFn: async () => {
      const res = await fetch('/api/families')
      if (!res.ok) throw new Error('Lỗi tải danh sách vault')
      return res.json()
    },
  })
}

export function useFamily(id: string) {
  return useQuery<Family>({
    queryKey: ['family', id],
    queryFn: async () => {
      const res = await fetch(`/api/families/${id}`)
      if (!res.ok) throw new Error('Vault không tồn tại')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateFamily() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Family>) => {
      const res = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Tạo vault thất bại')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
      toast.success('Tạo vault gia đình thành công!')
    },
    onError: () => toast.error('Tạo vault thất bại'),
  })
}
