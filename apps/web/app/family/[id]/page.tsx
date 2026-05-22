'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { Upload, Grid3X3, List, Search, Image as ImageIcon, Video, Music, FileText } from 'lucide-react'
import { useFamily } from '@/hooks/useFamilies'
import { useMemories } from '@/hooks/useMemories'
import { FamilySidebar } from '@/components/layout/Sidebar'
import { MemoryCard } from '@/components/memory/MemoryCard'
import { MemoryCardSkeleton } from '@/components/ui/Skeleton'
import { PrivacyBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

const memoryTypeFilters = [
  { value: '', label: 'Tất cả', icon: Grid3X3 },
  { value: 'PHOTO', label: 'Ảnh', icon: ImageIcon },
  { value: 'VIDEO', label: 'Video', icon: Video },
  { value: 'AUDIO', label: 'Âm thanh', icon: Music },
  { value: 'DOCUMENT', label: 'Tài liệu', icon: FileText },
]

export default function FamilyVaultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedType, setSelectedType] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: family, isLoading: familyLoading } = useFamily(id)
  const { data: memories, isLoading: memoriesLoading } = useMemories(id)

  const filteredMemories = memories?.filter(m => {
    if (selectedType && m.memoryType !== selectedType) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return m.title.toLowerCase().includes(q) || (m.description?.toLowerCase().includes(q)) || m.tags.some(t => t.toLowerCase().includes(q))
    }
    return true
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <FamilySidebar familyId={id} familyName={family?.familyName} />
      <main className="ml-60 pt-16">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            {familyLoading ? (
              <div className="space-y-2"><div className="skeleton h-8 w-64" /><div className="skeleton h-4 w-48" /></div>
            ) : family ? (
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-display text-3xl font-bold text-white">{family.familyName}</h1>
                    <PrivacyBadge mode={family.privacyMode} />
                  </div>
                  {family.description && <p className="text-slate-400 mb-3">{family.description}</p>}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>{family._count?.members || 0} thành viên</span>
                    <span>•</span>
                    <span>{family._count?.memories || 0} ký ức</span>
                    <span>•</span>
                    <span>Tạo {formatDate(family.createdAt)}</span>
                  </div>
                </div>
                <Link href={`/family/${id}/upload`}>
                  <Button icon={<Upload size={16} />}>Upload ký ức</Button>
                </Link>
              </div>
            ) : null}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-9" placeholder="Tìm kiếm ký ức..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="tab-bar">
              {memoryTypeFilters.map(({ value, label, icon: Icon }) => (
                <button key={value} className={`tab-item flex items-center gap-1.5 ${selectedType === value ? 'active' : ''}`} onClick={() => setSelectedType(value)}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}><Grid3X3 size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-white'}`}><List size={18} /></button>
            </div>
          </div>

          {/* Grid */}
          {memoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => <MemoryCardSkeleton key={i} />)}</div>
          ) : filteredMemories && filteredMemories.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredMemories.map(memory => <MemoryCard key={memory.id} memory={memory} familyId={id} />)}
            </div>
          ) : (
            <div className="empty-state glass rounded-2xl">
              <div className="text-5xl mb-4">{selectedType === 'PHOTO' ? '📷' : selectedType === 'VIDEO' ? '🎬' : '🗂️'}</div>
              <h3 className="text-xl font-bold text-white mb-2">{searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có ký ức nào'}</h3>
              <p className="text-slate-400 mb-6">{searchQuery ? `Không có ký ức nào khớp với "${searchQuery}"` : 'Hãy upload ký ức đầu tiên cho vault này'}</p>
              {!searchQuery && <Link href={`/family/${id}/upload`}><Button icon={<Upload size={16} />}>Upload ký ức đầu tiên</Button></Link>}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
