import React from 'react'

interface BronzeDrumLogoProps {
  className?: string
  size?: number
  variant?: 'light' | 'dark' | 'brand'
}

export default function BronzeDrumLogo({
  className = '',
  size = 40,
}: BronzeDrumLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo-clb-trong-dong.png"
        alt="Logo CLB Thanh niên tình nguyện Trống Đồng"
        width={size}
        height={size}
        className="w-full h-full object-contain rounded-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
      />
    </div>
  )
}
