// ============================================================
// @tucun/shared-schemas — Validações Zod (mobile + api + web)
// ============================================================
import { z } from 'zod'

// === AUTH ===
export const RegisterSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  username: z
    .string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(30, 'Username muito longo')
    .regex(/^[a-z0-9_]+$/, 'Apenas letras minúsculas, números e _'),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número'),
  whatsapp: z
    .string()
    .regex(/^55\d{10,11}$/, 'Número inválido. Use: 5511987654321')
    .optional(),
  state: z.string().length(2).default('RO'),
})

export const LoginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const SendOtpSchema = z.object({
  whatsapp: z
    .string()
    .regex(/^55\d{10,11}$/, 'Formato: 5569912345678 (com DDI e DDD)'),
})

export const VerifyOtpSchema = z.object({
  whatsapp: z.string(),
  code: z
    .string()
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d{6}$/, 'Código deve ser numérico'),
})

// === USER ===
export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500, 'Bio muito longa').optional(),
  profession: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().length(2).optional(),
})

export const AddEquipmentSchema = z.object({
  category: z.enum([
    'vara', 'carretilha', 'molinete', 'linha', 'anzol', 'isca',
    'barco', 'motor', 'barraca', 'rede', 'tarrafa', 'jiral',
    'caixa_termica', 'fogao', 'lanterna', 'gps', 'outro'
  ]),
  brand: z.string().max(50).optional(),
  model: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
})

export const AddFishLogSchema = z.object({
  speciesId: z.string().uuid(),
  spotId: z.string().uuid().optional(),
  weightKg: z.number().min(0.01).max(500).optional(),
  lengthCm: z.number().min(1).max(500).optional(),
  wasReleased: z.boolean().default(true),
  notes: z.string().max(500).optional(),
})

// === FISHING SPOT ===
export const CreateSpotSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100),
  description: z
    .string()
    .min(20, 'Descreva melhor o local (mínimo 20 caracteres)')
    .max(2000),
  lat: z
    .number()
    .min(-90).max(90),
  lng: z
    .number()
    .min(-180).max(180),
  type: z.enum(['wild', 'chacara', 'pesque_pague', 'boat_point', 'roadside']),
  fishSpeciesIds: z.array(z.string().uuid()).default([]),
  checklist: z.object({
    groundType: z.enum(['sand', 'mud', 'rock', 'firm', 'mixed']).optional(),
    hasTreesForTarp: z.boolean().default(false),
    hasFlatTentArea: z.boolean().default(false),
    hasStoneFirepit: z.boolean().default(false),
    hasCoveredArea: z.boolean().default(false),
    hasJiral: z.boolean().default(false),
    hasBathSpot: z.boolean().default(false),
    hasBathroom: z.boolean().default(false),
    hasDrinkingWater: z.boolean().default(false),
    hasElectricity: z.boolean().default(false),
    hasShade: z.boolean().default(false),
    hasDock: z.boolean().default(false),
    hasBoatRamp: z.boolean().default(false),
    hasBoatRental: z.boolean().default(false),
    hasEquipmentRental: z.boolean().default(false),
    hasCellSignal: z.boolean().default(false),
    hasSatelliteInternet: z.boolean().default(false),
    hasCamping: z.boolean().default(false),
    hasTrashCollection: z.boolean().default(false),
  }),
})

export const RateSpotSchema = z.object({
  spotId: z.string().uuid(),
  fishingQuality: z.number().int().min(1).max(5),
  structureQuality: z.number().int().min(1).max(5),
  accessQuality: z.number().int().min(1).max(5),
  safetyQuality: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

// === ALERTS ===
export const CreateAlertSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  locationName: z.string().max(200).optional(),
  category: z.enum(['fluvial', 'terrestre', 'seguranca', 'servico', 'natureza']),
  subcategory: z.string().min(1).max(100),
  dangerLevel: z.enum(['critico', 'alto', 'medio', 'baixo', 'positivo']),
  affectsBoat: z.boolean(),
  affectsCar: z.boolean(),
  riverCondition: z.enum(['cheio', 'vazio', 'ambos', 'nao_aplicavel']).optional(),
  isSeasonal: z.boolean().default(false),
  activeMonths: z.array(z.number().int().min(1).max(12)).optional(),
  durationType: z.enum(['temporario', 'curto_prazo', 'medio_prazo', 'permanente', 'sazonal']),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
}).refine(data => data.affectsBoat || data.affectsCar, {
  message: 'Selecione pelo menos um tipo de transporte afetado',
})

export const VoteAlertSchema = z.object({
  alertId: z.string().uuid(),
  vote: z.enum(['confirm', 'deny']),
  comment: z.string().max(500).optional(),
})

// === POSTS ===
export const CreatePostSchema = z.object({
  caption: z.string().max(2200).optional(),
  mediaUrls: z
    .array(z.string().url())
    .min(1, 'Adicione pelo menos uma foto ou vídeo')
    .max(10),
  mediaTypes: z.array(z.enum(['photo', 'video', 'carousel'])),
  musicId: z.string().uuid().optional(),
  spotId: z.string().uuid().optional(),
  speciesIds: z.array(z.string().uuid()).default([]),
})

export const CreateCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z
    .string()
    .min(1, 'Comentário não pode ser vazio')
    .max(500),
})

// === CHAT ===
export const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().max(4096).optional(),
  mediaUrl: z.string().url().optional(),
  type: z.enum(['text', 'photo', 'video', 'audio', 'location', 'spot']),
  spotId: z.string().uuid().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
}).refine(data => data.content || data.mediaUrl, {
  message: 'Mensagem deve ter conteúdo ou mídia',
})

// === SUGGESTIONS ===
export const CreateSuggestionSchema = z.object({
  title: z
    .string()
    .min(10, 'Título deve ter pelo menos 10 caracteres')
    .max(100),
  description: z
    .string()
    .min(30, 'Descreva melhor sua sugestão (mínimo 30 caracteres)')
    .max(1000),
  category: z.enum([
    'mapa', 'pesca', 'social', 'premium', 'bug',
    'design', 'notificacao', 'geral', 'sustentabilidade', 'marketplace'
  ]),
  mediaUrls: z.array(z.string().url()).max(3).default([]),
})

export const DevFeedbackSchema = z.object({
  message: z
    .string()
    .min(10, 'Mensagem muito curta')
    .max(2000),
  category: z.enum(['feedback', 'bug', 'elogio', 'duvida', 'negocio']),
  suggestionId: z.string().uuid().optional(),
})

// === SUBSCRIPTION ===
export const CreateSubscriptionSchema = z.object({
  planType: z.enum(['basic', 'premium', 'monthly']),
  paymentMethod: z.enum([
    'pix_once', 'pix_recurrent', 'credit_card', 'apple_pay', 'google_pay'
  ]),
  installments: z.number().int().min(1).max(10).default(1),
})

// === TYPES INFERIDOS ===
export type RegisterDto = z.infer<typeof RegisterSchema>
export type LoginDto = z.infer<typeof LoginSchema>
export type SendOtpDto = z.infer<typeof SendOtpSchema>
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>
export type AddEquipmentDto = z.infer<typeof AddEquipmentSchema>
export type AddFishLogDto = z.infer<typeof AddFishLogSchema>
export type CreateSpotDto = z.infer<typeof CreateSpotSchema>
export type RateSpotDto = z.infer<typeof RateSpotSchema>
export type CreateAlertDto = z.infer<typeof CreateAlertSchema>
export type CreatePostDto = z.infer<typeof CreatePostSchema>
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>
export type SendMessageDto = z.infer<typeof SendMessageSchema>
export type CreateSuggestionDto = z.infer<typeof CreateSuggestionSchema>
export type DevFeedbackDto = z.infer<typeof DevFeedbackSchema>
export type CreateSubscriptionDto = z.infer<typeof CreateSubscriptionSchema>
