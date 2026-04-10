// ============================================================
// @tucun/shared-utils — Utilitários compartilhados
// ============================================================
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// === GEO UTILITIES ===

/**
 * Calcula distância entre dois pontos usando a fórmula de Haversine
 * @returns distância em metros
 */
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Formata distância de forma amigável
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  const km = meters / 1000
  return `${km < 10 ? km.toFixed(1) : Math.round(km)}km`
}

/**
 * Verifica se coordenadas estão dentro de Rondônia
 */
export function isInRondonia(lat: number, lng: number): boolean {
  return lat >= -13.7 && lat <= -7.9 && lng >= -66.8 && lng <= -59.8
}

/**
 * Converte coordenadas para formato legível
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'L' : 'O'
  return `${Math.abs(lat).toFixed(6)}°${latDir} ${Math.abs(lng).toFixed(6)}°${lngDir}`
}

// === FISH / PESCA UTILITIES ===

/**
 * Verifica se um peixe pode ser pescado hoje (considera piracema)
 */
export function isFishingAllowedNow(
  seasonOpenMonth?: number,
  seasonCloseMonth?: number,
): boolean {
  if (!seasonOpenMonth || !seasonCloseMonth) return true
  const currentMonth = new Date().getMonth() + 1 // 1-12

  // Piracema em Rondônia: Novembro a Março
  const piraceaMonths = [11, 12, 1, 2, 3]
  if (piraceaMonths.includes(currentMonth)) return false

  // Verificar temporada específica da espécie
  if (seasonOpenMonth <= seasonCloseMonth) {
    return currentMonth >= seasonOpenMonth && currentMonth <= seasonCloseMonth
  } else {
    // Temporada cruza o ano (ex: Nov-Mar)
    return currentMonth >= seasonOpenMonth || currentMonth <= seasonCloseMonth
  }
}

/**
 * Retorna o status da piracema atual
 */
export function getPiraceaStatus(): {
  isActive: boolean
  message: string
  endsIn?: string
} {
  const now = new Date()
  const month = now.getMonth() + 1
  const piraceaMonths = [11, 12, 1, 2, 3]
  const isActive = piraceaMonths.includes(month)

  if (isActive) {
    const endDate = new Date(now.getFullYear(), 2, 31) // 31 de Março
    if (month > 3) endDate.setFullYear(endDate.getFullYear() + 1)
    return {
      isActive: true,
      message: '🚫 Período de Piracema — Pesca proibida em RO',
      endsIn: formatDistanceToNow(endDate, { locale: ptBR }),
    }
  }

  return {
    isActive: false,
    message: '✅ Pesca liberada neste período',
  }
}

/**
 * Formata tamanho mínimo de peixe
 */
export function formatMinSize(cm: number): string {
  return `Tamanho mínimo: ${cm}cm`
}

// === DATE UTILITIES ===

/**
 * Formata data relativa em português
 * Ex: "há 2 horas", "há 3 dias"
 */
export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), {
    locale: ptBR,
    addSuffix: true,
  })
}

/**
 * Formata data completa em português
 * Ex: "10 de abril de 2025"
 */
export function formatDate(date: string | Date): string {
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

/**
 * Formata data e hora
 * Ex: "10/04/2025 às 14:30"
 */
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

/**
 * Verifica se uma data já passou
 */
export function isExpired(date: string | Date): boolean {
  return isBefore(new Date(date), new Date())
}

/**
 * Verifica se uma data está no futuro
 */
export function isFuture(date: string | Date): boolean {
  return isAfter(new Date(date), new Date())
}

// === XP / GAMIFICATION UTILITIES ===

export const XP_REWARDS = {
  // Cadastros
  register: 0,
  emailVerified: 50,
  whatsappVerified: 50,
  profileCompleted: 100,

  // Mapa
  spotCreated: 100,
  spotCreatedWithPhotos: 150,
  spotCreatedWithVideo: 180,
  spotApproved: 50,
  spotRated: 10,

  // Alertas
  alertCreated: 15,
  alertWithPhoto: 25,
  alertWithVideo: 35,
  alertConfirmed: 20,
  alertConfirmedBy5: 20,
  alertConfirmedBy20: 50,
  alertConfirmOther: 5,
  alertEmergencyValid: 100,

  // Social
  postCreated: 10,
  postWithVideo: 20,
  postGot10Likes: 15,
  postGot50Likes: 50,
  followerGained: 2,

  // Pesca
  fishLogged: 20,
  fishLoggedWithPhoto: 30,
  fishReleased: 10,

  // Streak
  dailyLogin: 5,
  streak7Days: 50,
  streak30Days: 200,

  // Sustentabilidade
  ecoReportValid: 30,
  leftNoTrace: 5,

  // Assinatura
  subscriptionActivated: 200,

  // Badges
  badgeEarned: 0, // valor específico por badge
} as const

/**
 * Calcula o nível baseado nos XP
 */
export function calculateLevel(xp: number): {
  level: number
  title: string
  nextLevelXP: number
  progressPercent: number
} {
  const levels = [
    { level: 1, title: 'Iniciante', requiredXP: 0 },
    { level: 2, title: 'Pescador', requiredXP: 200 },
    { level: 3, title: 'Aventureiro', requiredXP: 500 },
    { level: 4, title: 'Explorador', requiredXP: 1000 },
    { level: 5, title: 'Desbravador', requiredXP: 2000 },
    { level: 6, title: 'Ribeirinho', requiredXP: 3500 },
    { level: 7, title: 'Mestre Pescador', requiredXP: 5000 },
    { level: 8, title: 'Lenda do Rio', requiredXP: 8000 },
    { level: 9, title: 'Rei dos Rios', requiredXP: 12000 },
    { level: 10, title: 'Tucunaré Lenda', requiredXP: 20000 },
  ]

  let currentLevel = levels[0]!
  let nextLevel = levels[1]!

  for (let i = 0; i < levels.length - 1; i++) {
    if (xp >= levels[i]!.requiredXP && xp < levels[i + 1]!.requiredXP) {
      currentLevel = levels[i]!
      nextLevel = levels[i + 1]!
      break
    }
    if (xp >= levels[levels.length - 1]!.requiredXP) {
      currentLevel = levels[levels.length - 1]!
      nextLevel = levels[levels.length - 1]!
    }
  }

  const progressPercent =
    nextLevel.requiredXP === currentLevel.requiredXP
      ? 100
      : Math.round(
          ((xp - currentLevel.requiredXP) /
            (nextLevel.requiredXP - currentLevel.requiredXP)) *
            100,
        )

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelXP: nextLevel.requiredXP,
    progressPercent: Math.min(progressPercent, 100),
  }
}

// === SUBSCRIPTION UTILITIES ===

/**
 * Verifica se o trial está próximo de expirar
 */
export function isTrialExpiringSoon(trialEndsAt: string): boolean {
  const end = new Date(trialEndsAt)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= 2 && diffDays > 0
}

/**
 * Retorna dias restantes no trial
 */
export function trialDaysLeft(trialEndsAt: string): number {
  const end = new Date(trialEndsAt)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

// === STRING UTILITIES ===

/**
 * Formata número de seguidores: 1234 → "1,2K"
 */
export function formatCount(count: number): string {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
  return `${(count / 1000000).toFixed(1)}M`
}

/**
 * Formata valor monetário em Real brasileiro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Trunca texto com reticências
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}

/**
 * Extrai menções (@usuario) de um texto
 */
export function extractMentions(text: string): string[] {
  const matches = text.match(/@([a-z0-9_]+)/g) ?? []
  return matches.map((m) => m.slice(1))
}

/**
 * Extrai hashtags de um texto
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#([a-zA-Z0-9_\u00C0-\u017F]+)/g) ?? []
  return matches.map((h) => h.slice(1).toLowerCase())
}

// === VALIDATION UTILITIES ===

export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]!) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[9]!)) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]!) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(digits[10]!)
}

export function isValidWhatsApp(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return /^55\d{10,11}$/.test(digits)
}

export function formatWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55')) {
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 5)} ${digits.slice(5, 9)}-${digits.slice(9)}`
  }
  return phone
}
