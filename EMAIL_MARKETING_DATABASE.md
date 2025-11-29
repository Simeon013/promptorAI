# Configuration Base de Données - Email Marketing

Guide pour configurer les tables Supabase nécessaires au système d'email marketing, contact, feedback et bug reports.

---

## 📋 Tables créées

### 1. **email_campaigns**
Gère les campagnes marketing (newsletters, promotions, annonces).

**Champs principaux** :
- `name`, `subject` : Nom et sujet de la campagne
- `template_name` : Type de template (`newsletter`, `promotion`, `announcement`, `re-engagement`)
- `template_data` : Props dynamiques du template (JSONB)
- `audience_id` : ID de l'audience Resend (optionnel)
- `status` : État (`draft`, `scheduled`, `sending`, `sent`, `failed`)
- `scheduled_at`, `sent_at` : Dates de planification et envoi
- `opens`, `clicks`, `bounces` : Analytics

**Cas d'usage** :
```typescript
// Créer une campagne newsletter
const { data, error } = await supabase
  .from('email_campaigns')
  .insert({
    name: 'Newsletter Décembre 2025',
    subject: '📬 Les nouveautés du mois',
    template_name: 'newsletter',
    template_data: {
      title: 'Newsletter Promptor - Décembre 2025',
      content: [
        {
          heading: '🚀 Nouvelle fonctionnalité',
          text: 'Découvrez notre dernière innovation...',
          link: { url: '/dashboard', label: 'En savoir plus' }
        }
      ]
    },
    audience_id: 'aud_newsletter_123',
    status: 'scheduled',
    scheduled_at: '2025-12-01T10:00:00Z'
  });
```

---

### 2. **contacts**
Stocke les soumissions du formulaire de contact.

**Champs principaux** :
- `user_id` : ID utilisateur (si authentifié)
- `name`, `email`, `subject`, `message` : Détails du contact
- `status` : État (`new`, `in_progress`, `resolved`)
- `assigned_to` : ID admin assigné
- `response`, `responded_at`, `responded_by` : Réponse admin

**Cas d'usage** :
```typescript
// Créer un message de contact
const { data, error } = await supabase
  .from('contacts')
  .insert({
    user_id: userId, // optionnel
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question sur le plan Pro',
    message: 'Je voudrais savoir si...',
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });
```

---

### 3. **feedback**
Gère les retours utilisateurs (feature requests, améliorations, etc.).

**Champs principaux** :
- `user_id` : ID utilisateur
- `type` : Type (`feature_request`, `improvement`, `praise`, `other`)
- `category` : Catégorie (`ui`, `ai`, `performance`, etc.)
- `title`, `description` : Détails du feedback
- `rating` : Note 1-5 étoiles (optionnel)
- `status` : État (`submitted`, `reviewing`, `planned`, `implemented`, `rejected`)
- `priority` : Priorité (`low`, `medium`, `high`, `critical`)

**Cas d'usage** :
```typescript
// Soumettre un feedback
const { data, error } = await supabase
  .from('feedback')
  .insert({
    user_id: userId,
    type: 'feature_request',
    category: 'ai',
    title: 'Support pour GPT-4',
    description: 'J\'aimerais pouvoir utiliser GPT-4 pour...',
    rating: 5,
    page_url: window.location.href,
    browser_info: {
      browser: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`
    }
  });
```

---

### 4. **bug_reports**
Système de tracking de bugs.

**Champs principaux** :
- `user_id` : ID utilisateur
- `title`, `description` : Détails du bug
- `steps_to_reproduce`, `expected_behavior`, `actual_behavior` : Reproduction
- `severity` : Sévérité (`low`, `medium`, `high`, `critical`)
- `status` : État (`open`, `investigating`, `in_progress`, `fixed`, `wont_fix`)
- `browser`, `os`, `screen_resolution` : Infos techniques
- `error_message`, `stack_trace`, `console_logs` : Debug
- `screenshot_url` : Capture d'écran (optionnel)

**Cas d'usage** :
```typescript
// Signaler un bug
const { data, error } = await supabase
  .from('bug_reports')
  .insert({
    user_id: userId,
    title: 'Erreur lors de la génération',
    description: 'Le bouton "Générer" ne fonctionne pas',
    steps_to_reproduce: '1. Aller sur /editor\n2. Cliquer sur Générer\n3. Erreur',
    expected_behavior: 'Le prompt devrait être généré',
    actual_behavior: 'Erreur 500',
    severity: 'high',
    browser: 'Chrome 120',
    os: 'Windows 11',
    error_message: 'Failed to fetch',
    page_url: '/editor'
  });
```

---

### 5. **newsletters**
Archive des newsletters publiées.

**Champs principaux** :
- `campaign_id` : Référence à la campagne email
- `title`, `content` : Contenu de la newsletter
- `status` : État (`draft`, `published`)
- `archive_url` : URL de l'archive web (optionnel)
- `recipients`, `opens`, `clicks` : Analytics

**Cas d'usage** :
```typescript
// Publier une newsletter
const { data, error } = await supabase
  .from('newsletters')
  .insert({
    campaign_id: campaignId,
    title: 'Newsletter Décembre 2025',
    content: {
      sections: [
        { heading: 'Nouveautés', text: '...' },
        { heading: 'Tips', text: '...' }
      ]
    },
    status: 'published',
    published_at: new Date().toISOString(),
    published_by: adminId,
    recipients: 1250
  });
```

---

## 🚀 Appliquer la migration

### Option 1 : Via Supabase Dashboard (recommandé)

1. Aller sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet **Promptor**
3. Aller dans **SQL Editor** (menu de gauche)
4. Créer une **New query**
5. Copier-coller le contenu de `supabase/migrations/004_email_marketing_tables.sql`
6. Cliquer sur **Run**
7. Vérifier dans **Table Editor** que les 5 tables sont créées

### Option 2 : Via CLI Supabase (local)

```bash
# Se connecter à Supabase
npx supabase login

# Lier le projet
npx supabase link --project-ref your-project-ref

# Appliquer la migration
npx supabase db push
```

---

## ✅ Vérification

Après avoir appliqué la migration, vérifier que les tables existent :

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'email_campaigns',
    'contacts',
    'feedback',
    'bug_reports',
    'newsletters'
  );
```

Vous devriez voir les 5 tables.

---

## 🔐 Row-Level Security (RLS)

**Important** : Par défaut, RLS est **désactivé** sur ces tables (comme pour le reste de l'app).

L'authentification et les permissions sont gérées côté serveur via **Clerk** et les **API Routes**.

Si vous souhaitez activer RLS plus tard, voir [SUPABASE_QUICK_SETUP.md](SUPABASE_QUICK_SETUP.md).

---

## 📊 Requêtes utiles

### Récupérer les contacts non traités
```sql
SELECT * FROM contacts
WHERE status = 'new'
ORDER BY created_at DESC;
```

### Récupérer les bugs critiques
```sql
SELECT * FROM bug_reports
WHERE severity = 'critical'
  AND status IN ('open', 'investigating')
ORDER BY created_at DESC;
```

### Statistiques des campagnes
```sql
SELECT
  name,
  status,
  recipient_count,
  opens,
  clicks,
  ROUND((opens::float / NULLIF(recipient_count, 0)) * 100, 2) as open_rate,
  ROUND((clicks::float / NULLIF(opens, 0)) * 100, 2) as click_through_rate
FROM email_campaigns
WHERE status = 'sent'
ORDER BY sent_at DESC;
```

### Feedback par catégorie
```sql
SELECT
  category,
  COUNT(*) as count,
  AVG(rating) as avg_rating
FROM feedback
WHERE rating IS NOT NULL
GROUP BY category
ORDER BY count DESC;
```

---

## 🎯 Prochaines étapes

1. ✅ Appliquer la migration Supabase
2. 🔄 Créer les API routes pour ces tables
3. 🔄 Créer l'interface admin `/admin/marketing`
4. 🔄 Créer les formulaires Contact, Feedback, Bug Report
5. 🔄 Tester le système complet

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [SUPABASE_QUICK_SETUP.md](SUPABASE_QUICK_SETUP.md) - Setup initial
- [RESEND_SETUP.md](RESEND_SETUP.md) - Configuration Resend

---

**✨ Votre base de données est maintenant prête pour le système d'email marketing complet !**
