# 🔐 Configuration Clerk Authentication

## Étape 1 : Créer un compte Clerk

1. Allez sur [https://clerk.com](https://clerk.com)
2. Cliquez sur "Start building for free"
3. Créez un compte (GitHub, Google, ou email)
4. Créez une nouvelle application
   - **Name**: `Promptor`
   - **Sign in methods**: Email + Google (recommandé)

## Étape 2 : Récupérer les clés API

1. Dans votre dashboard Clerk, allez dans **API Keys**
2. Copiez les deux clés :
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (commence par `pk_test_` ou `pk_live_`)
   - `CLERK_SECRET_KEY` (commence par `sk_test_` ou `sk_live_`)

## Étape 3 : Configurer .env.local

Ajoutez les clés dans `.env.local` :

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

## Étape 4 : Configurer les URL de redirection

Dans le dashboard Clerk, allez dans **Paths** :

### Development (localhost)
```
Home URL: http://localhost:3000
Sign in URL: http://localhost:3000/sign-in
Sign up URL: http://localhost:3000/sign-up
After sign in URL: http://localhost:3000
After sign up URL: http://localhost:3000
```

### Production (une fois déployé)
```
Home URL: https://promptor.app
Sign in URL: https://promptor.app/sign-in
Sign up URL: https://promptor.app/sign-up
After sign in URL: https://promptor.app
After sign up URL: https://promptor.app
```

## Étape 5 : Activer les méthodes de connexion

Dans **User & Authentication** > **Email, Phone, Username** :

1. ✅ **Email address** - Activé (requis)
2. ✅ **Password** - Activé
3. (Optionnel) **Phone number** - Pour 2FA

Dans **Social Connections** :
1. ✅ **Google** - Recommandé
2. (Optionnel) **GitHub** - Pour les développeurs
3. (Optionnel) **Microsoft** - Pour les entreprises

## Étape 6 : Personnaliser l'interface

Dans **Customization** > **Theme** :

```json
{
  "general": {
    "color": "#3b82f6",
    "font_family": "Inter, system-ui, sans-serif",
    "border_radius": "0.5rem"
  }
}
```

## Étape 7 : Tester l'authentification

1. Redémarrez votre serveur de développement :
   ```bash
   npm run dev
   ```

2. Allez sur http://localhost:3000

3. Cliquez sur "Sign In" ou "Sign Up"

4. Créez un compte test

5. Vérifiez que vous êtes redirigé vers la page d'accueil

## Configuration des Webhooks (Optionnel mais recommandé)

Les webhooks permettent de synchroniser les utilisateurs Clerk avec votre database.

### 1. Créer un endpoint webhook

Créez `app/api/webhooks/clerk/route.ts` :

```typescript
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await prisma.user.create({
      data: {
        id,
        email: email_addresses[0]?.email_address ?? '',
        name: `${first_name ?? ''} ${last_name ?? ''}`.trim() || null,
        avatar: image_url,
        plan: 'FREE',
        quotaUsed: 0,
        quotaLimit: 10,
      },
    });
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await prisma.user.update({
      where: { id },
      data: {
        email: email_addresses[0]?.email_address ?? '',
        name: `${first_name ?? ''} ${last_name ?? ''}`.trim() || null,
        avatar: image_url,
      },
    });
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    await prisma.user.delete({ where: { id: id! } });
  }

  return new Response('Webhook received', { status: 200 });
}
```

### 2. Configurer le webhook dans Clerk

1. Allez dans **Webhooks** dans le dashboard Clerk
2. Cliquez sur "Add Endpoint"
3. Pour le développement, utilisez [ngrok](https://ngrok.com) :
   ```bash
   ngrok http 3000
   ```
4. Endpoint URL: `https://YOUR-NGROK-URL.ngrok.io/api/webhooks/clerk`
5. Sélectionnez les événements :
   - `user.created`
   - `user.updated`
   - `user.deleted`
6. Copiez le **Signing Secret**
7. Ajoutez-le dans `.env.local` :
   ```env
   CLERK_WEBHOOK_SECRET="whsec_..."
   ```

## Troubleshooting

### Erreur: "Clerk: Missing publishableKey"
- Vérifiez que `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` est dans `.env.local`
- Redémarrez le serveur après avoir modifié `.env.local`

### Erreur: "Redirect loop"
- Vérifiez la configuration des URLs dans Clerk Dashboard > Paths
- Assurez-vous que le middleware est correctement configuré

### L'utilisateur n'est pas créé dans la database
- Activez les webhooks (voir ci-dessus)
- Ou utilisez `getOrCreateUser()` dans vos API routes

## Liens Utiles

- [Documentation Clerk](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Dashboard](https://dashboard.clerk.com)
