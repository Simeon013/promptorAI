# Documentation Promptor

Bienvenue dans la documentation complète de Promptor, la plateforme SaaS de génération et amélioration de prompts IA.

## 📚 Index de la documentation

### 🚀 Démarrage rapide

- [README.md](../README.md) - Vue d'ensemble du projet et installation
- [DEVELOPMENT_STATUS.md](../DEVELOPMENT_STATUS.md) - État actuel du développement

### 🗄️ Base de données

- [SUPABASE_QUICK_SETUP.md](../SUPABASE_QUICK_SETUP.md) - Configuration rapide de Supabase
- [supabase/migrations/admin_tables.sql](../supabase/migrations/admin_tables.sql) - Migration tables admin

### 💳 Paiements

- [PHASE_3_SUMMARY.md](../PHASE_3_SUMMARY.md) - Intégration Stripe détaillée
- [STRIPE_WEBHOOKS_LOCAL.md](../STRIPE_WEBHOOKS_LOCAL.md) - Configuration webhooks en local

### 🔧 Interface Admin

- [ADMIN_INTERFACE.md](./ADMIN_INTERFACE.md) - Documentation complète de l'interface admin
- [ADMIN_SETUP.md](./ADMIN_SETUP.md) - Guide d'installation de l'interface admin

### 📦 Archives

- [archives/MIGRATION.md](./archives/MIGRATION.md) - Migration Vite → Next.js
- [archives/CLEANUP_REPORT.md](./archives/CLEANUP_REPORT.md) - Rapport de nettoyage
- [archives/STRUCTURE.md](./archives/STRUCTURE.md) - Structure du projet

---

## 🎯 Par cas d'usage

### Je veux installer le projet

1. Lire le [README.md](../README.md) principal
2. Configurer Supabase avec [SUPABASE_QUICK_SETUP.md](../SUPABASE_QUICK_SETUP.md)
3. Configurer Stripe avec [PHASE_3_SUMMARY.md](../PHASE_3_SUMMARY.md)
4. Installer l'interface admin avec [ADMIN_SETUP.md](./ADMIN_SETUP.md)

### Je veux comprendre l'architecture

1. Consulter [DEVELOPMENT_STATUS.md](../DEVELOPMENT_STATUS.md) pour l'état actuel
2. Lire [ADMIN_INTERFACE.md](./ADMIN_INTERFACE.md) pour l'interface admin
3. Explorer la [structure du projet](../README.md#structure-du-projet)

### Je veux développer localement

1. Suivre le [README.md](../README.md) pour l'installation
2. Configurer les webhooks Stripe avec [STRIPE_WEBHOOKS_LOCAL.md](../STRIPE_WEBHOOKS_LOCAL.md)
3. Créer les tables admin avec [admin_tables.sql](../supabase/migrations/admin_tables.sql)

### Je veux déployer en production

1. Vérifier le [DEVELOPMENT_STATUS.md](../DEVELOPMENT_STATUS.md)
2. Suivre la [checklist de production](./ADMIN_INTERFACE.md#-checklist-de-production)
3. Activer RLS sur Supabase (voir [ADMIN_SETUP.md](./ADMIN_SETUP.md))

---

## 🔍 Documentation par fonctionnalité

### Authentification (Clerk)

- Configuration : [README.md](../README.md#-authentification-clerk)
- Synchronisation users : [lib/auth/supabase-clerk.ts](../lib/auth/supabase-clerk.ts)
- Callback URL : [app/api/auth/callback/route.ts](../app/api/auth/callback/route.ts)

### Base de données (Supabase)

- Setup : [SUPABASE_QUICK_SETUP.md](../SUPABASE_QUICK_SETUP.md)
- Client : [lib/db/supabase.ts](../lib/db/supabase.ts)
- Schéma users : Table `users` avec quotas
- Schéma prompts : Table `prompts` avec historique

### Paiements (Stripe)

- Configuration : [PHASE_3_SUMMARY.md](../PHASE_3_SUMMARY.md)
- Webhooks : [app/api/webhooks/stripe/route.ts](../app/api/webhooks/stripe/route.ts)
- Checkout : [app/api/stripe/create-checkout-session/route.ts](../app/api/stripe/create-checkout-session/route.ts)

### IA (Google Gemini)

- Service : [lib/ai/gemini.ts](../lib/ai/gemini.ts)
- API génération : [app/api/generate/route.ts](../app/api/generate/route.ts)
- API suggestions : [app/api/suggestions/route.ts](../app/api/suggestions/route.ts)

### Interface Admin

- Documentation complète : [ADMIN_INTERFACE.md](./ADMIN_INTERFACE.md)
- Installation : [ADMIN_SETUP.md](./ADMIN_SETUP.md)
- Configuration admins : [lib/auth/admin.ts](../lib/auth/admin.ts)

---

## 📖 Guides thématiques

### Configuration

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Installation et configuration initiale |
| [SUPABASE_QUICK_SETUP.md](../SUPABASE_QUICK_SETUP.md) | Setup base de données |
| [ADMIN_SETUP.md](./ADMIN_SETUP.md) | Installation interface admin |

### Développement

| Document | Description |
|----------|-------------|
| [DEVELOPMENT_STATUS.md](../DEVELOPMENT_STATUS.md) | État du développement |
| [STRIPE_WEBHOOKS_LOCAL.md](../STRIPE_WEBHOOKS_LOCAL.md) | Webhooks en local |
| [ADMIN_INTERFACE.md](./ADMIN_INTERFACE.md) | Référence interface admin |

### Architecture

| Document | Description |
|----------|-------------|
| [PHASE_3_SUMMARY.md](../PHASE_3_SUMMARY.md) | Architecture Stripe |
| [ADMIN_INTERFACE.md](./ADMIN_INTERFACE.md) | Architecture interface admin |
| [archives/STRUCTURE.md](./archives/STRUCTURE.md) | Structure du projet |

---

## 🆘 Dépannage

### Problèmes courants

| Problème | Solution | Documentation |
|----------|----------|---------------|
| Erreur auth Clerk | Vérifier `.env.local` | [README.md](../README.md) |
| Erreur connexion Supabase | Vérifier credentials | [SUPABASE_QUICK_SETUP.md](../SUPABASE_QUICK_SETUP.md) |
| Webhooks Stripe | Utiliser CLI locale | [STRIPE_WEBHOOKS_LOCAL.md](../STRIPE_WEBHOOKS_LOCAL.md) |
| Accès admin refusé | Vérifier `ADMIN_EMAILS` | [ADMIN_SETUP.md](./ADMIN_SETUP.md) |

### Support

Pour toute question ou problème :

1. Consulter la documentation appropriée ci-dessus
2. Vérifier les logs dans le terminal
3. Consulter les logs Supabase dans le dashboard
4. Consulter les Network requests (F12 → Network)

---

## 📝 Contribution

Si vous ajoutez de nouvelles fonctionnalités :

1. Mettre à jour [DEVELOPMENT_STATUS.md](../DEVELOPMENT_STATUS.md)
2. Documenter les nouvelles routes API
3. Ajouter les migrations SQL si nécessaire
4. Mettre à jour ce fichier README.md

---

## 🗂️ Structure de la documentation

```
docs/
├── README.md                  # Ce fichier - Index de la documentation
├── ADMIN_INTERFACE.md         # Documentation interface admin
├── ADMIN_SETUP.md            # Guide d'installation admin
└── archives/                 # Documentation historique
    ├── MIGRATION.md
    ├── CLEANUP_REPORT.md
    └── STRUCTURE.md

Racine du projet:
├── README.md                  # Vue d'ensemble projet
├── DEVELOPMENT_STATUS.md      # État du développement
├── SUPABASE_QUICK_SETUP.md   # Setup Supabase
├── PHASE_3_SUMMARY.md        # Intégration Stripe
└── STRIPE_WEBHOOKS_LOCAL.md  # Webhooks locaux
```

---

## 🔄 Versions

| Version | Date | Changements majeurs |
|---------|------|---------------------|
| 1.1.0 | 22 Nov 2025 | Interface admin complète |
| 1.0.0 | 20 Nov 2025 | Phases 1-4 complètes |
| 0.5.0 | 15 Nov 2025 | Migration Next.js 15 |

---

**Maintenu par** : L'équipe Promptor
**Dernière mise à jour** : 22 Novembre 2025
