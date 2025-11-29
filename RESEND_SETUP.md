# Configuration Resend pour Promptor

Guide complet pour configurer Resend et envoyer vos premiers emails.

## 📋 Prérequis

- Compte Resend (gratuit : 3,000 emails/mois)
- Domaine custom (optionnel, vous pouvez utiliser `onboarding.resend.dev` pour les tests)

---

## 🚀 Étape 1 : Créer un compte Resend

1. Aller sur [resend.com](https://resend.com)
2. Cliquer sur **Sign Up**
3. Créer un compte avec votre email

---

## 🔑 Étape 2 : Générer une API Key

1. Aller dans **Settings** > **API Keys**
2. Cliquer sur **Create API Key**
3. Nom : `Promptor Production` (ou `Promptor Dev`)
4. Permission : **Full Access**
5. Copier la clé (elle commence par `re_...`)

**Ajouter dans `.env.local` :**

```env
RESEND_API_KEY=re_votre_cle_api_ici
```

---

## 📧 Étape 3 : Configurer votre domaine (Optionnel)

### Option A : Utiliser le domaine de test (Rapide)

Pour les tests, vous pouvez utiliser `onboarding.resend.dev` :

```typescript
// lib/email/resend.ts
export const EMAIL_FROM = {
  DEFAULT: 'Promptor <onboarding@resend.dev>',
  // ...
};
```

### Option B : Utiliser votre propre domaine (Production)

1. Aller dans **Domains** > **Add Domain**
2. Entrer votre domaine : `promptor.app` (ou votre domaine)
3. Ajouter les enregistrements DNS fournis par Resend :

```
Type  Name              Value
----  ----              -----
TXT   @                 resend-verification=...
MX    @                 feedback-smtp.resend.com (Priority: 10)
TXT   resend._domainkey DKIM key...
```

4. Vérifier dans votre hébergeur DNS (Vercel, Cloudflare, etc.)
5. Attendre la vérification (quelques minutes à 24h)

---

## 👥 Étape 4 : Créer les Audiences

Les audiences permettent d'envoyer des emails en masse (newsletters, campagnes marketing).

1. Aller dans **Audiences**
2. Créer 5 audiences :

| Nom | Description | ID à copier |
|-----|-------------|-------------|
| **All Users** | Tous les utilisateurs | `aud_...` |
| **FREE Users** | Utilisateurs plan FREE | `aud_...` |
| **PRO Users** | Utilisateurs plans payants | `aud_...` |
| **Newsletter** | Abonnés newsletter | `aud_...` |
| **Inactive Users** | Users inactifs 30j+ | `aud_...` |

3. Copier les IDs et les ajouter dans `.env.local` :

```env
RESEND_AUDIENCE_ALL_USERS=aud_...
RESEND_AUDIENCE_FREE_USERS=aud_...
RESEND_AUDIENCE_PRO_USERS=aud_...
RESEND_AUDIENCE_NEWSLETTER=aud_...
RESEND_AUDIENCE_INACTIVE_USERS=aud_...
```

---

## ✅ Étape 5 : Tester l'envoi d'email

### Test manuel via React Email

Installer React Email Dev Tools :

```bash
npm install -D @react-email/cli
```

Ajouter dans `package.json` :

```json
{
  "scripts": {
    "email:dev": "email dev -p 3001"
  }
}
```

Lancer le preview :

```bash
npm run email:dev
```

Ouvrir [http://localhost:3001](http://localhost:3001) pour voir vos templates.

### Test via API

Créer un fichier de test :

```typescript
// scripts/test-email.ts
import { sendEmail } from '@/lib/email/send';
import { WelcomeEmail } from '@/lib/email/templates/WelcomeEmail';

async function testEmail() {
  const result = await sendEmail({
    to: 'votre-email@example.com',
    subject: '[TEST] Bienvenue sur Promptor',
    react: WelcomeEmail({
      userName: 'John Doe',
      dashboardUrl: 'http://localhost:3000/dashboard',
    }),
  });

  console.log('Result:', result);
}

testEmail();
```

Lancer :

```bash
npx ts-node scripts/test-email.ts
```

---

## 📊 Étape 6 : Vérifier les envois

1. Aller dans **Logs** dans Resend dashboard
2. Vérifier que l'email est bien **Delivered**
3. Vérifier les **Opens** et **Clicks** (analytics automatiques)

---

## 🔄 Workflow complet

### 1. **Inscription utilisateur**

```typescript
// app/api/auth/callback/route.ts
import { sendEmail } from '@/lib/email/send';
import { syncUserToAudiences } from '@/lib/email/audiences';
import { WelcomeEmail } from '@/lib/email/templates/WelcomeEmail';

// Envoyer email de bienvenue
await sendEmail({
  to: user.email,
  subject: 'Bienvenue sur Promptor !',
  react: WelcomeEmail({ userName: user.name }),
});

// Ajouter aux audiences
await syncUserToAudiences({
  email: user.email,
  name: user.name,
  plan: 'FREE',
});
```

### 2. **Paiement réussi**

```typescript
// app/api/webhooks/stripe/route.ts
import { sendEmail } from '@/lib/email/send';
import { PaymentSuccessEmail } from '@/lib/email/templates/PaymentSuccessEmail';

await sendEmail({
  to: user.email,
  subject: 'Paiement confirmé - Votre plan Pro est actif !',
  react: PaymentSuccessEmail({
    userName: user.name,
    plan: 'PRO',
    amount: '29€',
    quota: 999999,
  }),
});
```

### 3. **Newsletter (mensuelle)**

```typescript
// app/api/cron/send-newsletter/route.ts
import { sendBroadcastEmail } from '@/lib/email/send';
import { NewsletterTemplate } from '@/lib/email/templates/NewsletterTemplate';
import { AUDIENCES } from '@/lib/email/resend';

await sendBroadcastEmail({
  audienceId: AUDIENCES.NEWSLETTER,
  subject: '📬 Newsletter Promptor - Décembre 2025',
  react: NewsletterTemplate({ content: newsletterContent }),
});
```

---

## 💰 Limites & Tarifs

| Plan | Emails/mois | Prix |
|------|-------------|------|
| **Free** | 3,000 | Gratuit |
| **Pro** | 50,000 | $20/mois |
| **Business** | 100,000 | $40/mois |

**Pour Promptor :**
- Démarrage : Plan Free (largement suffisant)
- 100+ users actifs : Plan Pro ($20/mois)

---

## 🎯 Prochaines étapes

1. ✅ Configurer Resend
2. ✅ Créer les templates emails
3. 🔄 Intégrer dans `/api/auth/callback`
4. 🔄 Intégrer dans webhook Stripe
5. 🔄 Créer le dashboard marketing admin
6. 🔄 Mettre en place les campagnes marketing

---

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [React Email Documentation](https://react.email/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Dashboard Resend](https://resend.com/dashboard)

---

**✨ Vous êtes prêt à envoyer vos premiers emails !**
