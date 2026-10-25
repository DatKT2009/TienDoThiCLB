import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AudienceSelectionModal from '@/components/AudienceSelectionModal'

export const metadata: Metadata = {
  title: 'TRỐNG ĐỒNG – HỆ THỐNG THI ĐUA TRỰC TUYẾN | CLB TN TÌNH NGUYỆN TRỐNG ĐỒNG',
  description: 'Hệ thống thi đua kiến thức và kỹ năng trực tuyến dành cho CTV, Thành viên và Ban Điều hành CLB Thanh niên tình nguyện Trống Đồng. ĐOÀN KẾT – XUNG KÍCH – SÁNG TẠO – TÌNH NGUYỆN.',
  keywords: ['Trống Đồng', 'Thi đua trực tuyến', 'CLB Thanh niên tình nguyện', 'Đoàn Thanh niên', 'Tình nguyện Trống Đồng'],
  authors: [{ name: 'CLB Thanh niên tình nguyện Trống Đồng' }],
  icons: {
    icon: '/logo-clb-trong-dong.png',
    apple: '/logo-clb-trong-dong.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-brand-500 selection:text-white">
        <AudienceSelectionModal />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
