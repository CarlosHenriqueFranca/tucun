// ============================================================
// @tucun/shared-types — Tipos compartilhados entre todos os apps
// ============================================================

// === ENUMS ===
export type SubscriptionTier = 'free' | 'trial' | 'basic' | 'premium' | 'founding'
export type UserState = 'AC'|'AL'|'AP'|'AM'|'BA'|'CE'|'DF'|'ES'|'GO'|'MA'|
  'MT'|'MS'|'MG'|'PA'|'PB'|'PR'|'PE'|'PI'|'RJ'|'RN'|'RS'|'RO'|'RR'|'SC'|'SP'|'SE'|'TO'
export type SpotType = 'wild' | 'chacara' | 'pesque_pague' | 'boat_point' | 'roadside'
export type SpotStatus = 'pending' | 'approved' | 'rejected'
export type AlertCategory = 'fluvial' | 'terrestre' | 'seguranca' | 'servico' | 'natureza'
export type DangerLevel = 'critico' | 'alto' | 'medio' | 'baixo' | 'positivo'
export type RiverCondition = 'cheio' | 'vazio' | 'ambos' | 'nao_aplicavel'
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'special'
export type PostType = 'photo' | 'video' | 'carousel'
export type MessageType = 'text' | 'photo' | 'video' | 'audio' | 'location' | 'spot'
export type PaymentMethod = 'pix_once' | 'pix_recurrent' | 'credit_card' | 'apple_pay' | 'google_pay'
export type PaymentStatus = 'pending' | 'confirmed' | 'overdue' | 'refunded' | 'failed'
export type SuggestionStatus = 'pending' | 'approved' | 'voting' | 'selected' | 'in_development' | 'implemented' | 'rejected'
export type SuggestionCategory = 'mapa' | 'pesca' | 'social' | 'premium' | 'bug' | 'design' | 'notificacao' | 'geral' | 'sustentabilidade' | 'marketplace'

// === USER ===
export interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  whatsapp?: string
  avatarUrl?: string
  bio?: string
  profession?: string
  city?: string
  state: UserState
  xpPoints: number
  consecutiveDays: number
  subscriptionTier: SubscriptionTier
  isFoundingMember: boolean
  isEmailVerified: boolean
  isWhatsappVerified: boolean
  oauthProviders: string[]
  pinnedBadgeIds: string[]
  followersCount: number
  followingCount: number
  postsCount: number
  spotsCreatedCount: number
  fishLoggedCount: number
  createdAt: string
}

export interface UserEquipment {
  id: string
  userId: string
  category: string  // vara, carretilha, molinete, barco, motor, barraca, rede, etc.
  brand?: string
  model?: string
  description?: string
  imageUrl?: string
  createdAt: string
}

export interface FishLog {
  id: string
  userId: string
  speciesId: string
  speciesName: string
  spotId?: string
  spotName?: string
  weightKg?: number
  lengthCm?: number
  wasReleased: boolean
  photoUrl?: string
  notes?: string
  fishedAt: string
}

// === AUTH ===
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  user: UserProfile
  tokens: AuthTokens
}

// === FISHING SPOT ===
export interface Coordinates {
  lat: number
  lng: number
}

export interface SpotChecklist {
  groundType?: string
  hasTreesForTarp: boolean
  hasFlatTentArea: boolean
  hasStoneFirepit: boolean
  hasCoveredArea: boolean
  hasJiral: boolean
  hasBathSpot: boolean
  hasBathroom: boolean
  hasDrinkingWater: boolean
  hasElectricity: boolean
  hasShade: boolean
  hasDock: boolean
  hasBoatRamp: boolean
  hasBoatRental: boolean
  hasEquipmentRental: boolean
  hasCellSignal: boolean
  hasSatelliteInternet: boolean
  hasCamping: boolean
  hasTrashCollection: boolean
}

export interface FishingSpot {
  id: string
  createdBy: string
  createdByUser?: Pick<UserProfile, 'id' | 'name' | 'username' | 'avatarUrl'>
  name: string
  description: string
  coordinates: Coordinates
  type: SpotType
  status: SpotStatus
  checklist: SpotChecklist
  mediaUrls: string[]
  fishSpeciesIds: string[]
  avgRating: number
  totalRatings: number
  xpRewardForCreator: number
  isPremiumOnly: boolean
  isOfflineAvailable: boolean
  distance?: number  // em metros, calculado no cliente
  createdAt: string
  updatedAt: string
}

// === ROUTE ALERTS ===
export interface RouteAlert {
  id: string
  createdBy: string
  createdByUser?: Pick<UserProfile, 'id' | 'name' | 'username' | 'avatarUrl'>
  coordinates: Coordinates
  locationName?: string
  category: AlertCategory
  subcategory: string
  dangerLevel: DangerLevel
  affectsBoat: boolean
  affectsCar: boolean
  riverCondition?: RiverCondition
  isSeasonal: boolean
  activeMonths?: number[]
  durationType: string
  expiresAt?: string
  title: string
  description?: string
  mediaUrls: string[]
  confirmations: number
  denials: number
  status: 'active' | 'expired' | 'removed'
  isEmergency: boolean
  trustScore: number
  distance?: number
  createdAt: string
}

// === FISH SPECIES ===
export interface FishSpecies {
  id: string
  name: string
  scientificName: string
  photoUrl: string
  description: string
  minSizeCm: number
  avgWeightKg: number
  maxWeightKg?: number
  seasonOpenMonth?: number
  seasonCloseMonth?: number
  isProtected: boolean
  recommendedBaits: string[]
  fishingTips: string
  isCurrentlyAllowed: boolean  // calculado baseado na data atual
  areas: SpeciesArea[]
}

export interface SpeciesArea {
  id: string
  speciesId: string
  areaName: string
  coordinates: Coordinates
  radiusKm: number
}

// === POSTS / FEED ===
export interface Post {
  id: string
  userId: string
  user: Pick<UserProfile, 'id' | 'name' | 'username' | 'avatarUrl' | 'pinnedBadgeIds'>
  caption?: string
  mediaUrls: string[]
  mediaTypes: PostType[]
  musicId?: string
  music?: MusicTrack
  spotId?: string
  spot?: Pick<FishingSpot, 'id' | 'name' | 'coordinates'>
  speciesIds: string[]
  likesCount: number
  commentsCount: number
  isLiked: boolean
  createdAt: string
}

export interface Story {
  id: string
  userId: string
  user: Pick<UserProfile, 'id' | 'name' | 'username' | 'avatarUrl'>
  mediaUrl: string
  type: 'photo' | 'video'
  spotId?: string
  expiresAt: string
  isViewed: boolean
  createdAt: string
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  url: string
  durationSeconds: number
  coverUrl?: string
}

export interface Comment {
  id: string
  postId: string
  userId: string
  user: Pick<UserProfile, 'id' | 'name' | 'username' | 'avatarUrl' | 'pinnedBadgeIds'>
  content: string
  createdAt: string
}

// === CHAT ===
export interface Conversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  avatarUrl?: string
  participants: Pick<UserProfile, 'id' | 'name' | 'username' | 'avatarUrl'>[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  sender?: Pick<UserProfile, 'id' | 'name' | 'username' | 'avatarUrl'>
  content?: string
  mediaUrl?: string
  type: MessageType
  spotData?: Pick<FishingSpot, 'id' | 'name' | 'coordinates'>
  locationData?: Coordinates
  createdAt: string
}

// === BADGES ===
export interface Badge {
  id: string
  name: string
  description: string
  emoji: string
  iconUrl?: string
  rarity: BadgeRarity
  category: string
  borderColor: string
  glowColor?: string
  isAnimated: boolean
  xpReward: number
  totalAwarded: number
  maxAwards?: number
  isLimitedEdition: boolean
  availableUntil?: string
}

export interface UserBadge {
  userId: string
  badge: Badge
  isPinned: boolean
  displayOrder: number
  showNextToName: boolean
  earnedAt: string
}

export interface BadgeProgress {
  badge: Badge
  currentValue: number
  requiredValue: number
  percentComplete: number
}

// === GAMIFICATION ===
export interface XPEvent {
  id: string
  userId: string
  amount: number
  reason: string
  totalAfter: number
  createdAt: string
}

export interface RankingEntry {
  position: number
  user: Pick<UserProfile, 'id' | 'name' | 'username' | 'avatarUrl' | 'pinnedBadgeIds'>
  xpPoints: number
  spotsCreated: number
  fishLogged: number
  state: UserState
}

// === SUBSCRIPTION / PAYMENT ===
export interface Subscription {
  id: string
  userId: string
  planType: SubscriptionTier
  planPrice?: number
  billingCycle?: 'monthly' | 'annual' | 'lifetime'
  paymentMethod?: PaymentMethod
  installments?: number
  installmentValue?: number
  installmentsPaid?: number
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'founding_free'
  trialEndsAt?: string
  currentPeriodEnd?: string
  isFoundingMemberFree: boolean
  daysLeftInTrial?: number
  createdAt: string
}

export interface PaymentRecord {
  id: string
  subscriptionId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  pixQrCode?: string
  pixCopyPaste?: string
  pixExpiresAt?: string
  paidAt?: string
  dueDate?: string
  createdAt: string
}

// === SUGGESTIONS ===
export interface Suggestion {
  id: string
  userId: string
  user: Pick<UserProfile, 'id' | 'name' | 'username' | 'avatarUrl'>
  title: string
  description: string
  category: SuggestionCategory
  mediaUrls: string[]
  status: SuggestionStatus
  adminNote?: string
  votingStartsAt?: string
  votingEndsAt?: string
  votesCount: number
  hasVoted: boolean
  implementedAt?: string
  implementationNote?: string
  versionReleased?: string
  isPublic: boolean
  isFeatured: boolean
  createdAt: string
}

// === PAGINATION ===
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// === API RESPONSES ===
export interface ApiResponse<T = void> {
  success: boolean
  data?: T
  message?: string
  error?: string
  statusCode: number
}

// === NOTIFICATIONS ===
export interface Notification {
  id: string
  userId: string
  type: 'like' | 'comment' | 'follow' | 'badge' | 'xp' | 'alert' | 'subscription' | 'suggestion'
  title: string
  body: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: string
}
