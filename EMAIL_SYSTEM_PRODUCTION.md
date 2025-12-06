# 📧 Système d'emails - Configuration Production

## ⚠️ Statut actuel : DÉSACTIVÉ EN DÉVELOPPEMENT

Le système d'emails Brevo est **temporairement désactivé** en développement pour les raisons suivantes :

1. ✅ **Pas de domaine vérifié** → emails @smtp-brevo.com ont des limites
2. ✅ **Webhooks Stripe non fonctionnels** sur localhost
3. ✅ **Tests polluent** la boîte mail et les quotas Brevo
4. ✅ **Complexité inutile** en développement local

## 🚀 Réactivation en production

### Pré-requis

**Avant de déployer en production, vous devez** :

1. **Vérifier un domaine personnalisé dans Brevo**
   - Aller dans Settings > Senders & IP > Add a Domain
   - Ajouter votre domaine (ex: `promptor.com`)
   - Configurer les enregistrements DNS :
     - DKIM
     - SPF
     - DMARC
   - Attendre la vérification (24-48h)

2. **Configurer les webhooks Stripe**
   - Aller dans Stripe Dashboard > Developers > Webhooks
   - Ajouter l'endpoint : `https://votredomaine.com/api/webhooks/stripe`
   - Événements à écouter :
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copier le signing secret dans `STRIPE_WEBHOOK_SECRET`

3. **Mettre à jour les variables d'environnement Vercel**
   ```bash
   BREVO_API_KEY=xkeysib-...
   BREVO_SENDER_EMAIL=noreply@votredomaine.com  # Votre domaine vérifié
   BREVO_LIST_ALL_USERS=5
   BREVO_LIST_FREE_USERS=6
   BREVO_LIST_PRO_USERS=7
   BREVO_LIST_NEWSLETTER=8
   BREVO_LIST_INACTIVE_USERS=9
   STRIPE_WEBHOOK_SECRET=whsec_...  # Secret des webhooks
   NEXT_PUBLIC_SITE_URL=https://votredomaine.com
   ```

### Fichiers à décommenter

Une fois en production, **décommentez les sections TODO** dans les fichiers suivants :

#### 1. `/app/api/auth/callback/route.ts`

```typescript
// Lignes 4-7 : Décommenter les imports
import { sendEmail } from '@/lib/email/send';
import { syncUserToLists } from '@/lib/email/audiences';
import { getWelcomeEmailHtml } from '@/lib/email/templates/html/welcome.html';

// Lignes 70-109 : Décommenter l'envoi d'email de bienvenue
// et l'ajout aux listes Brevo
```

#### 2. `/app/api/stripe/sync-subscription/route.ts`

```typescript
// Lignes 5-8 : Décommenter les imports
import { sendEmail } from '@/lib/email/send';
import { updateUserLists } from '@/lib/email/audiences';
import { getPaymentSuccessEmailHtml } from '@/lib/email/templates/html/payment-success.html';

// Lignes 86-132 : Décommenter l'envoi d'email de paiement
// et la mise à jour des listes Brevo
```

#### 3. `/app/api/webhooks/stripe/route.ts`

Ce fichier contient déjà la logique complète d'emails.
**En production**, les webhooks Stripe appelleront automatiquement ce fichier.

**En développement**, on utilise `/api/stripe/sync-subscription` à la place.

### Tests en production

Après déploiement, tester :

1. **Création de compte** → Email de bienvenue reçu
2. **Abonnement STARTER** → Email de confirmation de paiement
3. **Abonnement PRO** → Email de confirmation de paiement
4. **Annulation d'abonnement** → Email de confirmation d'annulation (via webhook)
5. **Contacts Brevo** → Vérifier que les utilisateurs sont dans les bonnes listes

---

## 📊 Templates d'emails disponibles

8 templates HTML professionnels prêts à l'emploi :

1. **Welcome** - Email de bienvenue lors de l'inscription
2. **Payment Success** - Confirmation après paiement réussi
3. **Contact Received** - Confirmation de réception du formulaire de contact
4. **Quota Reminder** - Alerte à 80% du quota utilisé
5. **Quota Exceeded** - Alerte lorsque le quota est dépassé
6. **Subscription Cancelled** - Confirmation d'annulation d'abonnement
7. **Inactivity Reminder** - Email de réengagement pour utilisateurs inactifs
8. **Newsletter** - Template pour campagnes marketing

Tous les templates sont dans : `/lib/email/templates/html/`

---

## 🔍 Diagnostic des problèmes

### Email non reçu ?

1. Vérifier le dashboard Brevo : https://app.brevo.com/campaign/list/transac
2. Vérifier les spams
3. Vérifier que `BREVO_SENDER_EMAIL` utilise un domaine vérifié
4. Vérifier les logs Vercel pour voir si l'email a été envoyé

### Webhook Stripe ne se déclenche pas ?

1. Vérifier que l'endpoint est bien configuré dans Stripe Dashboard
2. Vérifier le signing secret dans les variables d'environnement
3. Consulter les logs de webhooks dans Stripe Dashboard
4. Vérifier que l'URL est accessible publiquement (pas localhost)

### Contact non ajouté à Brevo ?

1. Vérifier que les `BREVO_LIST_*` IDs sont corrects
2. Vérifier les logs pour voir les erreurs Brevo
3. Vérifier que l'API key a les permissions nécessaires
4. Consulter le dashboard Brevo Contacts

---

## 📝 Notes importantes

- **Ne pas utiliser `/api/stripe/sync-subscription` en production** → Utiliser uniquement les webhooks
- **Tester les emails en staging** avant de déployer en production
- **Surveiller les quotas Brevo** (300 emails/jour en plan gratuit)
- **Passer à un plan payant Brevo** si nécessaire (Starter: 25€/mois pour 20,000 emails)

---

## ✅ Checklist de déploiement

Production :

- [ ] Domaine personnalisé vérifié dans Brevo
- [ ] Webhooks Stripe configurés
- [ ] Variables d'environnement mises à jour sur Vercel
- [ ] Fichiers d'emails décommentés
- [ ] Tests de création de compte réussis
- [ ] Tests d'abonnement réussis
- [ ] Vérification des contacts dans Brevo
- [ ] Surveillance des quotas Brevo activée

---

🎉 **Le système d'emails est prêt pour la production !**

Une fois tous les prérequis remplis, il fonctionnera automatiquement sans intervention manuelle.
