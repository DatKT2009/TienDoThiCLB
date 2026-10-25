import React from 'react'
import Link from 'next/link'
import BronzeDrumLogo from './BronzeDrumLogo'
import { Heart, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white pt-14 pb-8 border-t-4 border-brand-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Club Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <BronzeDrumLogo size={44} variant="light" />
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">
                  TRỐNG ĐỒNG
                </span>
                <p className="text-xs text-brand-200">
                  HỆ THỐNG THI ĐUA TRỰC TUYẾN
                </p>
              </div>
            </div>
            <p className="text-sm text-brand-100 max-w-md leading-relaxed">
              Nền tảng thi đua kiến thức và kỹ năng dành cho Cộng tác viên, Thành viên và Ban Điều hành CLB Thanh niên tình nguyện Trống Đồng. Ứng dụng công nghệ tự động chấm điểm và AI chuẩn mực Đoàn TNCS Hồ Chí Minh.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-brand-800/80 border border-brand-700 text-xs font-semibold text-gold-400">
              <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
              <span>KHẨU HIỆU: ĐOÀN KẾT – XUNG KÍCH – SÁNG TẠO – TÌNH NGUYỆN</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-200 mb-4">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-sm text-brand-100">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/exams" className="hover:text-white transition-colors">
                  Danh sách kỳ thi
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-white transition-colors">
                  Thể lệ & Quy chế thi
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-white transition-colors">
                  Bảng xếp hạng thi đua
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-white transition-colors">
                  Tra cứu kết quả bài thi
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-200 mb-4">
              Hỗ trợ kỹ thuật & Thí sinh
            </h4>
            <ul className="space-y-2.5 text-xs text-brand-100">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <span>Văn phòng CLB Thanh niên tình nguyện Trống Đồng</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>clbtinhnguyentrongdong@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Hotline BĐH: 0988.xxx.xxx</span>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Hệ thống bảo vệ IP & Chống gian lận 2 lớp</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-800 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-300 gap-4">
          <p>© {new Date().getFullYear()} CLB Thanh niên tình nguyện Trống Đồng. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link href="/rules" className="hover:text-white transition-colors">
              Quy định bảo mật
            </Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Cổng Quản trị viên
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
