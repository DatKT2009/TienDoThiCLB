const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('--- SEEDING DATABASE FOR TRỐNG ĐỒNG SYSTEM ---')

  // 1. Create Default Admin User
  const adminPasswordHash = await bcrypt.hash('TrongDong@2026', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: adminPasswordHash,
      fullName: 'Ban Quản Trị CLB Trống Đồng',
      role: 'SUPER_ADMIN'
    },
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      fullName: 'Ban Quản Trị CLB Trống Đồng',
      role: 'SUPER_ADMIN'
    }
  })
  console.log('✓ Admin user ready: admin / TrongDong@2026')

  // 2. Create Candidate Roster (CTV, Thành viên, Ban Điều hành)
  const sampleCandidates = [
    { candidateCode: 'CTV2026-001', fullName: 'Nguyễn Văn An', participantType: 'CTV', unitName: 'Đội Tình nguyện Tiếp sức Mùa thi' },
    { candidateCode: 'CTV2026-002', fullName: 'Trần Thị Mai', participantType: 'CTV', unitName: 'Đội Hỗ trợ Trẻ em Khó khăn' },
    { candidateCode: 'CTV2026-003', fullName: 'Lê Hoàng Nam', participantType: 'CTV', unitName: 'Đội Môi trường Xanh' },
    { candidateCode: 'TV2026-101', fullName: 'Phạm Thu Hương', participantType: 'MEMBER', unitName: 'Ban Truyền thông & Sự kiện' },
    { candidateCode: 'TV2026-102', fullName: 'Đỗ Minh Đức', participantType: 'MEMBER', unitName: 'Ban Tổ chức Hoạt động' },
    { candidateCode: 'TV2026-103', fullName: 'Hoàng Thùy Linh', participantType: 'MEMBER', unitName: 'Ban Hậu cần & Kỹ thuật' },
    { candidateCode: 'BDH2026-01', fullName: 'Vũ Quốc Khánh', participantType: 'EXECUTIVE', unitName: 'Chủ nhiệm CLB' },
    { candidateCode: 'BDH2026-02', fullName: 'Ngô Phương Thảo', participantType: 'EXECUTIVE', unitName: 'Phó Chủ nhiệm Thường trực' },
    { candidateCode: 'BDH2026-03', fullName: 'Bùi Thanh Tùng', participantType: 'EXECUTIVE', unitName: 'Ủy viên BĐH - Trưởng Ban Truyền thông' },
  ]

  for (const c of sampleCandidates) {
    await prisma.candidate.upsert({
      where: { candidateCode: c.candidateCode },
      update: c,
      create: c
    })
  }
  console.log(`✓ Seeded ${sampleCandidates.length} official candidates`)

  // 3. Create First Exam
  const examSlug = 'tim-hieu-truyen-thong-doan-va-clb-2026'
  const exam1 = await prisma.exam.upsert({
    where: { slug: examSlug },
    update: {},
    create: {
      title: 'Hội thi Tìm hiểu Truyền thống Đoàn TNCS Hồ Chí Minh & Tinh thần Tình nguyện Trống Đồng 2026',
      slug: examSlug,
      description: 'Đợt thi đua cao điểm chào mừng Tháng Thanh niên. Thử thách kiến thức về lịch sử Đoàn, tôn chỉ hoạt động của CLB Thanh niên tình nguyện Trống Đồng, kỹ năng tổ chức chương trình và xử lý tình huống thực tế.',
      targetAudience: 'ALL',
      durationMinutes: 20,
      totalQuestions: 6,
      maxScore: 100.0,
      passingScore: 60.0,
      startTime: new Date('2026-01-01T00:00:00Z'),
      endTime: new Date('2026-12-31T23:59:59Z'),
      status: 'ACTIVE',
      oneAttemptPolicy: 'CANDIDATE_AND_IP',
      allowReview: true,
      isLeaderboardPublic: true,
      hideLeaderboardNames: false,
    }
  })

  // Delete previous questions if any to re-seed cleanly
  await prisma.question.deleteMany({ where: { examId: exam1.id } })

  const questionsData = [
    {
      content: 'Đoàn TNCS Hồ Chí Minh được thành lập vào ngày, tháng, năm nào?',
      questionType: 'SINGLE_CHOICE',
      optionsJson: JSON.stringify([
        'A. 26/03/1931',
        'B. 03/02/1930',
        'C. 15/10/1956',
        'D. 19/05/1890'
      ]),
      correctAnswer: 'A. 26/03/1931',
      explanation: 'Đoàn TNCS Hồ Chí Minh được thành lập vào ngày 26/3/1931 tại Hội nghị Ban Chấp hành Trung ương Đảng lần thứ 2.',
      score: 15.0,
      difficulty: 'EASY',
      category: 'KIEN_THUC_DOAN',
      orderIndex: 1
    },
    {
      content: 'Khẩu hiệu hành động xuyên suốt của CLB Thanh niên tình nguyện Trống Đồng gồm những giá trị cốt lõi nào? (Chọn tất cả các đáp án đúng)',
      questionType: 'MULTIPLE_CHOICE',
      optionsJson: JSON.stringify([
        'A. ĐOÀN KẾT',
        'B. XUNG KÍCH',
        'C. SÁNG TẠO',
        'D. TÌNH NGUYỆN',
        'E. TIÊU PHÍ'
      ]),
      correctAnswer: JSON.stringify(['A. ĐOÀN KẾT', 'B. XUNG KÍCH', 'C. SÁNG TẠO', 'D. TÌNH NGUYỆN']),
      explanation: 'Khẩu hiệu chính thức của CLB: ĐOÀN KẾT – XUNG KÍCH – SÁNG TẠO – TÌNH NGUYỆN.',
      score: 20.0,
      difficulty: 'MEDIUM',
      category: 'KY_NANG_CLB',
      multiChoiceScoring: 'PARTIAL_CREDIT',
      orderIndex: 2
    },
    {
      content: 'Nhận định sau ĐÚNG hay SAI: "Tất cả các chiến dịch tình nguyện xa của CLB Trống Đồng đều bắt buộc phải khảo sát địa bàn trước tối thiểu 2 tuần và có phương án an toàn y tế dự phòng."',
      questionType: 'TRUE_FALSE',
      optionsJson: JSON.stringify(['Đúng', 'Sai']),
      correctAnswer: 'Đúng',
      explanation: 'Quy chế an toàn của CLB Trống Đồng quy định mọi hoạt động dã ngoại/tình nguyện xa đều phải tiền trạm kỹ lưỡng và chuẩn bị túi thuốc, kế hoạch y tế.',
      score: 10.0,
      difficulty: 'EASY',
      category: 'KY_NANG_CLB',
      orderIndex: 3
    },
    {
      content: 'Điền từ còn thiếu vào câu khẩu hiệu truyền thống: "Đâu cần thanh niên có, việc gì khó có ..."',
      questionType: 'SHORT_ANSWER',
      optionsJson: null,
      correctAnswer: 'thanh niên',
      explanation: 'Câu nói nổi tiếng của Bác Hồ: "Đâu cần thanh niên có, việc gì khó có thanh niên".',
      score: 15.0,
      difficulty: 'EASY',
      category: 'KIEN_THUC_DOAN',
      orderIndex: 4
    },
    {
      content: 'Bạn hãy trình bày ngắn gọn (khoảng 100 - 250 từ) vai trò của người thanh niên tình nguyện trong việc lan tỏa năng lượng tích cực và bảo vệ hình ảnh của CLB Trống Đồng trên mạng xã hội.',
      questionType: 'ESSAY',
      optionsJson: null,
      correctAnswer: 'Đáp án tham khảo: Nêu được tính gương mẫu, chuẩn mực phát ngôn; truyền thông các câu chuyện ý nghĩa nhân văn; bảo mật thông tin nội bộ; không tham gia kích động, chia rẽ.',
      explanation: 'Chấm bằng AI kết hợp Rubric 4 tiêu chí: Tính đúng đắn định hướng (6đ), Khả năng lan tỏa truyền thông (6đ), Tinh thần trách nhiệm với tổ chức (5đ), Văn phong mạch lạc (3đ).',
      score: 20.0,
      difficulty: 'HARD',
      category: 'KY_NANG_CLB',
      rubricJson: JSON.stringify({
        maxScore: 20.0,
        criteria: [
          { name: 'Định hướng tư tưởng và trách nhiệm thanh niên', maxPoints: 6.0, description: 'Thể hiện rõ tinh thần xung kích, phát ngôn chuẩn mực, bảo vệ danh dự tổ chức' },
          { name: 'Giải pháp lan tỏa tích cực trên mạng xã hội', maxPoints: 6.0, description: 'Chia sẻ hình ảnh đẹp, câu chuyện xúc động từ các chuyến tình nguyện' },
          { name: 'Quy tắc an toàn truyền thông và bảo mật nội bộ', maxPoints: 5.0, description: 'Nhận thức rủi ro tin giả, không vi phạm quy chế thông tin của CLB' },
          { name: 'Kỹ năng trình bày và văn phong mạch lạc', maxPoints: 3.0, description: 'Diễn đạt lưu loát, giàu cảm xúc, không sai chính tả nghiêm trọng' }
        ]
      }),
      orderIndex: 5
    },
    {
      content: 'Tình huống: Trong một buổi phát quà từ thiện tại xã vùng cao, số lượng bà con có hoàn cảnh khó khăn đến nhận quà đông hơn 20 người so với danh sách đã chốt trước đó từ chính quyền địa phương. Quà tặng chuẩn bị theo danh sách đã hết. Là một tình nguyện viên Trống Đồng tại hiện trường, bạn sẽ xử lý tình huống này như thế nào để vừa giữ đúng nguyên tắc, vừa thể hiện tình người và sự tôn trọng bà con?',
      questionType: 'SITUATION',
      optionsJson: null,
      correctAnswer: 'Đáp án tham khảo: Bình tĩnh giải thích nhã nhặn, mời bà con vào khu vực ngồi chờ; phối hợp nhanh với Trưởng đoàn và đại diện chính quyền xã để xác minh hoàn cảnh; đề xuất linh hoạt điều phối các phần quà dự phòng/quà của tình nguyện viên hoặc ghi nhận thông tin gửi hỗ trợ đợt sau; tuyệt đối không lớn tiếng, tránh gây hoang mang, mất trật tự.',
      explanation: 'Chấm bằng AI theo tiêu chí kỹ năng mềm và tác phong tình nguyện viên.',
      score: 20.0,
      difficulty: 'HARD',
      category: 'TINH_HUONG',
      rubricJson: JSON.stringify({
        maxScore: 20.0,
        criteria: [
          { name: 'Thái độ bình tĩnh, lịch sự, tôn trọng bà con', maxPoints: 5.0, description: 'Lắng nghe, giải thích ân cần, tránh to tiếng gây căng thẳng' },
          { name: 'Kỹ năng phối hợp với Ban Chỉ huy và chính quyền địa phương', maxPoints: 6.0, description: 'Báo cáo ngay cấp trên, xin ý kiến chính quyền xã để xác minh danh sách' },
          { name: 'Giải pháp xử lý linh hoạt, nhân văn', maxPoints: 6.0, description: 'Sử dụng quà dự phòng, san sẻ phần hỗ trợ hoặc ghi nhận trao đợt 2 có xác nhận' },
          { name: 'Đảm bảo trật tự và hình ảnh đẹp của CLB', maxPoints: 3.0, description: 'Giữ vững an ninh, không để kẻ xấu lợi dụng kích động' }
        ]
      }),
      orderIndex: 6
    }
  ]

  for (const q of questionsData) {
    await prisma.question.create({
      data: {
        examId: exam1.id,
        ...q
      }
    })
  }
  console.log(`✓ Seeded exam with ${questionsData.length} diverse questions!`)

  // 4. Default Settings
  const defaultSettings = [
    { key: 'GOOGLE_SHEETS_SYNC_ENABLED', value: 'true', category: 'GOOGLE_SHEETS' },
    { key: 'GOOGLE_SHEET_ID', value: '', category: 'GOOGLE_SHEETS' },
    { key: 'AI_PROVIDER', value: 'gemini', category: 'AI' },
    { key: 'AI_MODEL', value: 'gemini-1.5-flash', category: 'AI' },
    { key: 'ANTI_CHEAT_IP_POLICY_DEFAULT', value: 'CANDIDATE_AND_IP', category: 'SECURITY' },
    { key: 'DATA_RETENTION_DAYS', value: '365', category: 'SECURITY' }
  ]

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s
    })
  }
  console.log('✓ System settings initialized')

  console.log('--- SEEDING COMPLETED SUCCESSFULLY! ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
