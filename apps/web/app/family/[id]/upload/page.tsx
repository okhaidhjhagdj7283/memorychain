'use client'

import { use } from 'react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  Upload, ArrowLeft, Lock, Eye, Calendar, MapPin,
  Tag, FileText, Loader2, CheckCircle, AlertCircle, Globe,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
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
  const visibility  = watch('visibility')

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
      void await hashFile(fileBytes)

      let uploadBytes = fileBytes
      let encryptedKey: string | undefined
      let encryptedIv: string | undefined

      if (formData.isEncrypted) {
        setProgress({ stage: 'encrypting', progress: 30, message: 'Mã hóa file...' })
        const { encryptedBytes, keyBase64, ivBase64 } = await encryptFile(fileBytes)
        uploadBytes  = encryptedBytes
        encryptedKey = keyBase64
        encryptedIv  = ivBase64
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

  const visibilityOptions = [
    { value: 'PRIVATE', label: 'Riêng tư',  icon: Lock,  color: 'var(--amber)',        activeColor: 'rgba(245,158,11,0.08)',  activeBorder: 'rgba(245,158,11,0.25)' },
    { value: 'FAMILY',  label: 'Gia đình',  icon: Eye,   color: 'var(--indigo-light)', activeColor: 'var(--indigo-dim)',      activeBorder: 'rgba(99,102,241,0.3)' },
    { value: 'PUBLIC',  label: 'Công khai', icon: Globe,  color: 'var(--green)',        activeColor: 'var(--green-dim)',      activeBorder: 'rgba(34,197,94,0.25)' },
  ]

  return (
    <AppLayout familyId={id} familyName={family?.familyName}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-7">

        {/* Back link */}
        <Link
          href={`/family/${id}`}
          className="inline-flex items-center gap-1.5 mb-5 no-underline transition-colors text-sm"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <ArrowLeft size={15} /> Quay lại vault
        </Link>

        <div className="mb-5">
          <h1 className="font-display text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>
            Upload ký ức mới
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            File sẽ được lưu lên Shelby Protocol và hash trên Aptos
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ── Dropzone ───────────────────────────────── */}
          <div className="card p-4 sm:p-5">
            <label className="input-label mb-3 block">File ký ức *</label>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-4xl mb-2">
                    {selectedFile.type.startsWith('image') ? '📷'
                      : selectedFile.type.startsWith('video') ? '🎬'
                      : selectedFile.type.startsWith('audio') ? '🎵'
                      : '📄'}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{selectedFile.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-2)' }}>{formatBytes(selectedFile.size)}</p>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setSelectedFile(null) }}
                    className="text-xs transition-colors"
                    style={{ color: 'var(--red)' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    Xóa file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={36} className="mx-auto" style={{ color: 'var(--indigo-light)' }} />
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
                    {isDragActive ? 'Thả file vào đây…' : 'Kéo thả hoặc click để chọn file'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    Hỗ trợ: Ảnh, Video, Âm thanh, PDF, DOC (tối đa 100MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Metadata ───────────────────────────────── */}
          <div className="card p-4 sm:p-5 space-y-4">
            <label className="input-label block">Thông tin ký ức</label>
            <div>
              <label className="input-label">Tiêu đề *</label>
              <input
                className="input"
                placeholder="Sinh nhật bà ba 70 tuổi…"
                {...register('title', { required: 'Bắt buộc nhập tiêu đề' })}
              />
              {errors.title && <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.title.message}</p>}
            </div>
            <div>
              <label className="input-label">Mô tả</label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Ghi lại câu chuyện, cảm xúc…"
                {...register('description')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label flex items-center gap-1"><Calendar size={11} /> Ngày sự kiện</label>
                <input type="date" className="input" {...register('eventDate')} />
              </div>
              <div>
                <label className="input-label flex items-center gap-1"><MapPin size={11} /> Địa điểm</label>
                <input className="input" placeholder="Hà Nội, Việt Nam…" {...register('locationText')} />
              </div>
            </div>
            <div>
              <label className="input-label flex items-center gap-1"><Tag size={11} /> Tags (cách nhau bằng dấu phẩy)</label>
              <input className="input" placeholder="gia đình, sinh nhật, 2024…" {...register('tags')} />
            </div>
          </div>

          {/* ── Privacy ────────────────────────────────── */}
          <div className="card p-4 sm:p-5">
            <label className="input-label block mb-3">Quyền truy cập</label>
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {visibilityOptions.map(opt => {
                const Icon = opt.icon
                const isSelected = visibility === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('visibility', opt.value as FormData['visibility'])}
                    className="p-3 rounded-xl flex flex-col items-center gap-2 text-center transition-all"
                    style={{
                      background: isSelected ? opt.activeColor : 'transparent',
                      border: `1px solid ${isSelected ? opt.activeBorder : 'var(--border)'}`,
                    }}
                  >
                    <Icon size={17} style={{ color: isSelected ? opt.color : 'var(--text-3)' }} />
                    <span
                      className="text-xs font-medium leading-tight"
                      style={{ color: isSelected ? 'var(--text-1)' : 'var(--text-3)' }}
                    >
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Encrypt toggle */}
            <div
              className="flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all"
              style={{
                background: isEncrypted ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.025)',
                border: `1px solid ${isEncrypted ? 'rgba(245,158,11,0.2)' : 'var(--border)'}`,
              }}
              onClick={() => setValue('isEncrypted', !isEncrypted)}
            >
              <div className="flex items-center gap-3">
                <Lock size={16} style={{ color: isEncrypted ? 'var(--amber)' : 'var(--text-3)' }} />
                <div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: isEncrypted ? 'var(--text-1)' : 'var(--text-2)' }}
                  >
                    Mã hóa file
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>AES-256-GCM ngay trên trình duyệt</div>
                </div>
              </div>
              <div className={`toggle ${isEncrypted ? 'active' : ''}`} style={{ background: isEncrypted ? 'var(--amber)' : undefined }}>
                <div className="toggle-thumb" />
              </div>
            </div>
          </div>

          {/* ── Progress ───────────────────────────────── */}
          {progress && (
            <div className="card p-4 sm:p-5 animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                {progress.stage === 'done'  ? <CheckCircle size={18} style={{ color: 'var(--green)' }} />  :
                 progress.stage === 'error' ? <AlertCircle size={18} style={{ color: 'var(--red)' }}   />  :
                 <Loader2 size={18} className="animate-spin" style={{ color: 'var(--indigo-light)' }} />}
                <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{progress.message}</span>
                <span className="ml-auto text-xs font-mono" style={{ color: 'var(--text-3)' }}>
                  {progress.progress}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress.progress}%` }} />
              </div>
            </div>
          )}

          <Button
            type="submit"
            loading={!!isUploading}
            disabled={!selectedFile}
            className="w-full"
            size="lg"
            icon={<Upload size={17} />}
          >
            {isEncrypted ? 'Mã hóa & Upload lên Shelby' : 'Upload lên Shelby Protocol'}
          </Button>
        </form>
      </div>
    </AppLayout>
  )
}
