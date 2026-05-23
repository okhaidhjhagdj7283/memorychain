'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Users2, Lock, Globe, Users, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useCreateFamily } from '@/hooks/useFamilies'
import toast from 'react-hot-toast'

interface FormData {
  familyName: string
  description: string
  privacyMode: 'PRIVATE' | 'FAMILY_ONLY' | 'PUBLIC'
}

const privacyOptions = [
  {
    value: 'PRIVATE' as const,
    label: 'Riêng tư',
    desc: 'Chỉ bạn và thành viên được mời mới xem được',
    icon: Lock,
    color: 'var(--amber)',
    bg: 'var(--amber-dim)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    value: 'FAMILY_ONLY' as const,
    label: 'Gia đình',
    desc: 'Thành viên trong vault có thể mời người khác',
    icon: Users,
    color: 'var(--indigo-light)',
    bg: 'var(--indigo-dim)',
    border: 'rgba(99,102,241,0.25)',
  },
  {
    value: 'PUBLIC' as const,
    label: 'Công khai',
    desc: 'Ai cũng có thể xem, nhưng chỉ thành viên mới upload được',
    icon: Globe,
    color: 'var(--green)',
    bg: 'var(--green-dim)',
    border: 'rgba(34,197,94,0.25)',
  },
]

export default function CreateFamilyPage() {
  const router = useRouter()
  const { mutateAsync: createFamily, isPending } = useCreateFamily()
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: { privacyMode: 'PRIVATE' },
  })
  const selectedPrivacy = watch('privacyMode')

  const onSubmit = async (data: FormData) => {
    try {
      const family = await createFamily(data)
      router.push(`/family/${family.id}`)
    } catch {
      toast.error('Tạo vault thất bại')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <div className="fixed inset-0 pointer-events-none bg-grid opacity-35" />
      <div
        className="fixed pointer-events-none"
        style={{
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 py-8 pt-24 animate-slide-up">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 mb-7 no-underline transition-colors text-sm"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
        >
          <ArrowLeft size={15} /> Quay lại Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, var(--indigo), #7c3aed)' }}
          >
            <Users2 size={28} className="text-white" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: 'var(--text-1)' }}>
            Tạo vault gia đình
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>
            Không gian lưu trữ ký ức riêng của gia đình bạn
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="card p-4 sm:p-5">
            <label className="input-label mb-2 block">Tên gia đình *</label>
            <input
              className="input"
              placeholder="Ví dụ: Gia đình Nguyễn, Nhà ông Bà Nội…"
              {...register('familyName', { required: 'Bắt buộc nhập tên' })}
            />
            {errors.familyName && (
              <p className="text-xs mt-1.5" style={{ color: 'var(--red)' }}>{errors.familyName.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="card p-4 sm:p-5">
            <label className="input-label mb-2 block">Mô tả (tùy chọn)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Kể về vault này…"
              {...register('description')}
            />
          </div>

          {/* Privacy */}
          <div className="card p-4 sm:p-5">
            <label className="input-label mb-3 block">Chế độ riêng tư</label>
            <div className="space-y-2.5">
              {privacyOptions.map(opt => {
                const Icon = opt.icon
                const isSelected = selectedPrivacy === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('privacyMode', opt.value)}
                    className="w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all text-left"
                    style={{
                      background: isSelected ? opt.bg : 'transparent',
                      border: `1px solid ${isSelected ? opt.border : 'var(--border)'}`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isSelected ? opt.bg : 'rgba(255,255,255,0.04)' }}
                    >
                      <Icon size={16} style={{ color: isSelected ? opt.color : 'var(--text-3)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-semibold text-sm mb-0.5"
                        style={{ color: isSelected ? 'var(--text-1)' : 'var(--text-2)' }}
                      >
                        {opt.label}
                      </div>
                      <div className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>{opt.desc}</div>
                    </div>
                    {isSelected && <Check size={15} style={{ color: opt.color, flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          </div>

          <Button type="submit" loading={isPending} className="w-full" size="lg" icon={<Users2 size={17} />}>
            Tạo vault gia đình
          </Button>
        </form>
      </div>
    </div>
  )
}
