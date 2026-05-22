import { type ClassValue, clsx } from 'clsx'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-4)}`
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: vi })
}

export function formatDateRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
}

export function formatBytes(bytes: number | bigint): string {
  const n = typeof bytes === 'bigint' ? Number(bytes) : bytes
  if (n === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${parseFloat((n / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getMemoryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PHOTO: 'Ảnh',
    VIDEO: 'Video',
    AUDIO: 'Âm thanh',
    DOCUMENT: 'Tài liệu',
    LETTER: 'Thư tay',
    STORY: 'Câu chuyện',
  }
  return labels[type] || type
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    OWNER: 'Chủ sở hữu',
    EDITOR: 'Biên tập viên',
    VIEWER: 'Người xem',
    HEIR: 'Người kế thừa',
  }
  return labels[role] || role
}

export function getPrivacyLabel(mode: string): string {
  const labels: Record<string, string> = {
    PRIVATE: 'Riêng tư',
    FAMILY_ONLY: 'Gia đình',
    PUBLIC: 'Công khai',
  }
  return labels[mode] || mode
}

export function getTriggerLabel(type: string): string {
  const labels: Record<string, string> = {
    MANUAL_RELEASE: 'Trao quyền thủ công',
    TIME_LOCK: 'Khóa thời gian',
    MULTI_MEMBER_APPROVAL: 'Xác nhận đa thành viên',
  }
  return labels[type] || type
}

export function getMimeTypeIcon(mime: string): string {
  if (mime.startsWith('image/')) return 'PHOTO'
  if (mime.startsWith('video/')) return 'VIDEO'
  if (mime.startsWith('audio/')) return 'AUDIO'
  if (mime === 'application/pdf') return 'DOCUMENT'
  return 'DOCUMENT'
}

export const ACCEPTED_FILE_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'],
  'video/*': ['.mp4', '.mov', '.avi', '.webm'],
  'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
