'use client'

import { use } from 'react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  Upload, ArrowLeft, Lock, Eye, Calendar, MapPin,
  Tag, FileText, Loader2, CheckCircle, AlertCircle
} from 'lucide-react'
import { FamilySidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/Button'
import { useFamily } from '@/hooks/useFamilies'
import { hashFile, encryptFile } from '@/lib/crypto'
import { uploadToShelby } from '@/lib/shelby'
import { getMimeTypeIcon, formatBytes, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/utils'
import type { UploadProgress } from '@/types'
import toast from 'react-hot-toast'

interface FormData {
  title: string
  description: string
  memoryType: string
  eventDate: string
  locationText: string
  tags: string
  isEncrypted: boolean
  visibility: 'PRIVATE' | 'FAMILY' | 'PUBLIC'
}

export default function UploadMemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: family } = useFamily(id)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<UploadProgress | null>(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: { visibility: 'FAMILY', isEncrypted: false, memoryType: 'PHOTO' },
  })

  const isEncrypted = watch('isEncrypted')

  const onDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) { toast.error('File quá lớn (tối đa 100MB)'); return }
    setSelectedFile(file)
    setValue('memoryType', getMimeTypeIcon(file.type))
    if (!watch('title')) setValue('title', file.name.replace(/\.[^/.]+$/, ''))
  }, [setValue, watch])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED_FILE_TYPES, maxSize: MAX_FILE_SIZE, multiple: false,
  })

  const onSubmit = async (formData: FormData) => {
    if (!selectedFile) { toast.error('Vui lòng chọn file'); return }
    try {
      setProgress({ stage: 'hashing', progress: 10, message: 'Tính hash file...' })
      const fileBytes = new Uint8Array(await selectedFile.arrayBuffer())
      const fileHash = await hashFile(fileBytes)

      let uploadBytes = fileBytes
      let encryptedKey: string | undefined
      let encryptedIv: string | undefined

      if (formData.isEncrypted) {
        setProgress({ stage: 'encrypting', progress: 30, message: 'Mã hóa file...' })
        const { encryptedBytes, keyBase64, ivBase64 } = await encryptFile(fileBytes)
        uploadBytes = encryptedBytes
        encryptedKey = keyBase64
        encryptedIv = ivBase64
      }

      setProgress({ stage: 'uploading', progress: 50, message: 'Upload lên Shelby...' })
      const blobName = `families/${id}/memories/${Date.now()}/${selectedFile.name}${formData.isEncrypted ? '.enc' : ''}`
      const shelbyResult = await uploadToShelby(uploadBytes, blobName, selectedFile.type)

      setProgress({ stage: 'saving', progress: 85, message: 'Lưu metadata...' })
      const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []

      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId: id, title: formData.title, description: formData.description,
          memoryType: formData.memoryType, eventDate: formData.eventDate || null,
          locationText: formData.locationText, isEncrypted: formData.isEncrypted,
          encryptedKey, encryptedIv, visibility: formData.visibility,
          shelbyBlobName: shelbyResult.blobName, shelbyBlobHash: shelbyResult.blobHash,
          fileMimeType: selectedFile.type, fileSize: selectedFile.size, tags,
        }),
      })

      if (!res.ok) throw new Error('Lưu thất bại')
      const memory = await res.json()
      setProgress({ stage: 'done', progress: 100, message: 'Upload thành công!' })
      toast.success('Upload ký ức thành công!')
      setTimeout(() => router.push(`/family/${id}/memory/${memory.id}`), 1000)
    } catch (err) {
      console.error(err)
      setProgress({ stage: 'error', progress: 0, message: 'Upload thất bại' })
      toast.error('Upload thất bại, vui lòng thử lại')
    }
  }

  const isUploading = progress && progress.stage !== 'done' && progress.stage !== 'error'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <FamilySidebar familyId={id} familyName={family?.familyName} />
      <main className="ml-60 pt-16">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <Link href={`/family/${id}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 no-underline transition-colors">
            <ArrowLeft size={16} /> Quay lại vault
          </Link>
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Upload ký ức mới</h1>
            <p className="text-slate-400">File sẽ được lưu lên Shelby Protocol và hash trên Aptos</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dropzone */}
            <div className="glass rounded-2xl p-6">
              <label className="input-label mb-4 block">File ký ức *</label>
              <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="text-4xl mb-2">
                      {selectedFile.type.startsWith('image') ? '📷' : selectedFile.type.startsWith('video') ? '🎬' : selectedFile.type.startsWith('audio') ? '🎵' : '📄'}
                    </div>
                    <p className="font-semibold text-white">{selectedFile.name}</p>
                    <p className="text-slate-400 text-sm">{formatBytes(selectedFile.size)}</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }} className="text-xs text-red-400 hover:text-red-300">Xóa file</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload size={40} className="text-indigo-400 mx-auto" />
                    <p className="text-white font-semibold">{isDragActive ? 'Thả file vào đây...' : 'Kéo thả hoặc click để chọn file'}</p>
                    <p className="text-slate-400 text-sm">Hỗ trợ: Ảnh, Video, Âm thanh, PDF, DOC (tối đa 100MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <label className="input-label block">Thông tin ký ức</label>
              <div>
                <label className="input-label">Tiêu đề *</label>
                <input className="input" placeholder="Sinh nhật bả ba 70 tuổi..." {...register('title', { required: 'Bắt buộc' })} />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="input-label">Mô tả</label>
                <textarea className="input resize-none" rows={3} placeholder="Ghi lại câu chuyện, cảm xúc..." {...register('description')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label flex items-center gap-1"><Calendar size={12} /> Ngày sự kiện</label>
                  <input type="date" className="input" {...register('eventDate')} />
                </div>
                <div>
                  <label className="input-label flex items-center gap-1"><MapPin size={12} /> Địa điểm</label>
                  <input className="input" placeholder="Hà Nội, Việt Nam..." {...register('locationText')} />
                </div>
              </div>
              <div>
                <label className="input-label flex items-center gap-1"><Tag size={12} /> Tags (cách nhau bằng dấu phẩy)</label>
                <input className="input" placeholder="gia đình, sinh nhật, 2024..." {...register('tags')} />
              </div>
            </div>

            {/* Privacy */}
            <div className="glass rounded-2xl p-6">
              <label className="input-label block mb-4">Quyền truy cập</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { value: 'PRIVATE', label: 'Riêng tư', icon: Lock, color: 'text-amber-400' },
                  { value: 'FAMILY', label: 'Gia đình', icon: Eye, color: 'text-indigo-400' },
                  { value: 'PUBLIC', label: 'Công khai', icon: FileText, color: 'text-emerald-400' },
                ].map(opt => {
                  const Icon = opt.icon
                  const isSelected = watch('visibility') === opt.value
                  return (
                    <button key={opt.value} type="button" onClick={() => setValue('visibility', opt.value as FormData['visibility'])}
                      className={`p-3 rounded-xl flex flex-col items-center gap-2 text-center transition-all border ${isSelected ? 'bg-indigo-500/15 border-indigo-500/40' : 'bg-white/2 border-white/5 hover:border-white/10'}`}>
                      <Icon size={18} className={isSelected ? opt.color : 'text-slate-500'} />
                      <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-slate-400'}`}>{opt.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                style={{ background: isEncrypted ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isEncrypted ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.06)'}` }}
                onClick={() => setValue('isEncrypted', !isEncrypted)}>
                <div className="flex items-center gap-3">
                  <Lock size={18} className={isEncrypted ? 'text-amber-400' : 'text-slate-500'} />
                  <div>
                    <div className={`font-semibold text-sm ${isEncrypted ? 'text-white' : 'text-slate-400'}`}>Mã hóa file</div>
                    <div className="text-xs text-slate-500">AES-256-GCM ngay trên trình duyệt</div>
                  </div>
                </div>
                <div className={`w-11 h-6 rounded-full transition-all relative ${isEncrypted ? 'bg-amber-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isEncrypted ? 'left-6' : 'left-1'}`} />
                </div>
              </div>
            </div>

            {/* Progress */}
            {progress && (
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  {progress.stage === 'done' ? <CheckCircle size={20} className="text-emerald-400" /> :
                   progress.stage === 'error' ? <AlertCircle size={20} className="text-red-400" /> :
                   <Loader2 size={20} className="text-indigo-400 animate-spin" />}
                  <span className="text-sm font-medium text-white">{progress.message}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress.progress}%` }} /></div>
              </div>
            )}

            <Button type="submit" loading={!!isUploading} disabled={!selectedFile} className="w-full" size="lg" icon={<Upload size={18} />}>
              {isEncrypted ? 'Mã hóa & Upload lên Shelby' : 'Upload lên Shelby Protocol'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
