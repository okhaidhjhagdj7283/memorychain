'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Memory } from '@/types'
import toast from 'react-hot-toast'

export function useMemories(familyId: string) {
  return useQuery<Memory[]>({
    queryKey: ['memories', familyId],
    queryFn: async () => {
      const res = await fetch(`/api/families/${familyId}/memories`)
      if (!res.ok) throw new Error('Lỗi tải memories')
      return res.json()
    },
    enabled: !!familyId,
  })
}

export function useMemory(memoryId: string) {
  return useQuery<Memory>({
    queryKey: ['memory', memoryId],
    queryFn: async () => {
      const res = await fetch(`/api/memories/${memoryId}`)
      if (!res.ok) throw new Error('Memory không tồn tại')
      return res.json()
    },
    enabled: !!memoryId,
  })
}

export function useDeleteMemory(familyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (memoryId: string) => {
      const res = await fetch(`/api/memories/${memoryId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Xóa thất bại')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', familyId] })
      toast.success('Đã xóa ký ức')
    },
    onError: () => toast.error('Xóa thất bại'),
  })
}
