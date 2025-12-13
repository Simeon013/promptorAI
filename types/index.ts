export enum Mode {
  Generate = 'generate',
  Improve = 'improve',
}

export interface SuggestionCategory {
  category: string;
  suggestions: string[];
}

export interface HistoryItem {
  id: string;
  mode: Mode;
  input: string;
  output: string;
  timestamp: number;
  constraints?: string;
  language?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  plan: Plan;
  quotaUsed: number;
  quotaLimit: number;
}

export enum Plan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum PromptType {
  GENERATE = 'GENERATE',
  IMPROVE = 'IMPROVE',
}

export enum Visibility {
  PRIVATE = 'PRIVATE',
  WORKSPACE = 'WORKSPACE',
  PUBLIC = 'PUBLIC',
}

export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

// =============================================================================
// Admin Customization Types
// =============================================================================

export interface PricingConfig {
  id: string;
  plan: Plan;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  quotaLimit: number;
  historyDays: number;
  workspaces: number;
  apiAccess: boolean;
  analyticsAccess: boolean;
  prioritySupport: boolean;
  customModels: boolean;
  isActive: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum PromoDuration {
  ONCE = 'once',
  REPEATING = 'repeating',
  FOREVER = 'forever',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  BOTH = 'both',
}

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  applicablePlans: Plan[];
  billingCycle: BillingCycle | null;
  startDate: string;
  endDate: string;
  maxRedemptions: number | null;
  currentRedemptions: number;
  isActive: boolean;
  stripePromotionCodeId: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  duration: PromoDuration;
  durationMonths: number | null;
  applicablePlans: Plan[];
  maxRedemptions: number | null;
  currentRedemptions: number;
  firstTimeOnly: boolean;
  expiresAt: string | null;
  isActive: boolean;
  stripeCouponId: string;
  stripePromotionCodeId: string | null;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string;
}

export interface PromoCodeRedemption {
  id: string;
  promoCodeId: string;
  userId: string;
  stripeSubscriptionId: string | null;
  redeemedAt: string;
}

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

export enum SettingCategory {
  GENERAL = 'general',
  PAYMENT = 'payment',
  AI = 'ai',
  QUOTAS = 'quotas',
  SECURITY = 'security',
}

export interface AppSetting {
  key: string;
  value: any; // JSONB value
  type: SettingType;
  description: string | null;
  category: SettingCategory | null;
  isPublic: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

// API Request/Response types
export interface CreatePricingConfigRequest {
  plan: Plan;
  priceMonthly: number;
  priceYearly: number;
  currency?: string;
  quotaLimit: number;
  historyDays: number;
  workspaces: number;
  apiAccess?: boolean;
  analyticsAccess?: boolean;
  prioritySupport?: boolean;
  customModels?: boolean;
}

export interface UpdatePricingConfigRequest extends Partial<CreatePricingConfigRequest> {
  syncStripe?: boolean; // Créer/mettre à jour les prix Stripe
}

export interface CreatePromotionRequest {
  name: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  applicablePlans: Plan[];
  billingCycle?: BillingCycle;
  startDate: string;
  endDate: string;
  maxRedemptions?: number;
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> {
  isActive?: boolean;
}

export interface CreatePromoCodeRequest {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  duration: PromoDuration;
  durationMonths?: number;
  applicablePlans: Plan[];
  maxRedemptions?: number;
  firstTimeOnly?: boolean;
  expiresAt?: string;
}

export interface UpdatePromoCodeRequest extends Partial<CreatePromoCodeRequest> {
  isActive?: boolean;
}

// ============================================================================
// Credit Packs
// ============================================================================

export interface CreditPack {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  credits: number;
  bonus_credits: number;
  total_credits: number;
  price: number;
  price_xof?: number;
  price_eur?: number;
  price_usd?: number;
  currency: string;
  tier_unlock?: string;
  min_tier_spend?: number;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Pack Promotions (Réductions sur les packs)
// ============================================================================

export type PromotionDiscountType = 'percentage' | 'fixed_amount';

export interface PackPromotion {
  id: string;
  name: string;
  description?: string;
  code?: string; // Code promo optionnel pour activer la promo

  // Ciblage
  pack_id?: string; // null = tous les packs
  all_packs: boolean;

  // Réduction
  discount_type: PromotionDiscountType;
  discount_value: number;

  // Période
  starts_at: string;
  ends_at: string;

  // Limites
  max_uses?: number;
  uses_count: number;
  max_uses_per_user: number;

  // Configuration
  is_active: boolean;
  is_stackable: boolean; // Cumulable avec codes promo
  priority: number;

  // Affichage
  show_on_pricing: boolean;
  badge_text?: string; // '-20%', 'PROMO'
  badge_color?: string; // 'red', 'orange', etc.

  // Métadonnées
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PackPromotionUse {
  id: string;
  promotion_id: string;
  user_id: string;
  purchase_id?: string;
  discount_applied: number;
  created_at: string;
}

export interface CreatePackPromotionRequest {
  name: string;
  description?: string;
  code?: string;
  pack_id?: string;
  all_packs: boolean;
  discount_type: PromotionDiscountType;
  discount_value: number;
  starts_at: string;
  ends_at: string;
  max_uses?: number;
  max_uses_per_user?: number;
  is_stackable?: boolean;
  priority?: number;
  show_on_pricing?: boolean;
  badge_text?: string;
  badge_color?: string;
}

export interface UpdatePackPromotionRequest extends Partial<CreatePackPromotionRequest> {
  is_active?: boolean;
}

export interface ActivePromotion {
  promotion_id: string;
  name: string;
  discount_type: PromotionDiscountType;
  discount_value: number;
  badge_text?: string;
  badge_color?: string;
  uses_remaining?: number;
  calculated_discount: number; // Montant de la réduction calculée
  final_price: number; // Prix final après réduction
}

// ============================================================================
// Currency (Devises)
// ============================================================================

export type CurrencyCode = 'XOF' | 'EUR' | 'USD';

export interface CurrencyRate {
  id: string;
  currency: CurrencyCode;
  name: string;
  symbol: string;
  rate_to_xof: number;
  rate_from_xof: number;
  is_active: boolean;
  is_default: boolean;
  decimals: number;
  display_format: string;
  last_updated: string;
  created_at: string;
}

export interface ValidatePromoCodeRequest {
  code: string;
  plan: Plan;
  userId: string;
}

export interface ValidatePromoCodeResponse {
  valid: boolean;
  promoCodeId?: string;
  discountType?: DiscountType;
  discountValue?: number;
  reason?: string;
  stripeCouponId?: string;
}
