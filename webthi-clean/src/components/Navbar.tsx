'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/router'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import BronzeDrumLogo from './BronzeDrumLogo'
import { Menu, X, Shield, Award, BookOpen, Search, Home, FileCheck, Users, RefreshCw, UserCheck, ShieldCheck } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [audience, setAudience] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token')
      setIsAdmin(!!token)
      setAudience(localStorage.getItem('trongdong_audience'))

      const handleAudienceChange = (e: any) => {
        setAudience(e.detail || localStorage.getItem('trongdong_audience'))
      }
      window.addEventListener('audience-changed', handleAudienceChange)
      return () => window.removeEventListener('audience-changed', handleAudienceChange)
    }
  }, [pathname])

  const openAudienceModal = () => {
    window.dispatchEvent(new CustomEvent('open-audience-modal'))
  }

  const navLinks = [
    { label: 'Trang chủ', href: '/', icon: Home },
    { label: 'Kỳ thi', href: '/exams', icon: FileCheck },
    { label: 'Thể lệ', href: '/rules', icon: BookOpen },
    { label: 'Bảng xếp hạng', href: '/leaderboard', icon: Award },
    { label: 'Tra cứu kết quả', href: '/results', icon: Search },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand title */}
          <NextLink href="/" className="flex items-center gap-3.5 group">
            <BronzeDrumLogo size={46} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-brand-900 group-hover:text-brand-500 transition-colors">
                  TRỐNG ĐỒNG
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-brand-100 text-brand-700 rounded-full border border-brand-200">
                  THI ĐUA TRỰC TUYẾN
                </span>
              </div>
              <p className="text-xs text-brand-700 font-medium tracking-wide">
                CLB Thanh niên tình nguyện Trống Đồng
              </p>
            </div>
          </NextLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                      : 'text-brand-900 hover:text-brand-500 hover:bg-brand-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-500'}`} />
                  <span>{item.label}</span>
                </NextLink>
              )
            })}
          </nav>

          {/* Audience Switcher & Admin Action Button */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Audience Badge / Button */}
            <button
              onClick={openAudienceModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-sm ${
                audience === 'INTERVIEW'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : audience === 'MEMBER'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-brand-50 text-brand-800 border-brand-200 hover:bg-brand-100'
              }`}
              title="Nhấn để đổi đối tượng tham gia (Đang Phỏng Vấn / Đã Vào CLB)"
            >
              {audience === 'INTERVIEW' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đang Phỏng Vấn</span>
                </>
              ) : audience === 'MEMBER' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Đã Vào CLB</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5 text-brand-600" />
                  <span>Chọn Luồng</span>
                </>
              )}
              <span className="text-[10px] px-1 py-0.2 bg-white/70 rounded text-slate-500 border border-slate-200 flex items-center gap-0.5">
                <RefreshCw className="w-2.5 h-2.5" /> Đổi
              </span>
            </button>

            {isAdmin ? (
              <NextLink
                href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 transition-all shadow-sm"
              >
                <Shield className="w-3.5 h-3.5 text-brand-300" />
                <span>Quản Trị</span>
              </NextLink>
            ) : (
              <NextLink
                href="/admin/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-300 text-brand-700 text-xs font-semibold hover:bg-brand-50 hover:border-brand-500 transition-all"
              >
                <Shield className="w-3.5 h-3.5 text-brand-500" />
                <span>Admin</span>
              </NextLink>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-brand-900 hover:text-brand-500 hover:bg-brand-50 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-brand-100 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {navLinks.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <NextLink
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-brand-900 hover:bg-brand-50 hover:text-brand-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-brand-500'}`} />
                <span>{item.label}</span>
              </NextLink>
            )
          })}
          <div className="pt-2 border-t border-brand-100 space-y-2">
            <button
              onClick={() => {
                setIsOpen(false)
                openAudienceModal()
              }}
              className="flex items-center justify-between w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                {audience === 'INTERVIEW' ? (
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                ) : audience === 'MEMBER' ? (
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                ) : (
                  <Users className="w-5 h-5 text-brand-600" />
                )}
                <span>
                  Đối tượng: {audience === 'INTERVIEW' ? 'Đang Phỏng Vấn' : audience === 'MEMBER' ? 'Đã Vào CLB' : 'Chưa chọn'}
                </span>
              </div>
              <span className="text-xs text-brand-600 font-bold flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Đổi
              </span>
            </button>
            {isAdmin ? (
              <NextLink
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-700 text-white font-semibold text-center"
              >
                <Shield className="w-5 h-5 text-brand-300" />
                <span>Trang Quản Trị Hệ Thống</span>
              </NextLink>
            ) : (
              <NextLink
                href="/admin/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-brand-300 text-brand-700 font-semibold text-center hover:bg-brand-50"
              >
                <Shield className="w-5 h-5 text-brand-500" />
                <span>Đăng nhập Quản trị viên</span>
              </NextLink>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
