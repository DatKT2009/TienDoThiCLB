import React from 'react'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import BronzeDrumLogo from '@/components/BronzeDrumLogo'
import {
  Award,
  ArrowRight,
  Clock,
  HelpCircle,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  BarChart3
} from 'lucide-react'

// Fetch real data on server side (never fabricate numbers)
async function getHomeData() {
  try {
    const [activeExams, totalExamsCount, validSubmissionsCount, candidatesCount] = await Promise.all([
      prisma.exam.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          _count: { select: { questions: true, submissions: true } }
        }
      }),
      prisma.exam.count(),
      prisma.submission.count({ where: { submittedAt: { not: null } } }),
      prisma.candidate.count()
    ])

    return {
      activeExams,
      stats: {
        totalExams: totalExamsCount,
        validSubmissions: validSubmissionsCount,
        activeMembers: candidatesCount
      }
    }
  } catch (e) {
    return {
      activeExams: [],
      stats: { totalExams: 0, validSubmissions: 0, activeMembers: 0 }
    }
  }
}

export const revalidate = 10 // revalidate every 10 seconds

export default async function HomePage() {
  const { activeExams, stats } = await getHomeData()

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white py-20 lg:py-28 pattern-bronze-drum">
        <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-[2px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-brand-100">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>CLB THANH NIÊN TÌNH NGUYỆN TRỐNG ĐỒNG</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
                BẢN LĨNH THANH NIÊN –{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-200">
                  BỨT PHÁ THÀNH TÍCH
                </span>
              </h1>

              <p className="text-base sm:text-xl text-brand-100 max-w-2xl leading-relaxed">
                Tham gia thử thách, khẳng định kiến thức, nâng cao tinh thần đoàn kết và trách nhiệm của thành viên CLB. Hệ thống chấm điểm thông minh tích hợp AI và bảo vệ công bằng tuyệt đối.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/exams"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-brand-950 font-bold text-base transition-all shadow-lg shadow-gold-500/25 hover:scale-105 active:scale-95"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  <span>THAM GIA KỲ THI NGAY</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/leaderboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold text-base transition-all backdrop-blur-md"
                >
                  <Award className="w-5 h-5 text-gold-400" />
                  <span>Bảng xếp hạng thi đua</span>
                </Link>
              </div>

              {/* Slogan pill */}
              <div className="pt-2 text-xs sm:text-sm font-medium text-brand-200 tracking-wider">
                ★ ĐOÀN KẾT – XUNG KÍCH – SÁNG TẠO – TÌNH NGUYỆN ★
              </div>
            </div>

            {/* Bronze drum vector hero centerpiece */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                <div className="absolute -top-3 -right-3 px-3 py-1 bg-gold-500 text-brand-950 text-xs font-bold rounded-full shadow-md">
                  CHÍNH THỨC 2026
                </div>
                <BronzeDrumLogo size={200} variant="light" />
                <p className="text-center text-xs font-semibold text-brand-100 mt-4 tracking-wide uppercase">
                  Biểu tượng Văn hóa & Tinh thần Trống Đồng
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME STATS SECTION (No fake data!) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-100 flex items-center gap-4 transition-all hover:shadow-card hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Tổng số kỳ thi</p>
              <h3 className="text-3xl font-extrabold text-brand-900 mt-0.5">{stats.totalExams}</h3>
              <p className="text-xs text-brand-600 mt-1">Đã và đang được tổ chức</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-100 flex items-center gap-4 transition-all hover:shadow-card hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Lượt dự thi hợp lệ</p>
              <h3 className="text-3xl font-extrabold text-brand-900 mt-0.5">{stats.validSubmissions}</h3>
              <p className="text-xs text-emerald-600 mt-1">Đã được ghi nhận & chấm điểm</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-soft border border-brand-100 flex items-center gap-4 transition-all hover:shadow-card hover:-translate-y-1">
            <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Thành viên tham gia</p>
              <h3 className="text-3xl font-extrabold text-brand-900 mt-0.5">{stats.activeMembers}</h3>
              <p className="text-xs text-amber-600 mt-1">CTV, Thành viên & Ban Điều hành</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ACTIVE EXAMS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              <span>Đang diễn ra</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-900">
              Các kỳ thi trực tuyến nổi bật
            </h2>
          </div>
          <Link
            href="/exams"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>Xem tất cả kỳ thi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {activeExams.length === 0 ? (
          <div className="bg-brand-50 border border-brand-100 rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-brand-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-brand-900">Hiện chưa có kỳ thi đang mở</h3>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Ban Điều hành sẽ sớm cập nhật kỳ thi đợt tiếp theo. Thí sinh vui lòng theo dõi thông báo trên trang tin CLB.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-brand-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-1.5"
              >
                <div className="p-6">
                  {/* Status & Audience badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      Đang diễn ra
                    </span>
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

                  <h3 className="text-lg font-bold text-brand-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-3">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-6 leading-relaxed">
                    {exam.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-500" />
                      <span>{exam.durationMinutes} phút</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-brand-500" />
                      <span>{exam._count?.questions || exam.totalQuestions} câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-gold-500" />
                      <span>Thang {exam.maxScore} điểm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-brand-500" />
                      <span>{exam._count?.submissions || 0} lượt nộp</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-brand-50/70 border-t border-brand-100">
                  <Link
                    href={`/exams/${exam.slug}/verify`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-all shadow-sm shadow-brand-500/20"
                  >
                    <span>VÀO THI NGAY</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. 3-STEP PROCESS SECTION */}
      <section className="bg-brand-100/60 py-16 border-y border-brand-200 subtle-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Quy trình tham gia
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-900 mt-1">
              3 bước dự thi đơn giản & minh bạch
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Hệ thống được tối ưu trải nghiệm nhanh gọn cho cả điện thoại di động và máy tính.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-brand-200/80 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-brand-500 text-white font-extrabold flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-brand-900 mb-2 mt-1">Xác nhận thông tin</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Điền chính xác Họ tên, Mã CTV/Thành viên, Chi đoàn hoặc bộ phận và đồng ý với quy chế thi.
              </p>
              <div className="p-3 bg-brand-50 rounded-xl text-xs text-brand-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Kiểm soát giới hạn 01 lượt thi theo tài khoản & IP mạng.</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-brand-200/80 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-brand-500 text-white font-extrabold flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-brand-900 mb-2 mt-1">Làm bài thi trực tiếp</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Hoàn thành các dạng câu hỏi trắc nghiệm, tình huống, câu hỏi ngắn và tự luận trong thời gian quy định.
              </p>
              <div className="p-3 bg-brand-50 rounded-xl text-xs text-brand-700 flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>Đồng hồ đếm ngược, lưu nháp tự động và chống mất bài.</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-brand-200/80 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-brand-500 text-white font-extrabold flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-brand-900 mb-2 mt-1">Nhận kết quả & Xếp hạng</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Hệ thống chấm tự động, AI chấm tự luận theo Rubric, cấp mã tra cứu và tự động đồng bộ Google Sheets.
              </p>
              <div className="p-3 bg-brand-50 rounded-xl text-xs text-brand-700 flex items-center gap-2">
                <Award className="w-4 h-4 flex-shrink-0 text-gold-500" />
                <span>Vinh danh Top 1, Top 2, Top 3 trên Bảng xếp hạng.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VOLUNTEER SPIRIT CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 to-brand-700 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-card">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="px-3 py-1 bg-gold-500 text-brand-950 text-xs font-extrabold rounded-full tracking-wider uppercase">
              TINH THẦN THANH NIÊN VIỆT NAM
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              &ldquo;Đâu cần thanh niên có, việc gì khó có thanh niên&rdquo;
            </h2>
            <p className="text-sm sm:text-base text-brand-100">
              Mỗi bài thi không chỉ là điểm số, mà là cam kết về kiến thức chuẩn mực, kỹ năng vững vàng và tinh thần sẵn sàng cống hiến vì cộng đồng của CLB Trống Đồng.
            </p>
            <div className="pt-2">
              <Link
                href="/exams"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-brand-900 font-bold hover:bg-brand-50 transition-all shadow-md"
              >
                <span>Bắt đầu kỳ thi ngay bây giờ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
