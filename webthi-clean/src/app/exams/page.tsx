'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Clock,
  HelpCircle,
  Award,
  Users,
  Search,
  Calendar,
  Filter,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [audienceFilter, setAudienceFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const urlAudience = urlParams.get('audience')
      const storedAudience = localStorage.getItem('trongdong_audience')
      if (urlAudience) {
        setAudienceFilter(urlAudience)
      } else if (storedAudience) {
        setAudienceFilter(storedAudience)
      }

      const handleAudienceChange = (e: any) => {
        if (e.detail) setAudienceFilter(e.detail)
      }
      window.addEventListener('audience-changed', handleAudienceChange)
      return () => window.removeEventListener('audience-changed', handleAudienceChange)
    }
  }, [])

  useEffect(() => {
    fetchExams()
  }, [statusFilter, audienceFilter])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (audienceFilter !== 'ALL') params.set('audience', audienceFilter)
      if (searchQuery) params.set('q', searchQuery)

      const res = await fetch(`/api/exams?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setExams(data.exams || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchExams()
  }

  const getStatusBadge = (status: string, startTime: string, endTime: string) => {
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (status === 'PAUSED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
          Tạm dừng
        </span>
      )
    }

    if (now < start || status === 'DRAFT') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
          Sắp diễn ra
        </span>
      )
    }

    if (now > end || status === 'ENDED') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
          Đã kết thúc
        </span>
      )
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
        Đang diễn ra
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 rounded-3xl p-8 sm:p-10 text-white shadow-card">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
          DANH MỤC THI ĐUA
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold mt-1">
          Danh sách các kỳ thi trực tuyến
        </h1>
        <p className="text-sm sm:text-base text-brand-100 mt-2 max-w-2xl">
          Lựa chọn kỳ thi phù hợp với đối tượng và thời gian biểu. Mỗi thí sinh chỉ được nộp bài một lần cho mỗi kỳ thi.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-100 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm kỳ thi theo tên hoặc chủ đề..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>Tìm kiếm & Lọc</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500">Trạng thái:</span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'ACTIVE', label: 'Đang diễn ra' },
            { id: 'DRAFT', label: 'Sắp diễn ra' },
            { id: 'ENDED', label: 'Đã kết thúc' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <span className="font-semibold text-slate-500 ml-auto md:ml-4">Phân luồng:</span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'INTERVIEW', label: '🎯 Đang Phỏng Vấn' },
            { id: 'MEMBER', label: '🎖️ Đã Vào CLB' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAudienceFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                audienceFilter === tab.id
                  ? tab.id === 'INTERVIEW'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : tab.id === 'MEMBER'
                    ? 'bg-brand-700 text-white shadow-sm shadow-brand-700/30'
                    : 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-5 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">Không tìm thấy kỳ thi phù hợp</h3>
          <p className="text-sm text-slate-500 mt-1">
            Vui lòng thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const isEnded = exam.status === 'ENDED' || new Date(exam.endTime) < new Date()
            const isFuture = new Date(exam.startTime) > new Date()
            const canTake = exam.status === 'ACTIVE' && !isEnded && !isFuture

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-brand-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {getStatusBadge(exam.status, exam.startTime, exam.endTime)}
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                      {exam.targetAudience === 'ALL'
                        ? 'Tất cả đối tượng'
                        : exam.targetAudience === 'CTV'
                        ? 'Cộng tác viên'
                        : exam.targetAudience === 'MEMBER'
                        ? 'Thành viên CLB'
                        : 'Ban Điều hành'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-brand-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-5 leading-relaxed">
                    {exam.description}
                  </p>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="w-4 h-4 text-brand-500" />
                        Thời lượng:
                      </span>
                      <span className="font-semibold text-slate-800">{exam.durationMinutes} phút</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <HelpCircle className="w-4 h-4 text-brand-500" />
                        Số câu hỏi:
                      </span>
                      <span className="font-semibold text-slate-800">{exam._count?.questions || exam.totalQuestions} câu</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Award className="w-4 h-4 text-gold-500" />
                        Tổng điểm:
                      </span>
                      <span className="font-semibold text-slate-800">{exam.maxScore} điểm</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="w-4 h-4 text-brand-500" />
                        Hạn chót:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {new Date(exam.endTime).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-brand-50/70 border-t border-brand-100">
                  {canTake ? (
                    <Link
                      href={`/exams/${exam.slug}/verify`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-sm shadow-brand-500/20"
                    >
                      <span>VÀO THI</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-500 font-semibold text-sm cursor-not-allowed text-center"
                    >
                      {isEnded ? 'Đã kết thúc' : isFuture ? 'Chưa mở đề' : 'Tạm dừng'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
