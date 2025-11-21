import { supabase } from '@/lib/db/supabase';

/**
 * Types d'actions auditées
 */
export type AuditAction =
  | 'payment.checkout_started'
  | 'payment.checkout_completed'
  | 'payment.subscription_updated'
  | 'payment.subscription_cancelled'
  | 'plan.upgraded'
  | 'plan.downgraded'
  | 'prompt.deleted'
  | 'prompt.bulk_deleted'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'quota.reset'
  | 'auth.login'
  | 'auth.logout'
  | 'admin.user_modified'
  | 'admin.quota_adjusted';

/**
 * Types de ressources
 */
export type ResourceType =
  | 'user'
  | 'prompt'
  | 'subscription'
  | 'payment'
  | 'quota';

/**
 * Interface pour un log d'audit
 */
export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Crée un log d'audit
 *
 * @param entry - Les données du log
 * @returns true si le log a été créé, false sinon
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<boolean> {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      user_id: entry.userId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId || null,
      details: entry.details || null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
    });

    if (error) {
      console.error('Erreur création audit log:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur audit log:', error);
    return false;
  }
}

/**
 * Extrait les informations client d'une requête
 */
export function getClientInfo(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ipAddress, userAgent };
}

/**
 * Helper pour logger un paiement
 */
export async function logPayment(
  userId: string,
  action: Extract<AuditAction, `payment.${string}`>,
  details: {
    plan?: string;
    amount?: number;
    currency?: string;
    stripeSessionId?: string;
    stripeSubscriptionId?: string;
  },
  request?: Request
): Promise<void> {
  const clientInfo = request ? getClientInfo(request) : {};

  await createAuditLog({
    userId,
    action,
    resourceType: 'payment',
    resourceId: details.stripeSessionId || details.stripeSubscriptionId,
    details,
    ...clientInfo,
  });
}

/**
 * Helper pour logger un changement de plan
 */
export async function logPlanChange(
  userId: string,
  oldPlan: string,
  newPlan: string,
  request?: Request
): Promise<void> {
  const clientInfo = request ? getClientInfo(request) : {};
  const action: AuditAction =
    getPlanLevel(newPlan) > getPlanLevel(oldPlan) ? 'plan.upgraded' : 'plan.downgraded';

  await createAuditLog({
    userId,
    action,
    resourceType: 'subscription',
    details: { oldPlan, newPlan },
    ...clientInfo,
  });
}

/**
 * Helper pour logger une suppression de prompt
 */
export async function logPromptDeleted(
  userId: string,
  promptId: string,
  request?: Request
): Promise<void> {
  const clientInfo = request ? getClientInfo(request) : {};

  await createAuditLog({
    userId,
    action: 'prompt.deleted',
    resourceType: 'prompt',
    resourceId: promptId,
    ...clientInfo,
  });
}

/**
 * Helper pour logger la création d'un utilisateur
 */
export async function logUserCreated(
  userId: string,
  email: string,
  request?: Request
): Promise<void> {
  const clientInfo = request ? getClientInfo(request) : {};

  await createAuditLog({
    userId,
    action: 'user.created',
    resourceType: 'user',
    resourceId: userId,
    details: { email },
    ...clientInfo,
  });
}

/**
 * Obtient le niveau d'un plan (pour comparer upgrades/downgrades)
 */
function getPlanLevel(plan: string): number {
  const levels: Record<string, number> = {
    FREE: 0,
    STARTER: 1,
    PRO: 2,
    ENTERPRISE: 3,
  };
  return levels[plan] ?? 0;
}

/**
 * Récupère les logs d'audit (pour admin dashboard)
 * Note: Nécessite le service role ou une policy admin
 */
export async function getAuditLogs(options: {
  userId?: string;
  action?: AuditAction;
  resourceType?: ResourceType;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  logs: Array<{
    id: string;
    user_id: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    details: Record<string, unknown> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
  }>;
  total: number;
} | null> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options.action) {
      query = query.eq('action', options.action);
    }

    if (options.resourceType) {
      query = query.eq('resource_type', options.resourceType);
    }

    if (options.startDate) {
      query = query.gte('created_at', options.startDate.toISOString());
    }

    if (options.endDate) {
      query = query.lte('created_at', options.endDate.toISOString());
    }

    const limit = options.limit || 50;
    const offset = options.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erreur récupération audit logs:', error);
      return null;
    }

    return {
      logs: data || [],
      total: count || 0,
    };
  } catch (error) {
    console.error('Erreur getAuditLogs:', error);
    return null;
  }
}
