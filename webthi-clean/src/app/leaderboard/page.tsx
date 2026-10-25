'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Award,
  Crown,
  Medal,
  Clock,
  Filter,
  Users,
  Search,
  AlertCircle,
  EyeOff
} from 'lucide-react'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [selectedExam, setSelectedExam] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const [isPublic, setIsPublic] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Load exams list for dropdown filter
    fetch('/api/exams')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.exams?.length > 0) {
          setExams(data.exams)
          setSelectedExam(data.exams[0].slug)
        }
      })
      .catch((e) => console.error(e))
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [selectedExam, selectedGroup])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedExam) params.set('exam', selectedExam)
      if (selectedGroup !== 'ALL') params.set('group', selectedGroup)

      const res = await fetch(`/api/leaderboard?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setIsPublic(data.isPublic)
        setLeaderboard(data.leaderboard || [])
        setMessage(data.message || '')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}p ${s}s`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 rounded-3xl p-8 sm:p-10 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-gold-400 mb-2 border border-white/20">
            <Award className="w-4 h-4 fill-current" />
            <span>VINH DANH THÀNH TÍCH THANH NIÊN</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Bảng xếp hạng thi đua
          </h1>
          <p className="text-sm text-brand-100 mt-2 max-w-xl">
            Ghi nhận những nỗ lực học tập, rèn luyện kỹ năng và tinh thần xung kích của các tình nguyện viên Trống Đồng.
          </p>
        </div>

        {/* Podium Icon Badge */}
        <div className="hidden lg:flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="text-center px-3">
            <Crown className="w-8 h-8 text-gold-400 mx-auto" />
            <span className="text-xs font-bold text-white mt-1 block">TOP 1</span>
          </div>
          <div className="text-center px-3 border-l border-white/20">
            <Medal className="w-7 h-7 text-slate-200 mx-auto" />
            <span className="text-xs font-bold text-white mt-1 block">TOP 2</span>
          </div>
          <div className="text-center px-3 border-l border-white/20">
            <Medal className="w-7 h-7 text-amber-500 mx-auto" />
            <span className="text-xs font-bold text-white mt-1 block">TOP 3</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto flex-1 flex flex-col sm:flex-row gap-3">
          {/* Exam dropdown */}
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 max-w-md truncate"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.slug}>
                {ex.title}
              </option>
            ))}
          </select>

          {/* Group filter tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'CTV', label: 'CTV' },
              { id: 'MEMBER', label: 'Thành viên' },
              { id: 'EXECUTIVE', label: 'BĐH' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedGroup(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedGroup === tab.id
                    ? 'bg-white text-brand-700 shadow-xs'
                    : 'text-slate-600 hover:text-brand-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      {!isPublic ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-3">
          <EyeOff className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Bảng xếp hạng đang tạm ẩn</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            {message || 'Ban Tổ chức đang hoàn tất quá trình duyệt điểm và tổng kết.'}
          </p>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-500">Đang tải bảng vàng thành tích...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-3">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Chưa có kết quả dự thi</h3>
          <p className="text-sm text-slate-500">
            Kỳ thi này hiện chưa ghi nhận thí sinh hoàn thành bài làm. Hãy là người đầu tiên ghi tên lên bảng vàng!
          </p>
          <div className="pt-2">
            <Link
              href="/exams"
              className="inline-block px-6 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm"
            >
              Vào thi ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-soft border border-brand-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-50/70 border-b border-brand-100 text-xs font-bold uppercase tracking-wider text-brand-900">
                  <th className="py-4 px-6 text-center w-20">Hạng</th>
                  <th className="py-4 px-6">Họ và tên thí sinh</th>
                  <th className="py-4 px-6">Đối tượng</th>
                  <th className="py-4 px-6">Chi đoàn / Ban bộ phận</th>
                  <th className="py-4 px-6 text-center">Thời gian</th>
                  <th className="py-4 px-6 text-right">Tổng điểm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {leaderboard.map((item) => {
                  const isTop1 = item.rank === 1
                  const isTop2 = item.rank === 2
                  const isTop3 = item.rank === 3

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTop1 ? 'bg-gold-50/40' : isTop2 ? 'bg-slate-50/50' : isTop3 ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Rank badge */}
                      <td className="py-4 px-6 text-center">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold-400 text-brand-950 font-extrabold shadow-sm">
                            🥇 1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-extrabold shadow-sm">
                            🥈 2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-extrabold shadow-sm">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-bold text-slate-500">{item.rank}</span>
                        )}
                      </td>

                      {/* Display name */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{item.displayName}</span>
                          {isTop1 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-gold-100 text-gold-700 border border-gold-300">
                              QUÁN QUÂN
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{item.candidateCode}</span>
                      </td>

                      {/* Participant Type */}
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                          {item.participantType === 'CTV'
                            ? 'CTV'
                            : item.participantType === 'MEMBER'
                            ? 'Thành viên CLB'
                            : 'Ban Điều hành'}
                        </span>
                      </td>

                      {/* Unit Name */}
                      <td className="py-4 px-6 text-slate-600 text-xs sm:text-sm">
                        {item.unitName}
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-6 text-center text-xs text-slate-600 font-mono">
                        {formatDuration(item.durationSeconds)}
                      </td>

                      {/* Total Score */}
                      <td className="py-4 px-6 text-right">
                        <span className="font-extrabold text-base text-brand-700">
                          {item.finalScore}
                        </span>
                        <span className="text-xs text-slate-400">/{item.maxScore}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
