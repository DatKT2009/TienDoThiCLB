'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import {
  Award,
  CheckCircle2,
  Clock,
  User,
  Copy,
  Check,
  Share2,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react'

export default function ResultDetailPage({ params }: { params: { lookupCode: string } }) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchResult()
  }, [params.lookupCode])

  const fetchResult = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/results/${params.lookupCode}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Không tìm thấy kết quả bài thi')
        setLoading(false)
        return
      }

      setResult(data.result)
      setLoading(false)

      // Trigger celebration confetti if passed or scored >= 50%
      if (data.result.finalScore >= (data.result.maxScore || 100) * 0.5) {
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          })
        }, 300)
      }
    } catch (e: any) {
      setErrorMsg('Lỗi khi tải kết quả bài thi')
      setLoading(false)
    }
  }

  const copyLookupCode = () => {
    if (!result?.lookupCode) return
    navigator.clipboard.writeText(result.lookupCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m} phút ${s} giây`
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Đang tổng hợp kết quả bài thi...</p>
      </div>
    )
  }

  if (errorMsg || !result) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center shadow-soft space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy kết quả</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{errorMsg}</p>
        <Link
          href="/results"
          className="inline-block px-6 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm"
        >
          Tra cứu lại mã khác
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. SCORE HIGHLIGHT CARD */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white rounded-3xl p-8 sm:p-12 shadow-card text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-100">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>KẾT QUẢ THI ĐUA CHÍNH THỨC</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold max-w-2xl mx-auto">
            {result.examTitle}
          </h1>

          {/* Big Score Display */}
          <div className="py-4">
            <div className="inline-flex flex-col items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white text-brand-950 shadow-2xl border-4 border-gold-400">
              <span className="text-4xl sm:text-5xl font-extrabold text-brand-900">
                {result.finalScore}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase mt-0.5">
                / {result.maxScore} điểm
              </span>
            </div>
          </div>

          {/* Pass / Fail Badge */}
          <div>
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider ${
                result.isPassed
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-amber-400 text-slate-950 shadow-md'
              }`}
            >
              {result.isPassed ? '✓ ĐẠT CHUẨN KỲ THI' : 'CHƯA ĐẠT CHUẨN'}
            </span>
          </div>

          {/* Lookup Code Badge */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-brand-100">
            <span>Mã tra cứu kết quả:</span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black/20 rounded-xl border border-white/20 font-mono font-bold text-white">
              <span>{result.lookupCode}</span>
              <button
                onClick={copyLookupCode}
                className="hover:text-gold-400 transition-colors"
                title="Sao chép mã"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CANDIDATE & EXAM METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidate Info */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-brand-100 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-900 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" />
            <span>Thông tin thí sinh</span>
          </h3>

          <div className="space-y-2 text-xs sm:text-sm divide-y divide-slate-100">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Họ và tên:</span>
              <span className="font-bold text-slate-900">{result.fullName}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Mã thí sinh / CTV:</span>
              <span className="font-mono font-bold text-brand-700">{result.candidateCode}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Đối tượng:</span>
              <span className="font-semibold text-slate-800">
                {result.participantType === 'CTV'
                  ? 'Cộng tác viên (CTV)'
                  : result.participantType === 'MEMBER'
                  ? 'Thành viên CLB'
                  : 'Ban Điều hành'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Chi đoàn / Ban bộ phận:</span>
              <span className="font-semibold text-slate-800">{result.unitName}</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-brand-100 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-brand-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-gold-500" />
            <span>Chi tiết điểm thành phần</span>
          </h3>

          <div className="space-y-2 text-xs sm:text-sm divide-y divide-slate-100">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Điểm trắc nghiệm khách quan:</span>
              <span className="font-bold text-emerald-600">{result.objectiveScore} điểm</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Điểm tự luận & tình huống:</span>
              <span className="font-bold text-brand-600">
                {result.aiScore} điểm{' '}
                <span className="text-[11px] font-normal text-slate-500">
                  ({result.reviewStatus === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'})
                </span>
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Thời gian làm bài:</span>
              <span className="font-semibold text-slate-800">{formatDuration(result.durationSeconds)}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Trạng thái chấm:</span>
              <span className="font-semibold px-2 py-0.5 rounded text-xs bg-brand-50 text-brand-700">
                {result.reviewStatus === 'APPROVED'
                  ? 'Đã chấm tự động & duyệt'
                  : 'Đã chấm tự động (Đang chờ BĐH duyệt)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DETAILED QUESTION BREAKDOWN (If review is allowed) */}
      {result.answers && result.answers.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-brand-100 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-brand-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-500" />
              <span>Nhận xét & Đánh giá chi tiết từng câu hỏi</span>
            </h3>
            <span className="text-xs text-slate-500">Tổng cộng {result.answers.length} câu</span>
          </div>

          <div className="space-y-4">
            {result.answers.map((ans: any, idx: number) => (
              <div
                key={ans.questionId}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-800">
                    Câu {idx + 1}: {ans.questionContent}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 ${
                      ans.score >= ans.maxScore
                        ? 'bg-emerald-100 text-emerald-800'
                        : ans.score > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {ans.score} / {ans.maxScore} đ
                  </span>
                </div>

                {ans.feedback && (
                  <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                    <strong>Nhận xét:</strong> {ans.feedback}
                  </p>
                )}

                {/* Criteria breakdown for essay if available */}
                {ans.criteriaScores && ans.criteriaScores.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {ans.criteriaScores.map((crit: any, cIdx: number) => (
                      <div key={cIdx} className="text-[11px] bg-white p-2.5 rounded-lg border border-slate-100 flex justify-between">
                        <span className="text-slate-600 truncate mr-2">{crit.name}</span>
                        <span className="font-bold text-brand-600 flex-shrink-0">{crit.score}/{crit.maxPoints}đ</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/leaderboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all"
        >
          <Award className="w-4 h-4 text-gold-400" />
          <span>Xem Bảng xếp hạng thi đua</span>
        </Link>
        <Link
          href="/exams"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-white transition-all"
        >
          <span>Khám phá các kỳ thi khác</span>
        </Link>
      </div>
    </div>
  )
}
