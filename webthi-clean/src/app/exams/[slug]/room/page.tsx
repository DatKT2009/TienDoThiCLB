'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Check,
  Loader2,
  ShieldAlert,
  Save
} from 'lucide-react'

interface Question {
  id: string
  content: string
  questionType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY' | 'SITUATION'
  options: string[]
  score: number
  difficulty: string
  category: string
  orderIndex: number
}

export default function ExamRoomPage({ params }: { params: { slug: string } }) {
  const router = useRouter()

  // Session & Candidate info
  const [candidate, setCandidate] = useState<any>(null)
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState('')

  // Exam Progress State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [flagged, setFlagged] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<string>('')

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Initialize session and load exam questions
  useEffect(() => {
    const rawSession = sessionStorage.getItem(`exam_session_${params.slug}`)
    if (!rawSession) {
      router.replace(`/exams/${params.slug}/verify`)
      return
    }

    const session = JSON.parse(rawSession)
    setCandidate(session)

    loadExamQuestions(session.candidateCode)
  }, [params.slug])

  const loadExamQuestions = async (candidateCode: string) => {
    try {
      const res = await fetch(`/api/exams/${params.slug}/take?candidateCode=${encodeURIComponent(candidateCode)}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setInitError(data.error || 'Không thể truy cập phòng thi')
        setLoading(false)
        return
      }

      setExam(data.exam)
      setQuestions(data.questions || [])

      // Setup countdown duration (seconds)
      const durationSec = (data.exam.durationMinutes || 30) * 60

      // Check if draft exists in localStorage
      const draftKey = `exam_draft_${params.slug}_${candidateCode}`
      const savedDraft = localStorage.getItem(draftKey)
      let initialTime = durationSec

      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft)
          if (parsedDraft.answers) setAnswers(parsedDraft.answers)
          if (parsedDraft.flagged) setFlagged(parsedDraft.flagged)
          if (parsedDraft.timeLeft && parsedDraft.timeLeft > 0) {
            initialTime = Math.min(durationSec, parsedDraft.timeLeft)
          }
          setLastSavedTime('Đã khôi phục bản nháp trước đó')
        } catch (e) {
          // ignore corrupted draft
        }
      }

      setTimeLeft(initialTime)
      setLoading(false)
    } catch (e: any) {
      setInitError('Lỗi kết nối máy chủ khi tải đề thi')
      setLoading(false)
    }
  }

  // 2. Countdown Timer
  useEffect(() => {
    if (loading || initError || timeLeft <= 0 || isSubmitting) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleAutoSubmitOnTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [loading, initError, isSubmitting])

  // 3. Periodic Auto-Save Draft to LocalStorage every 10s
  useEffect(() => {
    if (loading || !candidate) return

    autoSaveTimerRef.current = setInterval(() => {
      saveDraftToLocal()
    }, 10000)

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current)
    }
  }, [answers, flagged, timeLeft, candidate])

  const saveDraftToLocal = () => {
    if (!candidate) return
    const draftKey = `exam_draft_${params.slug}_${candidate.candidateCode}`
    const payload = {
      answers,
      flagged,
      timeLeft,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem(draftKey, JSON.stringify(payload))
    setLastSavedTime(new Date().toLocaleTimeString('vi-VN'))
  }

  const handleAutoSubmitOnTimeout = () => {
    alert('Đã hết thời gian làm bài! Hệ thống đang tự động nộp bài của bạn.')
    handleSubmitExam(true)
  }

  // Handle Answer Selection
  const handleAnswerChange = (qId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: value
    }))
  }

  const handleMultiChoiceToggle = (qId: string, option: string) => {
    const current: string[] = Array.isArray(answers[qId]) ? answers[qId] : []
    const updated = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]
    handleAnswerChange(qId, updated)
  }

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }))
  }

  // Final Submission Pipeline
  const handleSubmitExam = async (isForcedTimeout = false) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setShowConfirmModal(false)

    try {
      const rawSession = sessionStorage.getItem(`exam_session_${params.slug}`)
      const session = rawSession ? JSON.parse(rawSession) : candidate

      const totalDuration = (exam?.durationMinutes || 30) * 60
      const durationSeconds = Math.max(1, totalDuration - timeLeft)

      const res = await fetch(`/api/exams/${params.slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateCode: session.candidateCode,
          fullName: session.fullName,
          participantType: session.participantType,
          unitName: session.unitName,
          answers,
          durationSeconds,
          startedAt: session.startedAt
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        alert(data.error || 'Nộp bài thất bại. Vui lòng liên hệ giám thị!')
        setIsSubmitting(false)
        return
      }

      // Clear local draft and session
      localStorage.removeItem(`exam_draft_${params.slug}_${session.candidateCode}`)
      sessionStorage.removeItem(`exam_session_${params.slug}`)

      // Redirect to Result page with lookupCode
      router.push(`/results/${data.submission.lookupCode}`)
    } catch (err: any) {
      alert('Lỗi kết nối khi nộp bài. Vui lòng thử lại!')
      setIsSubmitting(false)
    }
  }

  // Format Time Left (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        <p className="text-sm font-semibold text-slate-600">Đang khởi tạo đề thi bảo mật...</p>
      </div>
    )
  }

  if (initError) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 shadow-soft text-center space-y-4">
        <ShieldAlert className="w-14 h-14 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Không thể vào phòng thi</h2>
        <p className="text-sm text-slate-600 leading-relaxed">{initError}</p>
        <div className="pt-2">
          <Link
            href="/exams"
            className="inline-block px-6 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm"
          >
            Quay lại danh sách kỳ thi
          </Link>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIndex]
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id]
    if (Array.isArray(a)) return a.length > 0
    return typeof a === 'string' && a.trim().length > 0
  }).length

  const progressPercent = Math.round((answeredCount / (questions.length || 1)) * 100)
  const isTimeCritical = timeLeft <= 300 // <= 5 minutes

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      {/* 1. TOP STICKY TEST HEADER */}
      <div className="sticky top-0 z-40 bg-white border-b border-brand-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Exam & Candidate Name */}
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-brand-900 truncate">
                {exam?.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-brand-700">{candidate?.fullName}</span>
                <span>•</span>
                <span className="bg-brand-50 px-2 py-0.5 rounded text-[11px] font-mono text-brand-800 border border-brand-200">
                  {candidate?.candidateCode}
                </span>
                <span className="hidden sm:inline-block">({candidate?.unitName})</span>
              </div>
            </div>

            {/* Countdown Timer & Submit CTA */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <div
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border font-mono font-bold text-sm sm:text-base ${
                  isTimeCritical
                    ? 'bg-rose-50 border-rose-300 text-rose-600 timer-warning'
                    : 'bg-brand-50 border-brand-200 text-brand-900'
                }`}
              >
                <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${isTimeCritical ? 'text-rose-600 animate-spin' : 'text-brand-500'}`} />
                <span>{formatTime(timeLeft)}</span>
              </div>

              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-brand-950 font-bold text-xs sm:text-sm shadow-md shadow-gold-500/20 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>NỘP BÀI</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
            <div
              className="bg-brand-500 h-1.5 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. MAIN EXAM INTERFACE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: QUESTION WORK AREA (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-200">
              {/* Question header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl bg-brand-500 text-white font-extrabold text-sm">
                    Câu {currentIndex + 1} / {questions.length}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {currentQ.questionType === 'SINGLE_CHOICE'
                      ? 'Trắc nghiệm 1 đáp án'
                      : currentQ.questionType === 'MULTIPLE_CHOICE'
                      ? 'Trắc nghiệm nhiều đáp án'
                      : currentQ.questionType === 'TRUE_FALSE'
                      ? 'Đúng / Sai'
                      : currentQ.questionType === 'SHORT_ANSWER'
                      ? 'Trả lời ngắn'
                      : currentQ.questionType === 'ESSAY'
                      ? 'Tự luận'
                      : 'Tình huống thực tế'}
                  </span>
                  <span className="text-xs text-gold-600 font-bold">({currentQ.score} điểm)</span>
                </div>

                <button
                  onClick={() => toggleFlag(currentQ.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    flagged[currentQ.id]
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{flagged[currentQ.id] ? 'Đã đánh dấu xem lại' : 'Xem lại sau'}</span>
                </button>
              </div>

              {/* Question Content */}
              <div className="py-6">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                  {currentQ.content}
                </h3>
              </div>

              {/* Answer Input Area by Question Type */}
              <div className="space-y-3 pt-2">
                {/* 1. Single Choice & True/False */}
                {(currentQ.questionType === 'SINGLE_CHOICE' || currentQ.questionType === 'TRUE_FALSE') && (
                  <div className="space-y-2.5">
                    {currentQ.options.map((option, idx) => {
                      const isSelected = answers[currentQ.id] === option
                      return (
                        <label
                          key={idx}
                          onClick={() => handleAnswerChange(currentQ.id, option)}
                          className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-50/80 border-brand-500 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                          </div>
                          <span className={`text-sm leading-relaxed ${isSelected ? 'font-bold text-brand-900' : 'text-slate-700'}`}>
                            {option}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {/* 2. Multiple Choice */}
                {currentQ.questionType === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-brand-700 font-semibold bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200 mb-2">
                      💡 Bạn có thể chọn một hoặc nhiều phương án đúng.
                    </p>
                    {currentQ.options.map((option, idx) => {
                      const currentSelected: string[] = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : []
                      const isSelected = currentSelected.includes(option)
                      return (
                        <label
                          key={idx}
                          onClick={() => handleMultiChoiceToggle(currentQ.id, option)}
                          className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-50/80 border-brand-500 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className={`text-sm leading-relaxed ${isSelected ? 'font-bold text-brand-900' : 'text-slate-700'}`}>
                            {option}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {/* 3. Short Answer */}
                {currentQ.questionType === 'SHORT_ANSWER' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      placeholder="Nhập câu trả lời ngắn của bạn..."
                      className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <p className="text-xs text-slate-500">
                      Gợi ý: Điền từ/cụm từ chính xác không phân biệt chữ hoa, chữ thường.
                    </p>
                  </div>
                )}

                {/* 4. Essay & Situation */}
                {(currentQ.questionType === 'ESSAY' || currentQ.questionType === 'SITUATION') && (
                  <div className="space-y-2">
                    <textarea
                      rows={7}
                      value={answers[currentQ.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                      placeholder="Trình bày bài làm chi tiết của bạn tại đây... (Nêu rõ luận điểm, thái độ chuẩn mực của tình nguyện viên và giải pháp thực tế)"
                      className="w-full p-4 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed resize-y"
                    ></textarea>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Số từ: {(answers[currentQ.id] || '').trim().split(/\s+/).filter(Boolean).length} từ</span>
                      <span className="text-brand-600 font-medium">Được chấm điểm bởi AI & Rubric chuyên môn</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                <div className="text-xs text-slate-500 hidden sm:block">
                  {lastSavedTime && (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <Save className="w-3.5 h-3.5" />
                      <span>Đã lưu tự động lúc {lastSavedTime}</span>
                    </span>
                  )}
                </div>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-bold shadow-sm"
                  >
                    <span>Câu tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-brand-950 text-xs sm:text-sm font-bold shadow-md shadow-gold-500/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>HOÀN THÀNH BÀI THI</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: QUESTION PALETTE & TEST INFO (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-200 space-y-5">
              <div>
                <h4 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-1">
                  Mục lục câu hỏi
                </h4>
                <p className="text-xs text-slate-500">
                  Đã làm {answeredCount} / {questions.length} câu ({progressPercent}%)
                </p>
              </div>

              {/* Question buttons grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {questions.map((q, idx) => {
                  const hasAnswer =
                    (Array.isArray(answers[q.id]) && answers[q.id].length > 0) ||
                    (typeof answers[q.id] === 'string' && answers[q.id].trim().length > 0)
                  const isCurrent = idx === currentIndex
                  const isFlagged = flagged[q.id]

                  let btnStyle = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  if (hasAnswer) {
                    btnStyle = 'bg-brand-500 text-white font-bold border-brand-500 shadow-xs'
                  }
                  if (isCurrent) {
                    btnStyle += ' ring-2 ring-offset-2 ring-brand-700'
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative h-10 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${btnStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white"></span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-brand-500 flex-shrink-0"></div>
                  <span>Đã trả lời ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 flex-shrink-0"></div>
                  <span>Chưa trả lời ({questions.length - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-amber-500 flex-shrink-0"></div>
                  <span>Đánh dấu cần xem lại</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gold-500 hover:bg-gold-600 text-brand-950 font-extrabold text-sm shadow-md shadow-gold-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>NỘP BÀI THI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONFIRMATION POPUP MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gold-100 text-gold-600 flex items-center justify-center mx-auto mb-3">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Xác nhận nộp bài thi?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sau khi nộp, bạn sẽ <strong>không thể thay đổi</strong> câu trả lời hoặc làm lại kỳ thi này.
              </p>
            </div>

            {/* Quick stats in modal */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Số câu đã hoàn thành:</span>
                <span className="font-bold text-emerald-600">{answeredCount} / {questions.length} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Số câu chưa trả lời:</span>
                <span className="font-bold text-rose-600">{questions.length - answeredCount} câu</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Thời gian còn lại:</span>
                <span className="font-bold text-brand-700">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={() => handleSubmitExam(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang nộp...</span>
                  </>
                ) : (
                  <span>Xác nhận Nộp</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
