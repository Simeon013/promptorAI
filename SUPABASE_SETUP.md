# 🗄️ Configuration Supabase PostgreSQL

## Étape 1 : Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Connectez-vous avec GitHub
4. Cliquez sur "New Project"
5. Remplissez :
   - **Name**: `promptor`
   - **Database Password**: (générez un mot de passe fort et **sauvegardez-le**)
   - **Region**: Choisissez la région la plus proche de vos utilisateurs
6. Cliquez sur "Create new project" (⏱️ ~2 minutes)

## Étape 2 : Récupérer la Connection String

1. Dans votre projet Supabase, allez dans **Settings** (icône d'engrenage)
2. Cliquez sur **Database** dans le menu latéral
3. Scrollez jusqu'à "Connection string"
4. Sélectionnez **URI** (pas Session mode)
5. Copiez la connection string qui ressemble à :
   ```
   postgresql://postgres.xxxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
6. Remplacez `[YOUR-PASSWORD]` par votre mot de passe de database

## Étape 3 : Configurer .env.local

Ajoutez la connection string dans votre `.env.local` :

```env
# Database
DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Clerk (obtenez sur clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Gemini
GEMINI_API_KEY="votre_cle_gemini"
```

## Étape 4 : Initialiser Prisma

```bash
# Pousser le schéma vers Supabase
npm run db:push

# Vérifier que ça fonctionne
npm run db:studio
```

Prisma Studio s'ouvrira sur http://localhost:5555 et vous pourrez voir vos tables !

## Étape 5 : Tester la connexion

Créez un fichier de test :

```typescript
// test-db.ts
import { prisma } from './lib/db/prisma';

async function testConnection() {
  try {
    const users = await prisma.user.findMany();
    console.log('✅ Database connected!', users);
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

Exécutez :
```bash
npx ts-node test-db.ts
```

## Troubleshooting

### Erreur: "Can't reach database server"
- Vérifiez que votre DATABASE_URL est correcte
- Assurez-vous que le mot de passe ne contient pas de caractères spéciaux non-encodés
- Essayez de ping la database depuis Settings > Database > Connection pooler

### Erreur: "SSL connection required"
Ajoutez `?sslmode=require` à la fin de votre DATABASE_URL :
```
DATABASE_URL="postgresql://...?sslmode=require"
```

### Erreur: "Too many connections"
Utilisez le connection pooler au lieu de la direct connection :
- Port `6543` (pooler) au lieu de `5432` (direct)

## Étapes Suivantes

Une fois Supabase configuré :

1. ✅ Les utilisateurs seront automatiquement créés lors de leur première connexion Clerk
2. ✅ Les prompts seront sauvegardés dans la database
3. ✅ Les quotas seront trackés en temps réel
4. ✅ L'historique sera persistant

## Liens Utiles

- [Documentation Supabase](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Supabase Dashboard](https://supabase.com/dashboard)
