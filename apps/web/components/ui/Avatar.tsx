import { cn } from '@/lib/utils'

interface AvatarProps {
  name?: string
  address?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  imageUrl?: string
  className?: string
}

export function Avatar({ name, address, size = 'md', imageUrl, className }: AvatarProps) {
  const sizes = { sm: 32, md: 40, lg: 48, xl: 64 }
  const fontSize = { sm: '0.7rem', md: '0.85rem', lg: '1rem', xl: '1.3rem' }
  const px = sizes[size]

  const letter = name?.charAt(0)?.toUpperCase() || 
    address?.slice(2, 4)?.toUpperCase() || '?'

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || address}
        className={cn('avatar object-cover', className)}
        style={{ width: px, height: px }}
      />
    )
  }

  return (
    <div
      className={cn('avatar', className)}
      style={{ width: px, height: px, fontSize: fontSize[size] }}
    >
      {letter}
    </div>
  )
}
