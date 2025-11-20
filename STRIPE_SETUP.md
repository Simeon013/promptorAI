# Configuration Stripe - Promptor

## Étape 1 : Créer un compte Stripe

1. Allez sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Créez votre compte Stripe
3. **Activez le mode Test** (toggle en haut à droite)

---

## Étape 2 : Créer les Produits et Prix

### 1. Plan STARTER (9€/mois)

1. Allez dans **Produits** → **Ajouter un produit**
2. Remplissez :
   - **Nom** : Promptor Starter
   - **Description** : 100 prompts/mois, 30 jours d'historique, accès API
3. **Prix** :
   - Type : **Récurrent**
   - Prix : **9.00** EUR
   - Période de facturation : **Mensuelle**
4. Cliquez sur **Enregistrer le produit**
5. **Copiez l'ID du prix** (commence par `price_...`)
   - Exemple : `price_1QGxyz...`

### 2. Plan PRO (29€/mois)

1. **Produits** → **Ajouter un produit**
2. Remplissez :
   - **Nom** : Promptor Pro
   - **Description** : Prompts illimités, tous les modèles IA, 5 workspaces
3. **Prix** :
   - Type : **Récurrent**
   - Prix : **29.00** EUR
   - Période de facturation : **Mensuelle**
4. Cliquez sur **Enregistrer le produit**
5. **Copiez l'ID du prix** (commence par `price_...`)

---

## Étape 3 : Récupérer les Clés API

### 1. Clés API

1. Allez dans **Développeurs** → **Clés API**
2. En mode **Test**, vous verrez :
   - **Clé publique** (commence par `pk_test_...`)
   - **Clé secrète** (commence par `sk_test_...`)
3. Copiez ces deux clés

### 2. Ajouter les clés dans `.env.local`

```env
# Stripe (Mode Test)
STRIPE_SECRET_KEY=sk_test_VotreCleSecrete...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VotreClePublique...

# Prix des plans (IDs copiés précédemment)
STRIPE_PRICE_STARTER=price_1QGxyz...
STRIPE_PRICE_PRO=price_1QGabc...
```

---

## Étape 4 : Configurer le Webhook (Plus tard)

Nous configurerons le webhook après avoir créé la route `/api/webhooks/stripe`.

**Pour l'instant, ignorez cette étape.**

---

## Étape 5 : Tester avec des Cartes de Test

Stripe fournit des numéros de carte pour tester :

### Cartes qui fonctionnent :
- **Succès** : `4242 4242 4242 4242`
- **Succès (3D Secure)** : `4000 0027 6000 3184`

### Cartes qui échouent :
- **Carte refusée** : `4000 0000 0000 0002`
- **Fonds insuffisants** : `4000 0000 0000 9995`

**Détails à utiliser :**
- **Date d'expiration** : N'importe quelle date future (ex: 12/34)
- **CVC** : N'importe quel 3 chiffres (ex: 123)
- **Code postal** : N'importe quel (ex: 75001)

---

## Résumé des Variables d'Environnement

Après configuration, votre `.env.local` devrait contenir :

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_WEBHOOK_SECRET=whsec_... (à ajouter plus tard)
```

---

## ✅ Checklist

- [ ] Compte Stripe créé (mode Test activé)
- [ ] Produit "Promptor Starter" créé (9€/mois)
- [ ] Produit "Promptor Pro" créé (29€/mois)
- [ ] IDs des prix copiés
- [ ] Clés API copiées
- [ ] Variables ajoutées dans `.env.local`

---

**Une fois terminé, revenez me voir et nous continuerons avec la page Pricing !** 🚀
