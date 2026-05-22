'use client'

import { useState } from 'react'
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
    value: 'PRIVATE',
    label: 'Rieng tu',
    desc: 'Chi ban va thanh vien duoc moi moi xem duoc',
    icon: Lock,
    color: 'text-amber-400',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
  },
  {
    value: 'FAMILY_ONLY',
    label: 'Gia dinh',
    desc: 'Thanh vien trong vault co the moi nguoi khac',
    icon: Users,
    color: 'text-indigo-400',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.3)',
  },
  {
    value: 'PUBLIC',
    label: 'Cong khai',
    desc: 'Ai cung co the xem nhung chi thanh vien moi upload duoc',
    icon: Globe,
    color: 'text-emerald-400',
    bg: 'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.3)',
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
      toast.error('Tao vault that bai')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-indigo w-96 h-96 top-0 left-0" />
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 no-underline transition-colors">
          <ArrowLeft size={16} />
          Quay lai Dashboard
        </Link>

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Users2 size={32} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Tao vault gia dinh</h1>
          <p className="text-slate-400">Khong gian luu tru ky uc rieng cua gia dinh ban</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <label className="input-label">Ten gia dinh *</label>
            <input
              className="input"
              placeholder="Vi du: Gia dinh Nguyen, Nha ong Ba Noi..."
              {...register('familyName', { required: 'Bat buoc nhap ten' })}
            />
            {errors.familyName && <p className="text-red-400 text-xs mt-2">{errors.familyName.message}</p>}
          </div>

          <div className="glass rounded-2xl p-6">
            <label className="input-label">Mo ta (tuy chon)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Ke ve vault nay..."
              {...register('description')}
            />
          </div>

          <div className="glass rounded-2xl p-6">
            <label className="input-label mb-4 block">Che do rieng tu</label>
            <div className="space-y-3">
              {privacyOptions.map(opt => {
                const Icon = opt.icon
                const isSelected = selectedPrivacy === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('privacyMode', opt.value as FormData['privacyMode'])}
                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left"
                    style={{
                      background: isSelected ? opt.bg : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? opt.border : 'rgba(255,255,255,0.05)'}`,
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isSelected ? opt.bg : 'rgba(255,255,255,0.05)' }}>
                      <Icon size={18} className={isSelected ? opt.color : 'text-slate-500'} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-400'}`}>{opt.label}</div>
                      <div className="text-xs text-slate-500">{opt.desc}</div>
                    </div>
                    {isSelected && <Check size={16} className={opt.color} />}
                  </button>
                )
              })}
            </div>
          </div>

          <Button type="submit" loading={isPending} className="w-full" size="lg" icon={<Users2 size={18} />}>
            Tao vault gia dinh
          </Button>
        </form>
      </div>
    </div>
  )
}
