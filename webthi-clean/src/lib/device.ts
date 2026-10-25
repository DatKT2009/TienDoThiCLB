/**
 * Client Device / Machine Fingerprinting Helper
 * Tạo định danh duy nhất cho từng máy tính / thiết bị (Device Machine Fingerprint),
 * không phụ thuộc vào IP mạng (Wi-Fi công cộng hay mạng trường học).
 */

export function getDeviceMachineFingerprint(): string {
  if (typeof window === 'undefined') return 'server-side-unknown-device'

  try {
    // 1. Kiểm tra hoặc khởi tạo Machine UUID cố định trong localStorage & Cookie
    let machineUuid = localStorage.getItem('trongdong_machine_id')
    if (!machineUuid) {
      machineUuid = 'MCH-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36)
      localStorage.setItem('trongdong_machine_id', machineUuid)
      document.cookie = `trongdong_machine_id=${machineUuid}; path=/; max-age=31536000; SameSite=Lax`
    }

    // 2. Thu thập đặc trưng phần cứng của máy (Hardware characteristics)
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    const hardwareConcurrency = navigator.hardwareConcurrency || 2
    const userAgent = navigator.userAgent || ''
    const language = navigator.language || ''

    // 3. Canvas fingerprint nhẹ không ảnh hưởng hiệu năng
    let canvasHash = '0'
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 100
      canvas.height = 30
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillStyle = '#087DBB'
        ctx.fillText('TRONG_DONG_DEVICE', 2, 2)
        canvasHash = canvas.toDataURL().slice(-20)
      }
    } catch {
      // fallback
    }

    const rawSignature = `${machineUuid}|${screenInfo}|${timezone}|${hardwareConcurrency}|${language}|${canvasHash}`

    // Simple fast DJB2 hash
    let hash = 5381
    for (let i = 0; i < rawSignature.length; i++) {
      hash = (hash * 33) ^ rawSignature.charCodeAt(i)
    }

    return `DEV-${machineUuid.slice(4, 12)}-${(hash >>> 0).toString(16).toUpperCase()}`
  } catch {
    return 'DEV-GENERIC-CLIENT'
  }
}
