'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BronzeDrumLogo from '@/components/BronzeDrumLogo'
import {
  LayoutDashboard,
  Calendar,
  HelpCircle,
  Users,
  Award,
  ShieldAlert,
  Settings,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Cpu,
  Trash2,
  Edit,
  Eye,
  Check,
  AlertTriangle,
  Lock,
  Unlock,
  UploadCloud,
  FileText
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<any>(null)
  const [currentTab, setCurrentTab] = useState<'overview' | 'exams' | 'questions' | 'candidates' | 'submissions' | 'locks' | 'settings'>('overview')

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)

  // Exams Data
  const [exams, setExams] = useState<any[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [showExamModal, setShowExamModal] = useState(false)
  const [editingExam, setEditingExam] = useState<any>(null)

  // Questions Data
  const [questions, setQuestions] = useState<any[]>([])
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<any>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importJsonText, setImportJsonText] = useState('')

  // Candidates Data
  const [candidates, setCandidates] = useState<any[]>([])
  const [candidateSearch, setCandidateSearch] = useState('')

  // Submissions Data
  const [submissions, setSubmissions] = useState<any[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewOverrideScore, setReviewOverrideScore] = useState<number>(0)
  const [reviewNotes, setReviewNotes] = useState('')

  // Locks Data
  const [locks, setLocks] = useState<any[]>([])
  const [unlockModal, setUnlockModal] = useState<{ open: boolean; lockId: string }>({ open: false, lockId: '' })
  const [unlockReason, setUnlockReason] = useState('')

  // Settings Data
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [savingSettings, setSavingSettings] = useState(false)
  const [syncingSheets, setSyncingSheets] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  // Auth Guard
  useEffect(() => {
    const rawUser = localStorage.getItem('admin_user')
    const token = localStorage.getItem('admin_token')
    if (!rawUser || !token) {
      router.replace('/admin/login')
      return
    }
    setAdminUser(JSON.parse(rawUser))
    loadDashboard()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
    document.cookie = 'admin_token=; path=/; max-age=0'
    router.push('/admin/login')
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token') || ''
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  // --- API LOADERS ---
  const loadDashboard = async () => {
    setLoadingDashboard(true)
    try {
      const res = await fetch('/api/admin/dashboard', { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) {
        setDashboardData(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingDashboard(false)
    }
  }

  const loadExams = async () => {
    try {
      const res = await fetch('/api/admin/exams', { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) {
        setExams(data.exams || [])
        if (!selectedExamId && data.exams?.length > 0) {
          setSelectedExamId(data.exams[0].id)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadQuestions = async (examId?: string) => {
    const target = examId || selectedExamId
    if (!target) return
    try {
      const res = await fetch(`/api/admin/questions?examId=${target}`, { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) {
        setQuestions(data.questions || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadCandidates = async () => {
    try {
      const res = await fetch(`/api/admin/candidates?q=${encodeURIComponent(candidateSearch)}`, { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) {
        setCandidates(data.candidates || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/submissions', { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) {
        setSubmissions(data.submissions || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadLocks = async () => {
    try {
      const res = await fetch('/api/admin/locks', { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) {
        setLocks(data.locks || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.success) {
        setSettings(data.settings || {})
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Handle Tab Switch
  useEffect(() => {
    if (currentTab === 'overview') loadDashboard()
    if (currentTab === 'exams') loadExams()
    if (currentTab === 'questions') {
      loadExams()
      loadQuestions()
    }
    if (currentTab === 'candidates') loadCandidates()
    if (currentTab === 'submissions') loadSubmissions()
    if (currentTab === 'locks') loadLocks()
    if (currentTab === 'settings') loadSettings()
  }, [currentTab])

  // --- ACTIONS ---
  const handleSaveExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      targetAudience: formData.get('targetAudience'),
      durationMinutes: Number(formData.get('durationMinutes')),
      maxScore: Number(formData.get('maxScore')),
      passingScore: Number(formData.get('passingScore')),
      status: formData.get('status'),
      oneAttemptPolicy: formData.get('oneAttemptPolicy'),
      allowReview: formData.get('allowReview') === 'on',
      isLeaderboardPublic: formData.get('isLeaderboardPublic') === 'on'
    }

    const url = editingExam ? `/api/admin/exams/${editingExam.id}` : '/api/admin/exams'
    const method = editingExam ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.success) {
      setShowExamModal(false)
      setEditingExam(null)
      loadExams()
    } else {
      alert(data.error || 'Lỗi lưu kỳ thi')
    }
  }

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kỳ thi này cùng toàn bộ câu hỏi và bài thi liên quan?')) return
    const res = await fetch(`/api/admin/exams/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (res.ok) loadExams()
  }

  const handleSaveQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const questionType = formData.get('questionType') as string
    const rawOptions = formData.get('options') as string
    const options = rawOptions ? rawOptions.split('\n').map((s) => s.trim()).filter(Boolean) : []

    const payload: any = {
      examId: selectedExamId,
      content: formData.get('content'),
      questionType,
      optionsJson: options.length > 0 ? options : null,
      correctAnswer: formData.get('correctAnswer'),
      explanation: formData.get('explanation'),
      score: Number(formData.get('score')),
      difficulty: formData.get('difficulty'),
      category: formData.get('category')
    }

    const rubricText = formData.get('rubricJson') as string
    if (rubricText) {
      try {
        payload.rubricJson = JSON.parse(rubricText)
      } catch {
        payload.rubricJson = rubricText
      }
    }

    const url = editingQuestion ? `/api/admin/questions/${editingQuestion.id}` : '/api/admin/questions'
    const method = editingQuestion ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (data.success) {
      setShowQuestionModal(false)
      setEditingQuestion(null)
      loadQuestions(selectedExamId)
    } else {
      alert(data.error || 'Lỗi lưu câu hỏi')
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return
    await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    loadQuestions(selectedExamId)
  }

  const handleImportQuestions = async () => {
    if (!importJsonText.trim()) return
    try {
      const parsed = JSON.parse(importJsonText)
      const res = await fetch('/api/admin/questions/import', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ examId: selectedExamId, questions: parsed })
      })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        setShowImportModal(false)
        setImportJsonText('')
        loadQuestions(selectedExamId)
      } else {
        alert(data.error || 'Lỗi nhập câu hỏi')
      }
    } catch (e: any) {
      alert('Định dạng JSON không hợp lệ: ' + e.message)
    }
  }

  const handleToggleCandidateEligibility = async (id: string, current: boolean) => {
    await fetch('/api/admin/candidates', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, isEligible: !current, notes: 'Thay đổi bởi Admin' })
    })
    loadCandidates()
  }

  const handleUnlockLock = async () => {
    if (!unlockReason.trim()) {
      alert('Vui lòng nhập lý do mở khóa ngoại lệ')
      return
    }
    const res = await fetch('/api/admin/locks/unlock', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ lockId: unlockModal.lockId, reason: unlockReason })
    })
    const data = await res.json()
    if (data.success) {
      alert('Mở khóa ngoại lệ thành công!')
      setUnlockModal({ open: false, lockId: '' })
      setUnlockReason('')
      loadLocks()
    } else {
      alert(data.error || 'Lỗi mở khóa')
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ settings })
      })
      const data = await res.json()
      if (data.success) {
        alert('Đã lưu cấu hình thành công!')
      }
    } catch (e) {
      alert('Lỗi lưu cấu hình')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSyncSheetsNow = async () => {
    setSyncingSheets(true)
    setSyncMsg('')
    try {
      const res = await fetch('/api/admin/sheets/sync-now', {
        method: 'POST',
        headers: getAuthHeaders()
      })
      const data = await res.json()
      if (data.success) {
        setSyncMsg(`Đã kích hoạt đồng bộ thành công: ${data.message}`)
      } else {
        setSyncMsg(`Lỗi đồng bộ: ${data.error}`)
      }
    } catch (e: any) {
      setSyncMsg(`Lỗi kết nối: ${e.message}`)
    } finally {
      setSyncingSheets(false)
    }
  }

  const handleOpenReviewModal = async (subId: string) => {
    const res = await fetch(`/api/admin/submissions/${subId}`, { headers: getAuthHeaders() })
    const data = await res.json()
    if (data.success) {
      setSelectedSubmission(data.submission)
      setReviewOverrideScore(data.submission.finalScore)
      setReviewNotes('')
      setShowReviewModal(true)
    }
  }

  const handleSaveReview = async () => {
    if (!selectedSubmission) return
    const res = await fetch(`/api/admin/submissions/${selectedSubmission.id}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        manualScore: reviewOverrideScore,
        notes: reviewNotes || 'Admin đã duyệt và xác nhận điểm'
      })
    })
    const data = await res.json()
    if (data.success) {
      alert('Duyệt điểm thành công!')
      setShowReviewModal(false)
      loadSubmissions()
    }
  }

  const COLORS = ['#087DBB', '#0284C7', '#F59E0B', '#10B981', '#8B5CF6']

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-brand-900 text-white border-b border-brand-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BronzeDrumLogo size={36} variant="light" />
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  QUẢN TRỊ TRỐNG ĐỒNG
                </span>
                <span className="text-[10px] text-brand-200">
                  Hệ thống Thi đua Trực tuyến CLB Trống Đồng
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block text-xs">
                <p className="font-bold text-white">{adminUser?.fullName || 'Quản trị viên'}</p>
                <p className="text-brand-300">@{adminUser?.username} ({adminUser?.role})</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-brand-950/60 border-t border-brand-800/60 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1 text-xs">
            {[
              { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
              { id: 'exams', label: 'Quản lý kỳ thi', icon: Calendar },
              { id: 'questions', label: 'Ngân hàng câu hỏi', icon: HelpCircle },
              { id: 'candidates', label: 'Quản lý thí sinh', icon: Users },
              { id: 'submissions', label: 'Kết quả & Chấm điểm', icon: Award },
              { id: 'locks', label: 'Khóa chống gian lận', icon: ShieldAlert },
              { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              const active = currentTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-brand-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================= TAB 1: OVERVIEW ================= */}
        {currentTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển quản trị</h1>
                <p className="text-xs text-slate-500 mt-0.5">Dữ liệu tổng hợp thời gian thực từ cơ sở dữ liệu CLB</p>
              </div>
              <button
                onClick={loadDashboard}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDashboard ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
                <p className="text-xs font-semibold text-slate-500">Tổng kỳ thi</p>
                <h3 className="text-2xl font-extrabold text-brand-900 mt-1">{dashboardData?.stats?.totalExams || 0}</h3>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
                <p className="text-xs font-semibold text-slate-500">Thí sinh hợp lệ</p>
                <h3 className="text-2xl font-extrabold text-brand-900 mt-1">{dashboardData?.stats?.totalCandidates || 0}</h3>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
                <p className="text-xs font-semibold text-slate-500">Bài đã nộp</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{dashboardData?.stats?.totalSubmissions || 0}</h3>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
                <p className="text-xs font-semibold text-slate-500">Chờ duyệt AI</p>
                <h3 className="text-2xl font-extrabold text-amber-500 mt-1">{dashboardData?.stats?.pendingAiCount || 0}</h3>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
                <p className="text-xs font-semibold text-slate-500">Điểm trung bình</p>
                <h3 className="text-2xl font-extrabold text-brand-600 mt-1">{dashboardData?.stats?.avgScore || 0}đ</h3>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft">
                <p className="text-xs font-semibold text-slate-500">Khóa IP/Mã</p>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{dashboardData?.stats?.activeLocksCount || 0}</h3>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Score Distribution Bar Chart */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-soft">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Phổ điểm các bài thi đã nộp</h3>
                <div className="h-64">
                  {dashboardData?.charts?.scoreDistribution ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.charts.scoreDistribution}>
                        <XAxis dataKey="range" fontSize={11} />
                        <YAxis allowDecimals={false} fontSize={11} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#087DBB" radius={[6, 6, 0, 0]} name="Số lượng bài thi" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">Chưa có dữ liệu biểu đồ</div>
                  )}
                </div>
              </div>

              {/* Participant Breakdown Pie Chart */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-soft">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Cơ cấu thí sinh tham gia</h3>
                <div className="h-64 flex flex-col justify-center">
                  {dashboardData?.charts?.participantBreakdown ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.charts.participantBreakdown}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label
                        >
                          {dashboardData.charts.participantBreakdown.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">Chưa có dữ liệu</div>
                  )}
                </div>
              </div>
            </div>

            {/* Latest Submissions List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Bài dự thi mới nhất</h3>
                <button
                  onClick={() => setCurrentTab('submissions')}
                  className="text-xs font-semibold text-brand-600 hover:underline"
                >
                  Xem tất cả ({dashboardData?.stats?.totalSubmissions || 0})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Kỳ thi</th>
                      <th className="py-3 px-4">Thí sinh</th>
                      <th className="py-3 px-4">Đối tượng</th>
                      <th className="py-3 px-4">Điểm</th>
                      <th className="py-3 px-4">Trạng thái chấm</th>
                      <th className="py-3 px-4">Đồng bộ Sheets</th>
                      <th className="py-3 px-4">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboardData?.recentSubmissions?.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate">{s.examTitle}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{s.fullName}</p>
                          <p className="text-[11px] font-mono text-slate-400">{s.candidateCode}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {s.participantType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-brand-700">{s.finalScore}/{s.maxScore}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.reviewStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.reviewStatus === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt AI'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.syncStatus === 'SYNCED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {s.syncStatus === 'SYNCED' ? 'Đã đồng bộ' : 'Chờ đồng bộ'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(s.submittedAt).toLocaleTimeString('vi-VN')} {new Date(s.submittedAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: EXAMS MANAGEMENT ================= */}
        {currentTab === 'exams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Quản lý kỳ thi</h2>
                <p className="text-xs text-slate-500">Tạo, cập nhật, điều chỉnh quy chế một lần thi và xem trước</p>
              </div>
              <button
                onClick={() => {
                  setEditingExam(null)
                  setShowExamModal(true)
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>TẠO KỲ THI MỚI</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((ex) => (
                <div key={ex.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        ex.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ex.status}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {ex.durationMinutes} phút • {ex._count?.questions || 0} câu
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base line-clamp-2 mb-2">{ex.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4">{ex.description}</p>

                    <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1 text-slate-600 mb-4">
                      <div>Khóa 1 lần: <strong>{ex.oneAttemptPolicy}</strong></div>
                      <div>Thang điểm: <strong>{ex.maxScore} điểm</strong> (Đạt: {ex.passingScore}đ)</div>
                      <div>Lượt nộp: <strong>{ex._count?.submissions || 0} bài</strong></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/exams/${ex.slug}/verify`}
                      target="_blank"
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                      title="Xem trước giao diện thí sinh"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem trước</span>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingExam(ex)
                          setShowExamModal(true)
                        }}
                        className="p-2 rounded-lg text-brand-600 hover:bg-brand-50"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(ex.id)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50"
                        title="Xóa kỳ thi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: QUESTIONS MANAGEMENT ================= */}
        {currentTab === 'questions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Ngân hàng câu hỏi</h2>
                <p className="text-xs text-slate-500">Quản lý trắc nghiệm, câu hỏi ngắn, tự luận & rubric tình huống</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedExamId}
                  onChange={(e) => {
                    setSelectedExamId(e.target.value)
                    loadQuestions(e.target.value)
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white max-w-xs"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.title}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Nhập JSON/CSV</span>
                </button>

                <button
                  onClick={() => {
                    setEditingQuestion(null)
                    setShowQuestionModal(true)
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>THÊM CÂU HỎI</span>
                </button>
              </div>
            </div>

            {/* Questions Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4">Nội dung câu hỏi</th>
                    <th className="py-3 px-4">Loại</th>
                    <th className="py-3 px-4">Điểm</th>
                    <th className="py-3 px-4">Đáp án / Rubric</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {questions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-md">{q.content}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700">
                          {q.questionType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gold-600">{q.score}đ</td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {q.correctAnswer || (q.rubricJson ? 'Rubric AI' : '—')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingQuestion(q)
                              setShowQuestionModal(true)
                            }}
                            className="p-1.5 text-brand-600 hover:bg-brand-50 rounded"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: CANDIDATES MANAGEMENT ================= */}
        {currentTab === 'candidates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Danh sách thí sinh & CTV</h2>
                <p className="text-xs text-slate-500">Tra cứu, quản lý quyền dự thi của từng đoàn viên, CTV</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={candidateSearch}
                    onChange={(e) => setCandidateSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadCandidates()}
                    placeholder="Tìm theo họ tên, mã..."
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button
                  onClick={loadCandidates}
                  className="px-3 py-2 bg-brand-500 text-white rounded-xl text-xs font-semibold"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Mã thí sinh</th>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Đối tượng</th>
                    <th className="py-3 px-4">Chi đoàn / Ban bộ phận</th>
                    <th className="py-3 px-4">Quyền dự thi</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-brand-700">{c.candidateCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.fullName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {c.participantType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{c.unitName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {c.isEligible ? 'Hợp lệ' : 'Đang bị khóa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleCandidateEligibility(c.id, c.isEligible)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                            c.isEligible ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          {c.isEligible ? 'Khóa quyền' : 'Mở quyền'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SUBMISSIONS & REVIEW ================= */}
        {currentTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Quản lý kết quả & Duyệt bài AI</h2>
                <p className="text-xs text-slate-500">Xem chi tiết bài làm, duyệt điểm tự luận AI và điều chỉnh có nhật ký</p>
              </div>
              <button
                onClick={loadSubmissions}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm mới</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Mã kết quả</th>
                    <th className="py-3 px-4">Thí sinh</th>
                    <th className="py-3 px-4">Kỳ thi</th>
                    <th className="py-3 px-4">Điểm TN / AI</th>
                    <th className="py-3 px-4">Tổng điểm</th>
                    <th className="py-3 px-4">Trạng thái duyệt</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-brand-600">{s.lookupCode}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{s.fullName}</p>
                        <p className="text-[11px] font-mono text-slate-400">{s.candidateCode}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{s.exam?.title}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {s.objectiveScore}đ / {s.aiScore}đ
                      </td>
                      <td className="py-3 px-4 font-bold text-brand-700 text-sm">
                        {s.finalScore}/{s.maxScore}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.reviewStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.reviewStatus === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt AI'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenReviewModal(s.id)}
                          className="px-3 py-1 rounded-lg bg-brand-50 text-brand-700 font-bold hover:bg-brand-100"
                        >
                          Xem & Duyệt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 6: ANTI-CHEAT LOCKS ================= */}
        {currentTab === 'locks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Quản lý khóa chống gian lận (Anti-cheat)</h2>
                <p className="text-xs text-slate-500">Giám sát các phiên khóa 1 lần (Mã thí sinh & IP Fingerprint). Xử lý ngoại lệ có nhật ký.</p>
              </div>
              <button onClick={loadLocks} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold">
                Làm mới
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Loại khóa</th>
                    <th className="py-3 px-4">Kỳ thi</th>
                    <th className="py-3 px-4">Định danh (Mã / IP Hash)</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Thời điểm</th>
                    <th className="py-3 px-4 text-right">Xử lý ngoại lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locks.map((lk) => (
                    <tr key={lk.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {lk.lockType === 'CANDIDATE' ? '👤 Mã Thí Sinh' : '🌐 Dấu vân tay IP'}
                      </td>
                      <td className="py-3 px-4 text-slate-800">{lk.exam?.title}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {lk.candidateCode || lk.ipFingerprint?.substring(0, 16) + '...'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lk.status === 'ACTIVE' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {lk.status === 'ACTIVE' ? 'Đang Khóa' : `Đã giải phóng (${lk.releasedBy})`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(lk.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {lk.status === 'ACTIVE' ? (
                          <button
                            onClick={() => setUnlockModal({ open: true, lockId: lk.id })}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold"
                          >
                            Mở khóa
                          </button>
                        ) : (
                          <span className="text-slate-400">Đã mở: {lk.releaseReason}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 7: SETTINGS & GOOGLE SHEETS ================= */}
        {currentTab === 'settings' && (
          <div className="space-y-8 max-w-4xl">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Cài đặt hệ thống & Tích hợp</h2>
              <p className="text-xs text-slate-500">Cấu hình kết nối Google Sheets, Gemini AI API và chính sách lưu trữ</p>
            </div>

            {/* Google Sheets Sync Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Tích hợp Google Sheets tự động</h3>
                    <p className="text-xs text-slate-500">Tự động đồng bộ 4 Sheet: KET_QUA_THI, CHI_TIET_CAU_TRA_LOI, DANH_SACH_THI_SINH, THONG_KE</p>
                  </div>
                </div>

                <button
                  onClick={handleSyncSheetsNow}
                  disabled={syncingSheets}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingSheets ? 'animate-spin' : ''}`} />
                  <span>{syncingSheets ? 'Đang đồng bộ...' : 'ĐỒNG BỘ NGAY'}</span>
                </button>
              </div>

              {syncMsg && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  {syncMsg}
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Google Spreadsheet ID (Mã trang tính)
                  </label>
                  <input
                    type="text"
                    value={settings.GOOGLE_SHEET_ID || ''}
                    onChange={(e) => setSettings({ ...settings, GOOGLE_SHEET_ID: e.target.value })}
                    placeholder="Ví dụ: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Lấy từ thanh địa chỉ URL của Google Sheet trên Google Drive.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Google Apps Script Webhook URL (Phương án kết nối nhanh không cần Cloud Console)
                  </label>
                  <input
                    type="text"
                    value={settings.GOOGLE_APPS_SCRIPT_WEBHOOK_URL || ''}
                    onChange={(e) => setSettings({ ...settings, GOOGLE_APPS_SCRIPT_WEBHOOK_URL: e.target.value })}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Cấu hình Gemini AI chấm tự luận</h4>
                      <p className="text-[11px] text-slate-500">Mô hình AI: gemini-1.5-flash (Google AI Studio)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Gemini API Key (Bảo mật ở backend)
                  </label>
                  <input
                    type="password"
                    value={settings.GEMINI_API_KEY || ''}
                    onChange={(e) => setSettings({ ...settings, GEMINI_API_KEY: e.target.value })}
                    placeholder="Nhập khóa AIzaSy..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-brand-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Nếu chưa nhập key, hệ thống tự động kích hoạt bộ máy chấm theo khung Rubric chuẩn và đánh dấu &ldquo;Chờ BĐH duyệt&rdquo;.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    {savingSettings ? 'Đang lưu...' : 'LƯU THAY ĐỔI CẤU HÌNH'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: EXAM CREATE / EDIT ================= */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingExam ? 'Chỉnh sửa kỳ thi' : 'Tạo kỳ thi mới'}
            </h3>

            <form onSubmit={handleSaveExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Tiêu đề kỳ thi *</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingExam?.title || ''}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Mô tả kỳ thi *</label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  defaultValue={editingExam?.description || ''}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Đối tượng dự thi</label>
                  <select name="targetAudience" defaultValue={editingExam?.targetAudience || 'ALL'} className="w-full px-3 py-2 rounded-xl border border-slate-200">
                    <option value="ALL">Tất cả</option>
                    <option value="CTV">Cộng tác viên (CTV)</option>
                    <option value="MEMBER">Thành viên CLB</option>
                    <option value="EXECUTIVE">Ban Điều hành</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Thời lượng (Phút)</label>
                  <input
                    type="number"
                    name="durationMinutes"
                    defaultValue={editingExam?.durationMinutes || 30}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tổng điểm</label>
                  <input type="number" name="maxScore" defaultValue={editingExam?.maxScore || 100} className="w-full px-3 py-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Điểm đạt</label>
                  <input type="number" name="passingScore" defaultValue={editingExam?.passingScore || 50} className="w-full px-3 py-2 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Trạng thái</label>
                  <select name="status" defaultValue={editingExam?.status || 'ACTIVE'} className="w-full px-3 py-2 rounded-xl border border-slate-200">
                    <option value="ACTIVE">ACTIVE (Mở thi)</option>
                    <option value="DRAFT">DRAFT (Sắp diễn ra)</option>
                    <option value="PAUSED">PAUSED (Tạm dừng)</option>
                    <option value="ENDED">ENDED (Đã kết thúc)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Chính sách một lần dự thi</label>
                <select name="oneAttemptPolicy" defaultValue={editingExam?.oneAttemptPolicy || 'CANDIDATE_AND_IP'} className="w-full px-3 py-2 rounded-xl border border-slate-200">
                  <option value="CANDIDATE_AND_IP">Khóa theo Mã Thí sinh & IP Fingerprint (Khuyên dùng)</option>
                  <option value="CANDIDATE_ONLY">Chỉ khóa theo Mã Thí sinh</option>
                  <option value="IP_ONLY">Chỉ khóa theo IP Mạng</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="allowReview" defaultChecked={editingExam?.allowReview ?? true} />
                  <span>Cho phép thí sinh xem lại nhận xét chi tiết sau thi</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-sm"
                >
                  Lưu kỳ thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUESTION CREATE / EDIT ================= */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h3>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nội dung câu hỏi *</label>
                <textarea
                  name="content"
                  rows={3}
                  required
                  defaultValue={editingQuestion?.content || ''}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Dạng câu hỏi</label>
                  <select name="questionType" defaultValue={editingQuestion?.questionType || 'SINGLE_CHOICE'} className="w-full px-3 py-2 rounded-xl border border-slate-200">
                    <option value="SINGLE_CHOICE">Trắc nghiệm 1 đáp án</option>
                    <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều đáp án</option>
                    <option value="TRUE_FALSE">Đúng / Sai</option>
                    <option value="SHORT_ANSWER">Trả lời ngắn</option>
                    <option value="ESSAY">Tự luận</option>
                    <option value="SITUATION">Tình huống CLB</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Điểm câu hỏi</label>
                  <input type="number" step="0.5" name="score" defaultValue={editingQuestion?.score || 1.0} className="w-full px-3 py-2 rounded-xl border border-slate-200" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Các lựa chọn (mỗi dòng 1 lựa chọn - nếu là trắc nghiệm)
                </label>
                <textarea
                  name="options"
                  rows={4}
                  defaultValue={
                    editingQuestion?.optionsJson
                      ? typeof editingQuestion.optionsJson === 'string'
                        ? JSON.parse(editingQuestion.optionsJson).join('\n')
                        : editingQuestion.optionsJson.join('\n')
                      : ''
                  }
                  placeholder="A. Lựa chọn 1&#10;B. Lựa chọn 2&#10;C. Lựa chọn 3&#10;D. Lựa chọn 4"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Đáp án chuẩn (Chỉ lưu nội bộ, không lộ cho thí sinh)
                </label>
                <input
                  type="text"
                  name="correctAnswer"
                  defaultValue={editingQuestion?.correctAnswer || ''}
                  placeholder="Ví dụ: A. Lựa chọn 1 (hoặc mảng JSON nếu nhiều đáp án)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Khung Rubric chấm tự luận / tình huống (JSON hoặc tiêu chí)
                </label>
                <textarea
                  name="rubricJson"
                  rows={3}
                  defaultValue={editingQuestion?.rubricJson || ''}
                  placeholder='{"criteria": [{"name": "Tính tư tưởng", "maxPoints": 5}, {"name": "Xử lý khéo léo", "maxPoints": 5}]}'
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-sm"
                >
                  Lưu câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUESTIONS JSON/CSV IMPORT ================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Nhập câu hỏi hàng loạt (JSON)</h3>
            <p className="text-xs text-slate-500">Dán mảng đối tượng câu hỏi định dạng JSON để nhập nhanh vào kỳ thi đã chọn.</p>

            <textarea
              rows={10}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[
  {
    "content": "Câu hỏi ví dụ...",
    "questionType": "SINGLE_CHOICE",
    "options": ["A. Đáp án 1", "B. Đáp án 2"],
    "correctAnswer": "A. Đáp án 1",
    "score": 10.0
  }
]'
              className="w-full p-3 rounded-2xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-brand-500"
            ></textarea>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
              >
                Hủy
              </button>
              <button
                onClick={handleImportQuestions}
                className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Thực hiện nhập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUBMISSION REVIEW & OVERRIDE ================= */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Chi tiết bài thi & Duyệt điểm</h3>
                <p className="text-xs text-slate-500">{selectedSubmission.fullName} ({selectedSubmission.candidateCode})</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700">
                {selectedSubmission.lookupCode}
              </span>
            </div>

            {/* Answer breakdown */}
            <div className="space-y-3">
              {selectedSubmission.answers?.map((ans: any, idx: number) => (
                <div key={ans.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Câu {idx + 1}: {ans.question?.content}</span>
                    <span className="text-brand-600">{ans.score}/{ans.maxScore}đ</span>
                  </div>
                  <div className="text-slate-600 bg-white p-2 rounded border border-slate-100">
                    <strong>Bài làm:</strong> {ans.answerText || ans.selectedOptionsJson || 'Chưa trả lời'}
                  </div>
                  {ans.aiFeedbackJson && (
                    <div className="text-slate-500 text-[11px] bg-brand-50/50 p-2 rounded">
                      <strong>AI Nhận xét:</strong> {ans.aiFeedbackJson}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Score Adjustment */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase">Quyết định điểm số của Quản trị viên</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Điểm cuối cùng (0 - {selectedSubmission.maxScore})</label>
                  <input
                    type="number"
                    step="0.1"
                    max={selectedSubmission.maxScore}
                    min={0}
                    value={reviewOverrideScore}
                    onChange={(e) => setReviewOverrideScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-brand-800"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ghi chú duyệt bài (Lưu Audit Log)</label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Lý do điều chỉnh hoặc duyệt..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
              >
                Đóng
              </button>
              <button
                onClick={handleSaveReview}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Xác nhận duyệt & Cập nhật Sheets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: UNLOCK EXCEPTION ================= */}
      {unlockModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Mở khóa lượt thi ngoại lệ</h3>
            <p className="text-xs text-slate-500">Hành động này sẽ giải phóng khóa một lần và được ghi lại trong Audit Log hệ thống.</p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lý do xử lý ngoại lệ *</label>
              <textarea
                rows={3}
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="Ví dụ: Thí sinh bị rớt mạng do sự cố tại điểm thi trường THPT..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUnlockModal({ open: false, lockId: '' })}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
              >
                Hủy
              </button>
              <button
                onClick={handleUnlockLock}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Xác nhận mở khóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
