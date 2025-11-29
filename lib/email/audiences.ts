import { resend, AUDIENCES } from './resend';

interface ContactData {
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
}

/**
 * Ajoute un contact à une audience Resend
 */
export async function addToAudience(
  audienceId: string,
  email: string,
  data?: ContactData
) {
  try {
    if (!resend) {
      console.warn('[Audience] Resend not configured, skipping add to audience');
      return { success: false, error: 'Resend not configured' };
    }

    const { data: contact, error } = await resend.contacts.create({
      audienceId,
      email,
      firstName: data?.firstName,
      lastName: data?.lastName,
      unsubscribed: data?.unsubscribed ?? false,
    });

    if (error) {
      console.error('[Audience] Error adding contact:', error);
      return { success: false, error };
    }

    console.log('[Audience] Contact added successfully:', contact?.id);
    return { success: true, id: contact?.id };
  } catch (error) {
    console.error('[Audience] Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Supprime un contact d'une audience
 */
export async function removeFromAudience(audienceId: string, email: string) {
  try {
    if (!resend) {
      console.warn('[Audience] Resend not configured, skipping remove from audience');
      return { success: false, error: 'Resend not configured' };
    }

    const { error } = await resend.contacts.remove({
      audienceId,
      email,
    });

    if (error) {
      console.error('[Audience] Error removing contact:', error);
      return { success: false, error };
    }

    console.log('[Audience] Contact removed successfully');
    return { success: true };
  } catch (error) {
    console.error('[Audience] Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Met à jour un contact dans une audience
 */
export async function updateContact(
  audienceId: string,
  email: string,
  data: ContactData
) {
  try {
    if (!resend) {
      console.warn('[Audience] Resend not configured, skipping update contact');
      return { success: false, error: 'Resend not configured' };
    }

    const { data: contact, error } = await resend.contacts.update({
      audienceId,
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      unsubscribed: data.unsubscribed,
    });

    if (error) {
      console.error('[Audience] Error updating contact:', error);
      return { success: false, error };
    }

    console.log('[Audience] Contact updated successfully');
    return { success: true, data: contact };
  } catch (error) {
    console.error('[Audience] Unexpected error:', error);
    return { success: false, error };
  }
}

/**
 * Ajoute un user à toutes les audiences pertinentes
 */
export async function syncUserToAudiences(user: {
  email: string;
  name: string;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
}) {
  const results = [];

  // Ajouter à ALL_USERS
  if (AUDIENCES.ALL_USERS) {
    results.push(
      await addToAudience(AUDIENCES.ALL_USERS, user.email, {
        firstName: user.name,
      })
    );
  }

  // Ajouter à l'audience spécifique au plan
  if (user.plan === 'FREE' && AUDIENCES.FREE_USERS) {
    results.push(
      await addToAudience(AUDIENCES.FREE_USERS, user.email, {
        firstName: user.name,
      })
    );
  } else if (
    (user.plan === 'PRO' || user.plan === 'STARTER' || user.plan === 'ENTERPRISE') &&
    AUDIENCES.PRO_USERS
  ) {
    results.push(
      await addToAudience(AUDIENCES.PRO_USERS, user.email, {
        firstName: user.name,
      })
    );
  }

  return results;
}

/**
 * Met à jour l'audience d'un user après changement de plan
 */
export async function updateUserAudiences(
  email: string,
  oldPlan: string,
  newPlan: string
) {
  const results = [];

  // Retirer de l'ancienne audience
  if (oldPlan === 'FREE' && AUDIENCES.FREE_USERS) {
    results.push(await removeFromAudience(AUDIENCES.FREE_USERS, email));
  } else if (AUDIENCES.PRO_USERS) {
    results.push(await removeFromAudience(AUDIENCES.PRO_USERS, email));
  }

  // Ajouter à la nouvelle audience
  if (newPlan === 'FREE' && AUDIENCES.FREE_USERS) {
    results.push(await addToAudience(AUDIENCES.FREE_USERS, email));
  } else if (AUDIENCES.PRO_USERS) {
    results.push(await addToAudience(AUDIENCES.PRO_USERS, email));
  }

  return results;
}
