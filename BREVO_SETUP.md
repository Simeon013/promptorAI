# Configuration de Brevo (ex-Sendinblue)

Ce guide vous accompagne dans la configuration complète de Brevo pour l'envoi d'emails dans Promptor.

## 📌 Pourquoi Brevo ?

Brevo (anciennement Sendinblue) est un excellent choix pour Promptor car :

✅ **Plan gratuit généreux** : 300 emails/jour (9,000/mois) gratuitement
✅ **Pas de domaine requis** : Envoyez des emails immédiatement avec `@smtp-brevo.com`
✅ **Contacts illimités** : Gérez tous vos utilisateurs sans limite
✅ **Marketing automation** : Segmentation, workflows, statistiques détaillées
✅ **Transactionnel + Marketing** : Deux types d'emails dans une seule plateforme

## 🚀 Étape 1 : Créer un compte Brevo

1. Allez sur https://www.brevo.com
2. Cliquez sur "Sign up free"
3. Remplissez vos informations :
   - Email professionnel
   - Nom de l'entreprise : "Promptor" (ou votre nom)
   - Pays
4. Validez votre email

## 🔑 Étape 2 : Générer une clé API

1. Connectez-vous à https://app.brevo.com
2. Allez dans **Settings** (⚙️ en haut à droite)
3. Cliquez sur **SMTP & API**
4. Dans l'onglet **API Keys**, cliquez sur **Generate a new API key**
5. Donnez-lui un nom : "Promptor Production" (ou "Promptor Dev")
6. Copiez la clé (format: `xkeysib-xxxxxxxxx`)

⚠️ **Important** : Sauvegardez cette clé, elle ne sera plus affichée !

## 📋 Étape 3 : Créer les listes de contacts

Les listes permettent de segmenter vos utilisateurs pour des campagnes ciblées.

1. Allez dans **Contacts** > **Lists**
2. Créez les 5 listes suivantes :

### Liste 1 : All Users
- **Nom** : `All Users`
- **Description** : Tous les utilisateurs inscrits
- Cliquez sur **Create** et notez l'ID (ex: `1`)

### Liste 2 : Free Users
- **Nom** : `Free Users`
- **Description** : Utilisateurs avec plan FREE
- Notez l'ID (ex: `2`)

### Liste 3 : Pro Users
- **Nom** : `Pro Users`
- **Description** : Utilisateurs avec plans payants (STARTER, PRO, ENTERPRISE)
- Notez l'ID (ex: `3`)

### Liste 4 : Newsletter
- **Nom** : `Newsletter`
- **Description** : Abonnés à la newsletter
- Notez l'ID (ex: `4`)

### Liste 5 : Inactive Users
- **Nom** : `Inactive Users`
- **Description** : Utilisateurs inactifs (30+ jours sans connexion)
- Notez l'ID (ex: `5`)

## 🔧 Étape 4 : Configurer les variables d'environnement

Créez ou modifiez votre fichier `.env.local` :

\`\`\`bash
# Brevo Email Service
BREVO_API_KEY=xkeysib-votre_clé_api_ici

# Email de l'expéditeur (utilisez votre email de compte Brevo pour les tests)
BREVO_SENDER_EMAIL=votre.email@example.com

# IDs des listes créées à l'étape 3
BREVO_LIST_ALL_USERS=1
BREVO_LIST_FREE_USERS=2
BREVO_LIST_PRO_USERS=3
BREVO_LIST_NEWSLETTER=4
BREVO_LIST_INACTIVE_USERS=5
\`\`\`

⚠️ **Important** : Pour les tests, utilisez l'email de votre compte Brevo dans `BREVO_SENDER_EMAIL`

## ✉️ Étape 5 : Tester l'envoi d'emails

Lancez le script de test :

\`\`\`bash
npm run test:brevo votre.email@example.com
\`\`\`

Ou si vous n'avez pas configuré le script dans `package.json` :

\`\`\`bash
npx tsx scripts/test-brevo-email.ts votre.email@example.com
\`\`\`

Vous devriez voir :

\`\`\`
✅ BREVO_API_KEY trouvée
   Clé: xkeysib-xxxxxxx...

📧 Envoi d'un email de test à: votre.email@example.com
⏳ Envoi en cours...

✅ EMAIL ENVOYÉ AVEC SUCCÈS !
   ID du message: <20250102123456.abcdef@smtp-brevo.com>
   Destinataire: votre.email@example.com

💡 Vérifiez votre boîte mail (et les spams si besoin)
\`\`\`

## 🎨 Étape 6 : (Optionnel) Ajouter un domaine personnalisé

Pour une utilisation en production, ajoutez votre propre domaine :

### 6.1 Ajouter le domaine dans Brevo

1. Allez dans **Settings** > **Senders & IP**
2. Cliquez sur **Add a Domain**
3. Entrez votre domaine (ex: `promptor.app`)
4. Brevo vous donnera des enregistrements DNS à configurer

### 6.2 Configurer les enregistrements DNS

Chez votre provider DNS (Cloudflare, Namecheap, OVH, etc.), ajoutez :

**DKIM Record** :
\`\`\`
Type: TXT
Name: mail._domainkey
Value: [fourni par Brevo]
\`\`\`

**SPF Record** :
\`\`\`
Type: TXT
Name: @
Value: v=spf1 include:spf.brevo.com ~all
\`\`\`

**DMARC Record** (optionnel mais recommandé) :
\`\`\`
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:votre.email@promptor.app
\`\`\`

### 6.3 Vérifier le domaine

1. Retournez dans Brevo > **Senders & IP**
2. Cliquez sur **Verify** à côté de votre domaine
3. La vérification peut prendre 24-48h

### 6.4 Mettre à jour .env.local

\`\`\`bash
BREVO_SENDER_EMAIL=noreply@promptor.app
\`\`\`

## 📊 Étape 7 : Créer des attributs personnalisés (optionnel)

Pour un meilleur tracking, créez des attributs personnalisés :

1. Allez dans **Contacts** > **Settings**
2. Cliquez sur **Add a new attribute**
3. Créez les attributs suivants :

- **PLAN** (Type: Text) - Plan de l'utilisateur (FREE, STARTER, PRO, ENTERPRISE)
- **QUOTA_USED** (Type: Number) - Prompts utilisés ce mois
- **QUOTA_LIMIT** (Type: Number) - Limite mensuelle de prompts
- **LAST_LOGIN** (Type: Date) - Dernière connexion
- **SIGNUP_DATE** (Type: Date) - Date d'inscription

Ces attributs vous permettront de créer des segments avancés pour vos campagnes.

## 📧 Types d'emails configurés

Promptor utilise Brevo pour 8 types d'emails différents :

### Emails transactionnels (envoyés automatiquement) :

1. **Welcome Email** - Envoyé lors de l'inscription
2. **Payment Success Email** - Envoyé après un paiement réussi
3. **Contact Received Email** - Confirmation après contact
4. **Quota Reminder Email** - Rappel à 80% du quota
5. **Quota Exceeded Email** - Notification de quota dépassé
6. **Subscription Cancelled Email** - Confirmation d'annulation d'abonnement
7. **Inactivity Reminder Email** - Réengagement utilisateurs inactifs

### Emails marketing (envoyés manuellement) :

8. **Newsletter** - Newsletters et annonces

## 🎯 Utilisation dans le code

### Envoyer un email transactionnel

\`\`\`typescript
import { sendEmail } from '@/lib/email/send';
import { getWelcomeEmailHtml } from '@/lib/email/templates/html/welcome.html';

const htmlContent = getWelcomeEmailHtml({
  userName: 'John Doe',
  dashboardUrl: 'https://promptor.app/dashboard',
});

await sendEmail({
  to: 'user@example.com',
  subject: 'Bienvenue sur Promptor !',
  htmlContent,
  tags: ['welcome', 'onboarding'],
});
\`\`\`

### Ajouter un contact à une liste

\`\`\`typescript
import { addToList } from '@/lib/email/audiences';

await addToList(
  parseInt(process.env.BREVO_LIST_ALL_USERS!),
  'user@example.com',
  {
    firstName: 'John',
    lastName: 'Doe',
    attributes: {
      PLAN: 'FREE',
      SIGNUP_DATE: new Date().toISOString(),
    },
  }
);
\`\`\`

### Synchroniser un utilisateur

\`\`\`typescript
import { syncUserToLists } from '@/lib/email/audiences';

await syncUserToLists({
  email: 'user@example.com',
  name: 'John Doe',
  plan: 'FREE',
});
\`\`\`

## 📈 Dashboard Brevo

Utilisez le dashboard Brevo pour :

- **Campaigns** : https://app.brevo.com/campaign/list/transac
  - Voir tous les emails envoyés
  - Statistiques d'ouverture, clics, bounces
  - Taux de délivrabilité

- **Contacts** : https://app.brevo.com/contact/list
  - Gérer vos listes
  - Voir les attributs de chaque contact
  - Exporter des données

- **Automation** : https://app.brevo.com/automation/list
  - Créer des workflows automatiques
  - Segmentation avancée
  - A/B testing

- **Statistics** : https://app.brevo.com/statistics/email
  - Voir vos quotas (300 emails/jour en gratuit)
  - Performance globale
  - Tendances d'envoi

## 🚨 Limitations du plan gratuit

Le plan gratuit Brevo inclut :

✅ 300 emails/jour (9,000/mois)
✅ Contacts illimités
✅ Listes illimitées
✅ API complète
✅ Statistiques basiques

❌ Pas d'A/B testing avancé
❌ Pas de priorité d'envoi
❌ Logo "Sent with Brevo" dans le footer (peut être retiré en payant)

## 💰 Plans payants

Si vous dépassez 300 emails/jour, passez à un plan payant :

- **Starter** : 25€/mois - 20,000 emails/mois
- **Business** : 65€/mois - 40,000 emails/mois
- **Enterprise** : Sur devis - Volume personnalisé

## 🔧 Troubleshooting

### Email non reçu ?

1. Vérifiez les spams/indésirables
2. Vérifiez que `BREVO_API_KEY` est correcte
3. Utilisez votre email de compte Brevo pour les tests
4. Vérifiez le dashboard Brevo > Campaigns pour voir si l'email est parti

### Erreur "401 Unauthorized" ?

- Votre clé API est invalide ou expirée
- Générez une nouvelle clé dans Settings > SMTP & API > API Keys

### Erreur "Could not authenticate you" ?

- Vérifiez que `BREVO_API_KEY` est bien définie dans `.env.local`
- Redémarrez votre serveur Next.js après modification

### Contact déjà existant ?

- Brevo met automatiquement à jour le contact existant
- Pas de doublon possible avec la même adresse email

## 📚 Ressources

- **Documentation Brevo** : https://developers.brevo.com/
- **API Reference** : https://developers.brevo.com/reference/getting-started-1
- **Support Brevo** : https://help.brevo.com/

## ✅ Checklist finale

Avant de déployer en production :

- [ ] Compte Brevo créé
- [ ] Clé API générée et configurée dans `.env.local`
- [ ] 5 listes créées et IDs notés
- [ ] Test d'envoi réussi (`npm run test:brevo`)
- [ ] (Optionnel) Domaine personnalisé vérifié
- [ ] Variables d'environnement ajoutées sur Vercel/production
- [ ] Dashboard Brevo consulté régulièrement pour suivre les quotas

---

🎉 **Bravo !** Votre système d'email est maintenant configuré et prêt pour la production !
