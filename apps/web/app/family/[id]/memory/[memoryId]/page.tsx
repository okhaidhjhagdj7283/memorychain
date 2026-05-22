'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Lock, Eye, MapPin, Calendar, Hash,
  Database, Link2, Download, Trash2, Send
} from 'lucide-react'
import { FamilySidebar } from '@/components/layout/Sidebar'
import { useMemory } from '@/hooks/useMemories'
import { useFamily } from '@/hooks/useFamilies'
import { Avatar } from '@/components/ui/Avatar'
import { MemoryTypeBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatDateRelative, formatBytes, truncateAddress } from '@/lib/utils'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import toast from 'react-hot-toast'

import { decryptFile } from '@/lib/crypto'

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
      const url = URL.createObjectURL(blob)
      setDecryptedUrl(url)
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
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <FamilySidebar familyId={id} familyName={family?.familyName} />
        <main className="ml-60 pt-16 p-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="skeleton h-96 rounded-2xl" />
            <div className="skeleton h-32 rounded-2xl" />
          </div>
        </main>
      </div>
    )
  }

  if (!memory) return null
  const isOwner = account?.address?.toString() === memory.uploaderWallet

  const displayUrl = decryptedUrl || (memory.isEncrypted ? null : `/api/blob/${encodeURIComponent(memory.shelbyBlobName || '')}`)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <FamilySidebar familyId={id} familyName={family?.familyName} />
      <main className="ml-60 pt-16">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <Link href={`/family/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 no-underline transition-colors">
            <ArrowLeft size={16} /> Quay lại vault
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preview */}
              <div className="glass rounded-2xl overflow-hidden relative">
                {memory.isEncrypted && !decryptedUrl ? (
                  <div className="h-72 flex flex-col items-center justify-center gap-4 text-slate-400 p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Lock size={32} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold mb-1">File đã được mã hóa</h3>
                      <p className="text-sm">Chỉ những người có quyền truy cập mới có thể giải mã và xem nội dung này</p>
                    </div>
                    <Button onClick={handleDecrypt} loading={isDecrypting} className="mt-2" icon={<Lock size={16} />}>
                      Giải mã & Hiển thị
                    </Button>
                  </div>
                ) : memory.memoryType === 'PHOTO' && displayUrl ? (
                  <div className="bg-black flex items-center justify-center min-h-72">
                    <img src={displayUrl} alt={memory.title} className="max-w-full max-h-96 object-contain" />
                  </div>
                ) : memory.memoryType === 'VIDEO' && displayUrl ? (
                  <video controls className="w-full max-h-96" src={displayUrl} />
                ) : memory.memoryType === 'AUDIO' && displayUrl ? (
                  <div className="p-8 flex flex-col items-center gap-4">
                    <div className="text-6xl">🎵</div>
                    <audio controls className="w-full" src={displayUrl} />
                  </div>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center gap-4 text-slate-400">
                    <div className="text-6xl">{memory.memoryType === 'DOCUMENT' ? '📄' : memory.memoryType === 'LETTER' ? '✉️' : '📖'}</div>
                    <p className="text-sm">Tải xuống để xem nội dung</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MemoryTypeBadge type={memory.memoryType} />
                      {memory.isEncrypted && <span className="badge badge-amber"><Lock size={10} /> Mã hóa</span>}
                    </div>
                    <h1 className="font-display text-2xl font-bold text-white">{memory.title}</h1>
                  </div>
                  {isOwner && (
                    <button className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"><Trash2 size={16} /></button>
                  )}
                </div>
                {memory.description && <p className="text-slate-300 mb-4 leading-relaxed">{memory.description}</p>}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  {memory.eventDate && <span className="flex items-center gap-1.5"><Calendar size={14} className="text-indigo-400" />{formatDate(memory.eventDate)}</span>}
                  {memory.locationText && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-red-400" />{memory.locationText}</span>}
                </div>
                {memory.tags && memory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">{memory.tags.map(tag => <span key={tag} className="badge badge-slate">#{tag}</span>)}</div>
                )}
              </div>

              {/* Comments */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Bình luận ({comments?.length || 0})</h3>
                <div className="space-y-4 mb-6">
                  {comments?.map((c: { id: string; walletAddress: string; content: string; createdAt: string; user?: { displayName?: string } }) => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar address={c.walletAddress} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{c.user?.displayName || truncateAddress(c.walletAddress)}</span>
                          <span className="text-xs text-slate-500">{formatDateRelative(c.createdAt)}</span>
                        </div>
                        <p className="text-slate-300 text-sm">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {(!comments || comments.length === 0) && <p className="text-slate-500 text-sm text-center py-4">Chưa có bình luận nào</p>}
                </div>
                <div className="flex gap-3">
                  <Avatar address={account?.address?.toString()} size="sm" />
                  <div className="flex-1 flex gap-2">
                    <input className="input flex-1" placeholder="Viết bình luận..." value={comment} onChange={e => setComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && comment.trim()) { e.preventDefault(); addComment.mutate(comment.trim()) } }} />
                    <Button size="sm" icon={<Send size={14} />} loading={addComment.isPending} disabled={!comment.trim()} onClick={() => addComment.mutate(comment.trim())}>Gửi</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Người upload</h3>
                <div className="flex items-center gap-3">
                  <Avatar address={memory.uploaderWallet} name={memory.uploader?.displayName} />
                  <div>
                    <div className="text-sm font-medium text-white">{memory.uploader?.displayName || truncateAddress(memory.uploaderWallet)}</div>
                    <div className="text-xs text-slate-500">{formatDateRelative(memory.createdAt)}</div>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Thông tin file</h3>
                <div className="space-y-2 text-sm">
                  {memory.fileMimeType && <div className="flex justify-between"><span className="text-slate-400">Loại</span><span className="text-slate-200 font-mono text-xs">{memory.fileMimeType}</span></div>}
                  {memory.fileSize && <div className="flex justify-between"><span className="text-slate-400">Kích thước</span><span className="text-slate-200">{formatBytes(Number(memory.fileSize))}</span></div>}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hiển thị</span>
                    <span className="flex items-center gap-1 text-slate-200">
                      {memory.visibility === 'PRIVATE' ? <Lock size={12} /> : <Eye size={12} />}
                      {memory.visibility === 'PRIVATE' ? 'Riêng tư' : memory.visibility === 'FAMILY' ? 'Gia đình' : 'Công khai'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1"><Database size={12} /> On-chain Proof</h3>
                <div className="space-y-3">
                  {memory.shelbyBlobHash && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Hash size={10} /> File Hash</div>
                      <div className="text-xs font-mono text-slate-300 break-all bg-white/3 rounded-lg p-2">{memory.shelbyBlobHash.slice(0, 32)}...</div>
                    </div>
                  )}
                  {memory.shelbyBlobName && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Database size={10} /> Shelby Blob</div>
                      <div className="text-xs font-mono text-slate-300 break-all bg-white/3 rounded-lg p-2">{memory.shelbyBlobName}</div>
                    </div>
                  )}
                  {memory.txHash && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Link2 size={10} /> Tx Hash</div>
                      <a href={`https://explorer.aptoslabs.com/txn/${memory.txHash}?network=testnet`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 break-all">
                        {memory.txHash.slice(0, 32)}...
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {memory.shelbyBlobName && (
                <a href={displayUrl || '#'} download={displayUrl ? memory.title : undefined} 
                   className={`btn-ghost w-full justify-center ${!displayUrl && 'opacity-50 cursor-not-allowed'}`}
                   onClick={(e) => {
                     if (!displayUrl) {
                       e.preventDefault();
                       toast.error('Vui lòng giải mã file trước khi tải xuống!');
                     }
                   }}>
                  <Download size={15} /> Tải xuống
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
