'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowRight, ShieldCheck, Award } from 'lucide-react'

export default function ResultsLookupPage() {
  const router = useRouter()
  const [lookupCode, setLookupCode] = useState('')
  const [error, setError] = useState('')

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lookupCode.trim()) {
      setError('Vui lòng nhập mã tra cứu kết quả')
      return
    }
    router.push(`/results/${encodeURIComponent(lookupCode.trim().toUpperCase())}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-500 flex items-center justify-center mx-auto shadow-sm">
          <Search className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-brand-900">
          Tra cứu kết quả bài thi
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Nhập mã kết quả (được cấp sau khi nộp bài, ví dụ: <code>TD-2026-CTV001-XXXX</code>) để xem điểm số, nhận xét và chứng nhận hoàn thành.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-soft border border-brand-100 space-y-6">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Mã tra cứu kết quả
            </label>
            <div className="relative">
              <input
                type="text"
                value={lookupCode}
                onChange={(e) => {
                  setLookupCode(e.target.value)
                  setError('')
                }}
                placeholder="Ví dụ: TD-2026-CTV2026-001-A1B2C3"
                className="w-full px-5 py-4 rounded-2xl border border-slate-300 text-base font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            {error && <p className="text-xs text-rose-500 mt-2 font-medium">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-base transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <span>TRA CỨU NGAY</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Dữ liệu được xác thực tự động</span>
          </span>
          <Link href="/leaderboard" className="text-brand-600 font-semibold hover:underline flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-gold-500" />
            <span>Xem Bảng xếp hạng</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
