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
