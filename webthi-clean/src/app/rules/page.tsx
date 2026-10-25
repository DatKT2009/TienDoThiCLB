import React from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  FileCheck,
  CheckCircle,
  Clock,
  Sparkles,
  HelpCircle,
  PhoneCall,
  ArrowRight
} from 'lucide-react'

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-700 border border-brand-200">
          QUY CHẾ CHÍNH THỨC
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-900">
          Thể lệ Thi đua Trực tuyến CLB Trống Đồng
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
          Quy định chung nhằm đảm bảo tính công bằng, minh bạch, trung thực và lan tỏa tinh thần xung kích của Đoàn – Hội.
        </p>
      </div>

      {/* Crucial Notice Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-6 shadow-soft flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900 text-base">
            QUY ĐỊNH QUAN TRỌNG: MỖI THÍ SINH CHỈ NỘP BÀI 01 LẦN
          </h4>
          <p className="text-sm text-amber-800 leading-relaxed">
            Hệ thống áp dụng cơ chế xác thực kép (Mã thí sinh + Nhận diện dấu vân tay IP phía máy chủ). Thí sinh không thể thi lại hoặc nộp bài lần thứ hai sau khi đã hoàn tất. Vui lòng kiểm tra kỹ mọi câu trả lời trước khi ấn nút &ldquo;NỘP BÀI&rdquo;.
          </p>
        </div>
      </div>

      {/* Rules Content */}
      <div className="bg-white rounded-2xl p-8 shadow-soft border border-brand-100 space-y-8 text-slate-700">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-brand-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-extrabold">
              1
            </span>
            <span>Đối tượng tham gia</span>
          </h2>
          <ul className="list-disc pl-9 space-y-1 text-sm leading-relaxed text-slate-600">
            <li><strong>Cộng tác viên (CTV):</strong> Thanh niên, sinh viên đang trong thời gian thử thách và rèn luyện tại CLB.</li>
            <li><strong>Thành viên chính thức:</strong> Đã được công nhận là đoàn viên, thanh niên thuộc các Ban/Đội chuyên môn.</li>
            <li><strong>Ban Điều hành:</strong> Thường trực và Ủy viên Ban Điều hành CLB Trống Đồng.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-brand-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-extrabold">
              2
            </span>
            <span>Hình thức và thời gian làm bài</span>
          </h2>
          <div className="pl-9 space-y-2 text-sm leading-relaxed text-slate-600">
            <p>
              - Thí sinh làm bài trực tuyến trên nền tảng website TRỐNG ĐỒNG thông qua điện thoại thông minh, máy tính bảng hoặc máy tính có kết nối Internet.
            </p>
            <p>
              - Thời gian làm bài bắt đầu đếm ngược ngay khi thí sinh xác nhận thông tin và bấm &ldquo;BẮT ĐẦU LÀM BÀI&rdquo;. Khi hết thời gian quy định, hệ thống sẽ <strong>tự động thu bài và nộp kết quả</strong>.
            </p>
            <p>
              - Hệ thống tự động sao lưu bản nháp theo thời gian thực. Nếu vô tình tải lại trang hoặc mất mạng trong giây lát, thí sinh có thể mở lại trình duyệt để tiếp tục làm bài trong khoảng thời gian còn lại.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-brand-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-extrabold">
              3
            </span>
            <span>Cơ chế chấm điểm và tiêu chí đánh giá</span>
          </h2>
          <div className="pl-9 space-y-2 text-sm leading-relaxed text-slate-600">
            <p>
              <strong>• Câu hỏi trắc nghiệm khách quan, Đúng/Sai, Điền từ:</strong> Được hệ thống tự động đối chiếu và chấm ngay lập tức theo đáp án chuẩn.
            </p>
            <p>
              <strong>• Câu hỏi tự luận & Tình huống thực tế:</strong> Được đánh giá dựa trên khung tiêu chí Rubric chuyên môn (Tính định hướng tư tưởng, Kỹ năng xử lý tình huống, Tinh thần tình nguyện nhân văn, Văn phong mạch lạc). Điểm số tự luận được hỗ trợ đánh giá bởi AI và được Ban Giám khảo kiểm duyệt trước khi công bố thứ hạng chung cuộc.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-brand-900 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-extrabold">
              4
            </span>
            <span>Giải quyết thắc mắc & Sự cố kỹ thuật</span>
          </h2>
          <div className="pl-9 space-y-2 text-sm leading-relaxed text-slate-600">
            <p>
              Trong trường hợp thí sinh bị chặn do sử dụng chung mạng Wi-Fi trường học, ký túc xá hoặc gặp lỗi đường truyền đột ngột, vui lòng liên hệ ngay với Ban Kỹ thuật CLB để được kiểm tra nhật ký (Audit Log) và cấp quyền làm bài ngoại lệ nếu chính đáng.
            </p>
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-slate-700">Bộ phận Thường trực Tiếp nhận:</span>
              <span className="font-bold text-brand-600">Hotline: 0988.xxx.xxx</span>
            </div>
          </div>
        </section>
      </div>

      <div className="text-center pt-2">
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-all shadow-md shadow-brand-500/20"
        >
          <span>ĐÃ HIỂU THỂ LỆ – XEM KỲ THI NGAY</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
