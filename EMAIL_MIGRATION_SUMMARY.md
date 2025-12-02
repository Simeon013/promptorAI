# 📧 Migration Email : Resend → Brevo

## ✅ Migration complète terminée (2 janvier 2025)

### Pourquoi Brevo ?

✅ **3x plus d'emails gratuits** : 300/jour vs 100/jour
✅ **Pas de domaine requis** : Fonctionne immédiatement avec `@smtp-brevo.com`
✅ **Meilleur marketing** : Segmentation, workflows, analytics avancés
✅ **Contacts illimités** : Pas de limite sur les listes

---

## 📦 Changements techniques

### Packages
- ❌ Désinstallé : `resend`, `react-email`, `@react-email/components`
- ✅ Installé : `@getbrevo/brevo` (v3.0.1)

### Code modifié
- `lib/email/brevo.ts` - Nouveau client Brevo
- `lib/email/send.ts` - Adapté pour Brevo API
- `lib/email/audiences.ts` - Renommé audiences → lists
- 8 templates HTML créés (remplacent React Email)
- 4 API routes mises à jour (auth/callback, contact, webhooks/stripe, marketing)

### Variables d'environnement

**Avant (.env.local)** :
```bash
RESEND_API_KEY=re_...
RESEND_AUDIENCE_ALL_USERS=aud_...
# ... etc
```

**Après (.env.local)** :
```bash
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=votre.email@example.com
BREVO_LIST_ALL_USERS=1
BREVO_LIST_FREE_USERS=2
BREVO_LIST_PRO_USERS=3
BREVO_LIST_NEWSLETTER=4
BREVO_LIST_INACTIVE_USERS=5
```

---

## 🚀 Configuration rapide (5 minutes)

### 1. Créer un compte Brevo
👉 https://www.brevo.com → Sign up free

### 2. Générer une clé API
1. Settings ⚙️ → SMTP & API → API Keys
2. Generate a new API key
3. Copiez la clé (format: `xkeysib-...`)

### 3. Créer 5 listes
Contacts → Lists → Créer :
- `All Users` (notez l'ID, ex: 1)
- `Free Users` (ex: 2)
- `Pro Users` (ex: 3)
- `Newsletter` (ex: 4)
- `Inactive Users` (ex: 5)

### 4. Configurer `.env.local`
```bash
BREVO_API_KEY=xkeysib-votre_clé_ici
BREVO_SENDER_EMAIL=votre.email@example.com
BREVO_LIST_ALL_USERS=1
BREVO_LIST_FREE_USERS=2
BREVO_LIST_PRO_USERS=3
BREVO_LIST_NEWSLETTER=4
BREVO_LIST_INACTIVE_USERS=5
```

### 5. Tester
```bash
npm run test:brevo votre.email@example.com
```

✅ Si vous voyez "EMAIL ENVOYÉ AVEC SUCCÈS !", c'est bon ! 🎉

---

## 📚 Documentation complète

- **Guide de configuration** : [BREVO_SETUP.md](BREVO_SETUP.md)
- **Détails de la migration** : [BREVO_MIGRATION.md](BREVO_MIGRATION.md)
- **Configuration projet** : [CLAUDE.md](CLAUDE.md) (section Service Layer)

---

## 🎯 Fonctionnalités

### 8 emails transactionnels automatiques
1. 👋 Welcome (inscription)
2. 💳 Payment success (paiement)
3. 📧 Contact received (formulaire contact)
4. ⚠️ Quota reminder (80% quota)
5. 🚫 Quota exceeded (100% quota)
6. ❌ Subscription cancelled (annulation)
7. 😴 Inactivity reminder (réengagement)
8. 📰 Newsletter (marketing)

### Gestion des contacts
- Ajout automatique à la liste "All Users"
- Segmentation par plan (FREE vs PRO)
- Attributs personnalisés (PLAN, QUOTA_USED, etc.)
- Mise à jour automatique lors des changements de plan

---

## 💰 Coûts

**Plan gratuit** (actuel) :
- ✅ 300 emails/jour (9,000/mois)
- ✅ Contacts illimités
- ✅ Toutes les fonctionnalités API
- ⚠️ Footer "Sent with Brevo"

**Plans payants** (si besoin) :
- Starter : 25€/mois (20,000 emails/mois)
- Business : 65€/mois (40,000 emails/mois)

---

## 🔧 Troubleshooting

**Email non reçu ?**
→ Vérifiez spams + dashboard Brevo

**Erreur "401 Unauthorized" ?**
→ Vérifiez `BREVO_API_KEY` dans `.env.local`

**Contact déjà existant ?**
→ Normal, Brevo met à jour automatiquement

---

## ✅ Checklist de déploiement

Production (Vercel) :

- [ ] Compte Brevo créé
- [ ] Clé API générée
- [ ] 5 listes créées
- [ ] Test local réussi (`npm run test:brevo`)
- [ ] Variables Brevo ajoutées sur Vercel
- [ ] (Optionnel) Domaine personnalisé vérifié

**Statut** : ✅ Prêt pour la production !

---

🎉 **C'est tout !** Le système d'email fonctionne maintenant avec Brevo.
