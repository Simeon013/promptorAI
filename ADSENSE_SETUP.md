# Configuration Google AdSense pour Promptor

Ce guide explique comment intégrer Google AdSense pour afficher des publicités aux utilisateurs avec le plan FREE.

## Prérequis

1. Un compte Google
2. Votre site doit être accessible publiquement (pas localhost)
3. Contenu suffisant sur le site (AdSense peut prendre quelques jours pour approuver)

## Étape 1: Créer un compte AdSense

1. Allez sur [https://www.google.com/adsense](https://www.google.com/adsense)
2. Cliquez sur "Commencer"
3. Connectez-vous avec votre compte Google
4. Remplissez les informations :
   - URL de votre site web (ex: https://promptor.app)
   - Pays/région
   - Conditions d'utilisation

## Étape 2: Ajouter votre site

1. Dans le tableau de bord AdSense, allez dans **Sites**
2. Cliquez sur **Ajouter un site**
3. Entrez l'URL de votre site
4. Suivez les instructions pour vérifier la propriété du site

Google va vérifier votre site. Cela peut prendre de quelques heures à quelques jours.

## Étape 3: Obtenir votre ID AdSense

Une fois approuvé :

1. Dans AdSense, allez dans **Comptes** > **Paramètres**
2. Cherchez votre **ID client AdSense** (format: `ca-pub-XXXXXXXXXXXXXXXX`)
3. Copiez cet ID

## Étape 4: Configurer dans Promptor

1. Ajoutez l'ID dans votre fichier `.env.local` :
   ```env
   NEXT_PUBLIC_GOOGLE_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```

2. Le script AdSense est déjà intégré dans le layout de l'application

## Étape 5: Créer des unités publicitaires (optionnel)

Pour plus de contrôle sur les publicités :

1. Dans AdSense, allez dans **Annonces** > **Par unité publicitaire**
2. Cliquez sur **Nouvelle unité publicitaire**
3. Choisissez le type :
   - **Display** : Bannières standards
   - **In-feed** : Publicités dans le flux de contenu
   - **In-article** : Publicités dans les articles
4. Configurez la taille et le style
5. Copiez l'**ID de l'emplacement publicitaire** (data-ad-slot)

### Utilisation dans le code

```tsx
import { AdBanner } from '@/components/ads/AdBanner';

// Utilisation basique (sans unité spécifique)
<AdBanner userPlan={userPlan} position="bottom" />

// Avec une unité publicitaire spécifique
<AdBanner
  userPlan={userPlan}
  position="bottom"
  adSlot="1234567890"  // Votre ID d'emplacement
/>
```

## Emplacements actuels des publicités

Les publicités sont affichées uniquement pour les utilisateurs avec le plan **FREE** :

1. **Page Editor** (`/editor`) - Bannière en bas après le résultat
2. **Dashboard** - Bannière d'upgrade en haut (pas AdSense, juste CTA)

## Types d'annonces supportées

Le composant `GoogleAdSense` supporte plusieurs formats :

- `auto` : Format automatique (recommandé)
- `fluid` : S'adapte au conteneur
- `rectangle` : Bannière rectangulaire
- `vertical` : Bannière verticale
- `horizontal` : Bannière horizontale

## Mode développement

En développement (localhost), les publicités ne s'affichent pas car AdSense nécessite un domaine public.

Si `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` n'est pas configuré, un message d'avertissement s'affiche à la place :
```
AdSense non configuré. Ajoutez NEXT_PUBLIC_GOOGLE_ADSENSE_ID dans .env.local
```

## Bonnes pratiques

1. **Ne pas trop en mettre** : 2-3 publicités maximum par page
2. **Placement stratégique** : Après le contenu principal, pas au milieu
3. **Responsive** : Les publicités s'adaptent automatiquement aux écrans
4. **Performance** : Le script AdSense est chargé de manière asynchrone
5. **Conformité** : Respectez les [règles du programme AdSense](https://support.google.com/adsense/answer/48182)

## Problèmes courants

### Les publicités ne s'affichent pas

1. Vérifiez que `NEXT_PUBLIC_GOOGLE_ADSENSE_ID` est bien configuré
2. Vérifiez que vous êtes sur un utilisateur FREE (pas STARTER/PRO)
3. Vérifiez que le site est accessible publiquement
4. Attendez quelques heures après la configuration initiale

### Erreur "AdSense account not approved"

Votre compte AdSense doit être approuvé par Google avant d'afficher des publicités. Cela peut prendre quelques jours.

### Publicités vides ou espaces blancs

C'est normal au début. AdSense a besoin de temps pour :
- Analyser votre contenu
- Trouver des annonceurs pertinents
- Optimiser les enchères

## Revenus

Les revenus AdSense dépendent de :
- **CTR (Click-Through Rate)** : Taux de clic sur les publicités
- **CPC (Cost Per Click)** : Prix par clic
- **Trafic** : Nombre de visiteurs
- **Niche** : Certains sujets paient plus (tech, finance, etc.)

Suivez vos revenus dans le tableau de bord AdSense.

## Support

- [Centre d'aide AdSense](https://support.google.com/adsense)
- [Forum de la communauté AdSense](https://support.google.com/adsense/community)
