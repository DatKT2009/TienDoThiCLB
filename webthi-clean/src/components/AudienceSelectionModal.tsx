'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BronzeDrumLogo from './BronzeDrumLogo'
import { UserCheck, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, X, RefreshCw } from 'lucide-react'

export type AudienceType = 'INTERVIEW' | 'MEMBER'

export default function AudienceSelectionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentAudience, setCurrentAudience] = useState<AudienceType | null>(null)
  const [canClose, setCanClose] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has already selected an audience
    const saved = localStorage.getItem('trongdong_audience') as AudienceType | null
    if (saved) {
      setCurrentAudience(saved)
      setCanClose(true)
    } else {
      // Show modal on first entrance
      setIsOpen(true)
      setCanClose(false)
    }

    // Listen for manual open trigger (e.g. from navbar button)
    const handleOpen = () => {
      setCanClose(true)
      setIsOpen(true)
    }

    window.addEventListener('open-audience-modal', handleOpen)
    return () => window.removeEventListener('open-audience-modal', handleOpen)
  }, [])

  const handleSelect = (choice: AudienceType) => {
    localStorage.setItem('trongdong_audience', choice)
    setCurrentAudience(choice)
    setIsOpen(false)

    // Notify other components (Navbar, Exam list, etc.)
    window.dispatchEvent(new CustomEvent('audience-changed', { detail: choice }))

    // Redirect to exams page with filtered audience
    router.push(`/exams?audience=${choice}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => canClose && setIsOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-brand-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-8">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-brand-900 via-brand-700 to-brand-600 text-white p-6 sm:p-8 text-center pattern-bronze-drum">
          {canClose && (
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex justify-center mb-3">
            <BronzeDrumLogo size={60} variant="light" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold border border-gold-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HỆ THỐNG THI ĐUA TRỰC TUYẾN TRỐNG ĐỒNG</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Vui lòng chọn đối tượng tham gia
          </h2>
          <p className="mt-2 text-sm sm:text-base text-brand-100 max-w-2xl mx-auto">
            Để hệ thống phân luồng đúng bộ đề thi, câu hỏi khảo sát và quy chế phù hợp với bạn
          </p>
        </div>

        {/* 2 Main Choice Cards */}
        <div className="p-6 sm:p-10 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BUTTON 1: ĐANG PHỎNG VẤN */}
            <div
              onClick={() => handleSelect('INTERVIEW')}
              className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border-2 transition-all cursor-pointer bg-white hover:shadow-xl hover:-translate-y-1 ${
                currentAudience === 'INTERVIEW'
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                  : 'border-slate-200 hover:border-emerald-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Ứng Viên / CTV Mới
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  1. Đang Phỏng Vấn
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Dành cho các bạn HSSV, ứng viên đang tham gia tuyển chọn CTV vào CLB
                </p>

                <div className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Bộ 60 câu hỏi khảo sát nhận thức cơ bản & tinh thần tình nguyện</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Kiểm tra thái độ, tác phong và sự phù hợp với văn hóa Trống Đồng</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Chấm điểm trắc nghiệm tự động & công bố kết quả ngay sau khi nộp</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all group-hover:shadow-lg"
                >
                  <span>VÀO THI (ĐANG PHỎNG VẤN)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* BUTTON 2: ĐÃ VÀO CLB */}
            <div
              onClick={() => handleSelect('MEMBER')}
              className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl border-2 transition-all cursor-pointer bg-white hover:shadow-xl hover:-translate-y-1 ${
                currentAudience === 'MEMBER'
                  ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/10'
                  : 'border-slate-200 hover:border-brand-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    BĐH – Thành Viên – Trực VPĐ
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-brand-700 transition-colors">
                  2. Đã Vào CLB
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Dành cho Ban Điều Hành, Thành Viên chính thức & CTV Trực Văn phòng Đoàn
                </p>

                <div className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>Bộ đề khảo sát Quý 3/2026: 30 trắc nghiệm + 5 câu tự luận chuyên sâu</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>Bộ 60 câu kiểm tra Nghiệp vụ & Nội quy Trực Văn phòng Đoàn (VPĐ)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>Đánh giá Nội quy sinh hoạt, tiêu chuẩn Khen thưởng & Kỷ luật</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 hover:from-brand-700 hover:to-brand-900 shadow-md shadow-brand-700/25 flex items-center justify-center gap-2 transition-all group-hover:shadow-lg"
                >
                  <span>VÀO THI (ĐÃ VÀO CLB)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Subtext info */}
          <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Bạn có thể linh hoạt chuyển đổi giữa 2 luồng bất cứ lúc nào qua nút trên thanh điều hướng.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
