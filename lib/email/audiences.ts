import { brevoContactsApi, BREVO_LISTS, BREVO_API_KEY } from './brevo';
import * as brevo from '@getbrevo/brevo';

interface ContactData {
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, string | number | boolean>;
}

/**
 * Ajoute un contact à une liste Brevo
 */
export async function addToList(listId: number, email: string, data?: ContactData) {
  try {
    if (!brevoContactsApi) {
      console.warn('[Audience] Brevo not configured, skipping add to list');
      return { success: false, error: 'Brevo not configured' };
    }

    const createContact = new brevo.CreateContact();
    createContact.email = email;
    createContact.listIds = [listId];

    if (data?.firstName || data?.lastName) {
      createContact.attributes = {
        FIRSTNAME: data.firstName || '',
        LASTNAME: data.lastName || '',
        ...data.attributes,
      };
    }

    const response = await brevoContactsApi.createContact(createContact, {
      headers: {
        'api-key': BREVO_API_KEY!,
      },
    });

    console.log('[Audience] Contact added successfully');
    return { success: true, id: response.body?.id };
  } catch (error: any) {
    // Si le contact existe déjà, on le met à jour
    if (error.response?.body?.code === 'duplicate_parameter') {
      console.log('[Audience] Contact already exists, updating instead');
      return updateContact(email, { listIds: [listId], ...data });
    }

    console.error('[Audience] Error adding contact:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Supprime un contact d'une liste
 */
export async function removeFromList(listId: number, email: string) {
  try {
    if (!brevoContactsApi) {
      console.warn('[Audience] Brevo not configured, skipping remove from list');
      return { success: false, error: 'Brevo not configured' };
    }

    // Brevo ne permet pas de retirer d'une liste spécifique directement
    // Il faut mettre à jour le contact pour enlever la liste
    const identifier = email;
    const updateContact = new brevo.UpdateContact();
    updateContact.unlinkListIds = [listId];

    await brevoContactsApi.updateContact(identifier, updateContact, {
      headers: {
        'api-key': BREVO_API_KEY!,
      },
    });

    console.log('[Audience] Contact removed from list successfully');
    return { success: true };
  } catch (error) {
    console.error('[Audience] Error removing contact:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Met à jour un contact Brevo
 */
export async function updateContact(
  email: string,
  data: {
    firstName?: string;
    lastName?: string;
    listIds?: number[];
    unlinkListIds?: number[];
    attributes?: Record<string, string | number | boolean>;
  }
) {
  try {
    if (!brevoContactsApi) {
      console.warn('[Audience] Brevo not configured, skipping update contact');
      return { success: false, error: 'Brevo not configured' };
    }

    const identifier = email;
    const updateContactData = new brevo.UpdateContact();

    if (data.firstName || data.lastName || data.attributes) {
      updateContactData.attributes = {
        ...(data.firstName && { FIRSTNAME: data.firstName }),
        ...(data.lastName && { LASTNAME: data.lastName }),
        ...data.attributes,
      };
    }

    if (data.listIds) {
      updateContactData.listIds = data.listIds;
    }

    if (data.unlinkListIds) {
      updateContactData.unlinkListIds = data.unlinkListIds;
    }

    await brevoContactsApi.updateContact(identifier, updateContactData, {
      headers: {
        'api-key': BREVO_API_KEY!,
      },
    });

    console.log('[Audience] Contact updated successfully');
    return { success: true };
  } catch (error) {
    console.error('[Audience] Error updating contact:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Ajoute un user à toutes les listes pertinentes
 */
export async function syncUserToLists(user: {
  email: string;
  name: string;
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
}) {
  const results = [];
  const [firstName, ...lastNameParts] = user.name.split(' ');
  const lastName = lastNameParts.join(' ');

  // Ajouter à ALL_USERS
  if (BREVO_LISTS.ALL_USERS) {
    results.push(
      await addToList(BREVO_LISTS.ALL_USERS, user.email, {
        firstName,
        lastName,
        attributes: {
          PLAN: user.plan,
        },
      })
    );
  }

  // Ajouter à la liste spécifique au plan
  if (user.plan === 'FREE' && BREVO_LISTS.FREE_USERS) {
    results.push(
      await addToList(BREVO_LISTS.FREE_USERS, user.email, {
        firstName,
        lastName,
      })
    );
  } else if (
    (user.plan === 'PRO' || user.plan === 'STARTER' || user.plan === 'ENTERPRISE') &&
    BREVO_LISTS.PRO_USERS
  ) {
    results.push(
      await addToList(BREVO_LISTS.PRO_USERS, user.email, {
        firstName,
        lastName,
      })
    );
  }

  return results;
}

/**
 * Met à jour les listes d'un user après changement de plan
 */
export async function updateUserLists(email: string, oldPlan: string, newPlan: string) {
  const results = [];

  // Retirer de l'ancienne liste
  if (oldPlan === 'FREE' && BREVO_LISTS.FREE_USERS) {
    results.push(await removeFromList(BREVO_LISTS.FREE_USERS, email));
  } else if (BREVO_LISTS.PRO_USERS) {
    results.push(await removeFromList(BREVO_LISTS.PRO_USERS, email));
  }

  // Ajouter à la nouvelle liste
  if (newPlan === 'FREE' && BREVO_LISTS.FREE_USERS) {
    results.push(await addToList(BREVO_LISTS.FREE_USERS, email));
  } else if (BREVO_LISTS.PRO_USERS) {
    results.push(await addToList(BREVO_LISTS.PRO_USERS, email));
  }

  // Mettre à jour l'attribut PLAN
  results.push(
    await updateContact(email, {
      attributes: {
        PLAN: newPlan,
      },
    })
  );

  return results;
}

/**
 * Supprime complètement un contact de Brevo
 */
export async function deleteContact(email: string) {
  try {
    if (!brevoContactsApi) {
      console.warn('[Audience] Brevo not configured, skipping delete contact');
      return { success: false, error: 'Brevo not configured' };
    }

    await brevoContactsApi.deleteContact(email, {
      headers: {
        'api-key': BREVO_API_KEY!,
      },
    });

    console.log('[Audience] Contact deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[Audience] Error deleting contact:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
