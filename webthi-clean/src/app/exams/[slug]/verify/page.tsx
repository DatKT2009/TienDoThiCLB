'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldAlert,
  UserCheck,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Clock,
  Award,
  HelpCircle,
  Building,
  BadgeAlert,
  Loader2
} from 'lucide-react'

export default function CandidateVerifyPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [exam, setExam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [blockedType, setBlockedType] = useState<string | null>(null)

  // Form states
  const [fullName, setFullName] = useState('')
  const [candidateCode, setCandidateCode] = useState('')
  const [participantType, setParticipantType] = useState<'CTV' | 'MEMBER' | 'EXECUTIVE'>('CTV')
  const [unitName, setUnitName] = useState('')
  const [agreedTerms, setAgreedTerms] = useState(false)

  useEffect(() => {
    fetchExam()
  }, [params.slug])

  const fetchExam = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/exams/${params.slug}`)
      const data = await res.json()
      if (data.success) {
        setExam(data.exam)
      } else {
        setErrorMsg(data.error || 'Không tìm thấy thông tin kỳ thi')
      }
    } catch (e: any) {
      setErrorMsg('Không thể tải thông tin kỳ thi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setBlockedType(null)

    if (!fullName.trim() || !candidateCode.trim() || !unitName.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc (*)')
      return
    }

    if (!agreedTerms) {
      setErrorMsg('Bạn cần xác nhận đã đọc và cam kết tuân thủ thể lệ thi đua')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/exams/verify-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examSlug: params.slug,
          candidateCode: candidateCode.trim().toUpperCase(),
          fullName: fullName.trim(),
          participantType,
          unitName: unitName.trim(),
          agreedTerms
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Không thể xác nhận thông tin dự thi')
        setBlockedType(data.blockedType || null)
        setSubmitting(false)
        return
      }

      // Store verified session state in sessionStorage
      const sessionData = {
        examSlug: params.slug,
        candidateCode: candidateCode.trim().toUpperCase(),
        fullName: fullName.trim(),
        participantType,
        unitName: unitName.trim(),
        startedAt: new Date().toISOString()
      }
      sessionStorage.setItem(`exam_session_${params.slug}`, JSON.stringify(sessionData))

      // Redirect into the exam room
      router.push(`/exams/${params.slug}/room`)
    } catch (err: any) {
      setErrorMsg('Lỗi kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-sm text-slate-500 font-medium">Đang tải thông tin kỳ thi...</p>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-soft">
        <BadgeAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy kỳ thi</h2>
        <p className="text-sm text-slate-500 mt-2">{errorMsg || 'Kỳ thi không tồn tại hoặc đã bị hủy bỏ.'}</p>
        <Link href="/exams" className="mt-6 inline-block px-6 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm">
          Quay lại danh sách
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Exam Summary Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white rounded-3xl p-6 sm:p-8 shadow-card">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
          BƯỚC 1: XÁC MINH DANH TÍNH
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold mt-1">
          {exam.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm text-brand-100">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gold-400" />
            <span>Thời lượng: <strong>{exam.durationMinutes} phút</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-gold-400" />
            <span>Số câu: <strong>{exam._count?.questions || exam.totalQuestions} câu</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-gold-400" />
            <span>Thang điểm: <strong>{exam.maxScore} điểm</strong></span>
          </div>
        </div>
      </div>

      {/* Mandatory Notice Required by Prompt */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-5 shadow-soft">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-900">
              LƯU Ý QUAN TRỌNG TRƯỚC KHI BẮT ĐẦU:
            </p>
            <p className="text-sm text-amber-800 leading-relaxed font-medium">
              &ldquo;Mỗi thí sinh chỉ được nộp bài một lần cho mỗi kỳ thi. Vui lòng kiểm tra thông tin cẩn thận trước khi bắt đầu.&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Error / Blocked message */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-5 text-sm flex items-start gap-3 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Không thể tham gia kỳ thi</p>
            <p className="leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Verification Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-brand-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Họ và tên thí sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Candidate Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mã thí sinh / Mã CTV <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={candidateCode}
                onChange={(e) => setCandidateCode(e.target.value)}
                placeholder="Ví dụ: CTV2026-001 hoặc TV2026-101"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Sử dụng mã số do Ban Tổ chức cấp hoặc mã sinh viên/thành viên.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Participant Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nhóm đối tượng <span className="text-rose-500">*</span>
              </label>
              <select
                value={participantType}
                onChange={(e: any) => setParticipantType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="CTV">Cộng tác viên (CTV)</option>
                <option value="MEMBER">Thành viên chính thức CLB</option>
                <option value="EXECUTIVE">Ban Điều hành CLB</option>
              </select>
            </div>

            {/* Unit / Branch */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Chi đoàn / Ban bộ phận <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Ví dụ: Ban Truyền thông / Đội Tiếp sức"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Agree Terms Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-brand-50/70 border border-brand-200 hover:bg-brand-50 transition-colors">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-5 h-5 rounded text-brand-500 focus:ring-brand-500 border-slate-300 mt-0.5 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Tôi xác nhận thông tin trên là chính xác, đã đọc kỹ và cam kết tuân thủ đầy đủ{' '}
                <Link href="/rules" target="_blank" className="text-brand-600 font-semibold underline hover:text-brand-700">
                  Thể lệ kỳ thi
                </Link>
                . Tôi hiểu rằng mỗi người chỉ có <strong>duy nhất 01 lượt nộp bài</strong>.
              </span>
            </label>
          </div>

          {/* Submit action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-extrabold text-base transition-all shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang kiểm tra & Tạo phòng thi...</span>
              </>
            ) : (
              <>
                <span>XÁC NHẬN VÀ BẮT ĐẦU LÀM BÀI</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
