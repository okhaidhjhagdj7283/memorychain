'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Lock, Eye, MapPin, Calendar, Hash,
  Database, Link2, Download, Trash2, Send, Globe,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useMemory } from '@/hooks/useMemories'
import { useFamily } from '@/hooks/useFamilies'
import { Avatar } from '@/components/ui/Avatar'
import { MemoryTypeBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatDateRelative, formatBytes, truncateAddress } from '@/lib/utils'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { decryptFile } from '@/lib/crypto'
import toast from 'react-hot-toast'

export default function MemoryDetailPage({ params }: { params: Promise<{ id: string; memoryId: string }> }) {
  const { id, memoryId } = use(params)
  const { account } = useWallet()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null)
  const [isDecrypting, setIsDecrypting] = useState(false)

  const { data: family } = useFamily(id)
  const { data: memory, isLoading } = useMemory(memoryId)

  const { data: comments } = useQuery({
    queryKey: ['comments', memoryId],
    queryFn: () => fetch(`/api/memories/${memoryId}/comments`).then(r => r.json()),
    enabled: !!memoryId,
  })

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/memories/${memoryId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error()
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', memoryId] })
      setComment('')
      toast.success('Đã gửi bình luận')
    },
    onError: () => toast.error('Gửi thất bại'),
  })

  const handleDecrypt = async () => {
    if (!memory || !memory.shelbyBlobName || !memory.encryptedKey || !memory.encryptedIv) return
    setIsDecrypting(true)
    try {
      const res = await fetch(`/api/blob/${encodeURIComponent(memory.shelbyBlobName)}`)
      if (!res.ok) throw new Error('Không tải được file')
      const encryptedBuffer = await res.arrayBuffer()
      const decryptedBytes = await decryptFile(new Uint8Array(encryptedBuffer), memory.encryptedKey, memory.encryptedIv)
      const blob = new Blob([decryptedBytes], { type: memory.fileMimeType || 'application/octet-stream' })
      setDecryptedUrl(URL.createObjectURL(blob))
      toast.success('Giải mã thành công!')
    } catch (err) {
      console.error(err)
      toast.error('Giải mã thất bại')
    } finally {
      setIsDecrypting(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout familyId={id} familyName={family?.familyName}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <div className="skeleton h-80 rounded-xl" />
          <div className="skeleton h-40 rounded-xl" />
        </div>
      </AppLayout>
    )
  }

  if (!memory) return null

  const isOwner    = account?.address?.toString() === memory.uploaderWallet
  const displayUrl = decryptedUrl || (memory.isEncrypted ? null : `/api/blob/${encodeURIComponent(memory.shelbyBlobName || '')}`)

  return (
    <AppLayout familyId={id} familyName={family?.familyName}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <Link
          href={`/family/${id}`}
          className="inline-flex items-center gap-1.5 mb-5 no-underline transition-colors text-sm"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <ArrowLeft size={15} /> Quay lại vault
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* ── Main column ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Media preview */}
            <div className="card overflow-hidden">
              {memory.isEncrypted && !decryptedUrl ? (
                <div
                  className="h-64 sm:h-80 flex flex-col items-center justify-center gap-4 p-6 text-center"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)' }}
                  >
                    <Lock size={28} style={{ color: 'var(--amber)' }} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: 'var(--text-1)' }}>File đã được mã hóa</h3>
                    <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                      Chỉ người có quyền truy cập mới có thể giải mã
                    </p>
                  </div>
                  <Button onClick={handleDecrypt} loading={isDecrypting} icon={<Lock size={15} />}>
                    Giải mã &amp; Hiển thị
                  </Button>
                </div>
              ) : memory.memoryType === 'PHOTO' && displayUrl ? (
                <div className="flex items-center justify-center min-h-64 sm:min-h-80" style={{ background: '#000' }}>
                  <img src={displayUrl} alt={memory.title} className="max-w-full max-h-96 object-contain" />
                </div>
              ) : memory.memoryType === 'VIDEO' && displayUrl ? (
                <video controls className="w-full max-h-96" src={displayUrl} />
              ) : memory.memoryType === 'AUDIO' && displayUrl ? (
                <div className="p-8 flex flex-col items-center gap-4" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="text-5xl">🎵</div>
                  <audio controls className="w-full" src={displayUrl} />
                </div>
              ) : (
                <div
                  className="h-64 flex flex-col items-center justify-center gap-3"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  <div className="text-5xl">
                    {memory.memoryType === 'DOCUMENT' ? '📄' : memory.memoryType === 'LETTER' ? '✉️' : '📖'}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-3)' }}>Tải xuống để xem nội dung</p>
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <MemoryTypeBadge type={memory.memoryType} />
                    {memory.isEncrypted && (
                      <span className="badge badge-amber"><Lock size={9} /> Mã hóa</span>
                    )}
                    {memory.visibility === 'PUBLIC' && (
                      <span className="badge badge-emerald"><Globe size={9} /> Công khai</span>
                    )}
                  </div>
                  <h1 className="font-display text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-1)' }}>
                    {memory.title}
                  </h1>
                </div>
                {isOwner && (
                  <button
                    className="btn-icon flex-shrink-0"
                    title="Xóa ký ức"
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
                      e.currentTarget.style.color = 'var(--red)'
                      e.currentTarget.style.background = 'var(--red-dim)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text-3)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {memory.description && (
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-2)' }}>
                  {memory.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-xs mb-3" style={{ color: 'var(--text-3)' }}>
                {memory.eventDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} style={{ color: 'var(--indigo-light)' }} />
                    {formatDate(memory.eventDate)}
                  </span>
                )}
                {memory.locationText && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} style={{ color: 'var(--red)' }} />
                    {memory.locationText}
                  </span>
                )}
              </div>

              {memory.tags && memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {memory.tags.map(tag => (
                    <span key={tag} className="tag-chip">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="card p-4 sm:p-5">
              <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--text-1)' }}>
                Bình luận ({comments?.length || 0})
              </h3>
              <div className="space-y-4 mb-5">
                {comments?.map((c: {
                  id: string
                  walletAddress: string
                  content: string
                  createdAt: string
                  user?: { displayName?: string }
                }) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar address={c.walletAddress} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                          {c.user?.displayName || truncateAddress(c.walletAddress, 6)}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {formatDateRelative(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-2)' }}>{c.content}</p>
                    </div>
                  </div>
                ))}
                {(!comments || comments.length === 0) && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--text-3)' }}>
                    Chưa có bình luận nào
                  </p>
                )}
              </div>

              {/* Comment input */}
              <div className="flex gap-2.5">
                <Avatar address={account?.address?.toString()} size="sm" />
                <div className="flex-1 flex gap-2">
                  <input
                    className="input flex-1 text-sm"
                    placeholder="Viết bình luận…"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                        e.preventDefault()
                        addComment.mutate(comment.trim())
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    icon={<Send size={13} />}
                    loading={addComment.isPending}
                    disabled={!comment.trim()}
                    onClick={() => addComment.mutate(comment.trim())}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar column ──────────────────────────── */}
          <div className="space-y-3 sm:space-y-4">
            {/* Uploader */}
            <div className="card p-4">
              <p className="input-label mb-2.5">Người upload</p>
              <div className="flex items-center gap-3">
                <Avatar address={memory.uploaderWallet} name={memory.uploader?.displayName} />
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                    {memory.uploader?.displayName || truncateAddress(memory.uploaderWallet, 8)}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {formatDateRelative(memory.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* File info */}
            <div className="card p-4">
              <p className="input-label mb-2.5">Thông tin file</p>
              <div className="space-y-2 text-sm">
                {memory.fileMimeType && (
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-3)' }}>Loại</span>
                    <span className="font-mono text-xs" style={{ color: 'var(--text-1)' }}>{memory.fileMimeType}</span>
                  </div>
                )}
                {memory.fileSize && (
                  <div className="flex justify-between items-center">
                    <span style={{ color: 'var(--text-3)' }}>Kích thước</span>
                    <span style={{ color: 'var(--text-1)' }}>{formatBytes(Number(memory.fileSize))}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-3)' }}>Hiển thị</span>
                  <span className="flex items-center gap-1" style={{ color: 'var(--text-1)' }}>
                    {memory.visibility === 'PRIVATE' ? <Lock size={11} /> : memory.visibility === 'PUBLIC' ? <Globe size={11} /> : <Eye size={11} />}
                    {memory.visibility === 'PRIVATE' ? 'Riêng tư' : memory.visibility === 'FAMILY' ? 'Gia đình' : 'Công khai'}
                  </span>
                </div>
              </div>
            </div>

            {/* On-chain proof */}
            <div className="card p-4">
              <p className="input-label mb-2.5 flex items-center gap-1">
                <Database size={10} /> On-chain Proof
              </p>
              <div className="space-y-3">
                {memory.shelbyBlobHash && (
                  <div>
                    <div className="text-[10px] mb-1 flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                      <Hash size={9} /> File Hash
                    </div>
                    <div
                      className="text-xs font-mono break-all p-2 rounded-md"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                    >
                      {memory.shelbyBlobHash.slice(0, 36)}…
                    </div>
                  </div>
                )}
                {memory.shelbyBlobName && (
                  <div>
                    <div className="text-[10px] mb-1 flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                      <Database size={9} /> Shelby Blob
                    </div>
                    <div
                      className="text-xs font-mono break-all p-2 rounded-md"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                    >
                      {memory.shelbyBlobName}
                    </div>
                  </div>
                )}
                {memory.txHash && (
                  <div>
                    <div className="text-[10px] mb-1 flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                      <Link2 size={9} /> Tx Hash
                    </div>
                    <a
                      href={`https://explorer.aptoslabs.com/txn/${memory.txHash}?network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono break-all block transition-colors no-underline"
                      style={{ color: 'var(--indigo-light)' }}
                    >
                      {memory.txHash.slice(0, 32)}…
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Download */}
            {memory.shelbyBlobName && (
              <a
                href={displayUrl || '#'}
                download={displayUrl ? memory.title : undefined}
                className="btn-ghost w-full justify-center no-underline"
                style={{ opacity: displayUrl ? 1 : 0.5, pointerEvents: displayUrl ? 'auto' : 'none' }}
                onClick={e => {
                  if (!displayUrl) {
                    e.preventDefault()
                    toast.error('Vui lòng giải mã file trước khi tải xuống!')
                  }
                }}
              >
                <Download size={14} /> Tải xuống
              </a>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
