# Configuration FedaPay pour Promptor

## 🇧🇯 Pourquoi FedaPay ?

FedaPay est la solution de paiement béninoise qui permet d'accepter :
- ✅ **Cartes bancaires internationales** : Visa, Mastercard (du monde entier)
- ✅ **Mobile Money** : MTN, Moov, Orange Money
- ✅ **Paiements en FCFA** (Franc CFA)
- ✅ **Support multi-devises** : USD, EUR, GBP

---

## 📋 Étapes de configuration

### 1. Créer un compte FedaPay

1. Allez sur **https://app.fedapay.com/signup**
2. Créez votre compte avec :
   - Email
   - Mot de passe
   - Nom/Prénom
   - Téléphone
3. Vérifiez votre email
4. Complétez votre profil KYC :
   - Pièce d'identité (passeport ou carte nationale béninoise)
   - Coordonnées bancaires (pour recevoir les paiements)
   - Adresse

### 2. Récupérer vos clés API

1. Allez dans **Paramètres** → **Développeurs** → **Clés API**
2. Copiez vos clés :
   - **Mode Sandbox (Test)** :
     - Secret Key : `sk_sandbox_...`
     - Public Key : `pk_sandbox_...`
   - **Mode Live (Production)** :
     - Secret Key : `sk_live_...`
     - Public Key : `pk_live_...`

### 3. Variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# FedaPay Configuration
FEDAPAY_SECRET_KEY=sk_sandbox_VOTRE_CLE_ICI  # Mode test
FEDAPAY_PUBLIC_KEY=pk_sandbox_VOTRE_CLE_ICI  # Mode test
FEDAPAY_ENVIRONMENT=sandbox                   # "sandbox" ou "live"

# Pour la production, changez vers:
# FEDAPAY_SECRET_KEY=sk_live_VOTRE_CLE_ICI
# FEDAPAY_PUBLIC_KEY=pk_live_VOTRE_CLE_ICI
# FEDAPAY_ENVIRONMENT=live
```

**Sur Vercel** :
1. Settings → Environment Variables
2. Ajoutez les 3 variables ci-dessus
3. Redéployez

---

## 💰 Tarification FedaPay

### Plans Promptor (en FCFA)

- **FREE** : Gratuit (10 prompts/mois)
- **STARTER** : 5000 FCFA/mois (~9 EUR) - 100 prompts/mois
- **PRO** : 17000 FCFA/mois (~29 EUR) - Prompts illimités

### Frais FedaPay

- **Cartes bancaires** : ~3-3.5% par transaction
- **Mobile Money** : ~2.5-3% par transaction
- **Pas de frais d'installation**
- **Pas d'abonnement mensuel**

### Exemple de calcul

Si un utilisateur paie 5000 FCFA pour le plan STARTER :
- Frais FedaPay : ~175 FCFA (3.5%)
- Vous recevez : ~4825 FCFA

---

## 🔗 Webhooks FedaPay

Les webhooks permettent à FedaPay de notifier votre application lors d'un paiement.

### Configuration

1. Allez dans **FedaPay Dashboard** → **Webhooks**
2. Ajoutez une URL de webhook :
   - **URL** : `https://votredomaine.vercel.app/api/fedapay/webhook`
   - **Événements** :
     - ✅ `transaction.approved` (paiement réussi)
     - ✅ `transaction.canceled` (paiement annulé)
     - ✅ `transaction.declined` (paiement refusé)
3. Sauvegardez

### Test en local

Pour tester les webhooks en développement local :

1. Installez **ngrok** : https://ngrok.com/download
2. Lancez votre serveur local : `npm run dev`
3. Exposez votre serveur :
   ```bash
   ngrok http 3000
   ```
4. Copiez l'URL ngrok (ex: `https://abc123.ngrok.io`)
5. Dans FedaPay, configurez le webhook avec :
   ```
   https://abc123.ngrok.io/api/fedapay/webhook
   ```
6. Testez un paiement

---

## 🧪 Mode Test (Sandbox)

FedaPay fournit des **cartes de test** pour tester les paiements sans argent réel.

### Cartes de test FedaPay

**Carte de test réussie** :
- Numéro : `4000 0000 0000 0002`
- CVC : `123`
- Expiration : N'importe quelle date future
- Nom : N'importe quel nom

**Carte de test échouée** :
- Numéro : `4000 0000 0000 0127`

### Mobile Money de test

Pour tester Mobile Money en sandbox :
1. Utilisez un numéro de test fourni par FedaPay
2. Validez avec le code OTP de test

---

## 🔄 Migration depuis Stripe

### Ce qui change

**Avant (Stripe)** :
- Paiements en EUR/USD
- Cartes uniquement
- Nécessite Stripe Atlas pour le Bénin ($500)

**Après (FedaPay)** :
- Paiements en FCFA (ou EUR/USD)
- Cartes + Mobile Money
- Disponible directement au Bénin (gratuit)

### Code modifié

1. ✅ **Route de checkout** : `/api/fedapay/create-checkout-session`
2. ✅ **Webhook** : `/api/fedapay/webhook`
3. ✅ **Configuration** : `lib/fedapay/fedapay.ts`

### Routes conservées (désactivées)

Les routes Stripe restent dans le code mais ne sont plus utilisées :
- `/api/stripe/create-checkout-session` (ancien)
- `/api/webhooks/stripe` (ancien)

---

## 🎨 Frontend : Bouton de paiement

Le bouton de paiement redirige maintenant vers FedaPay :

```typescript
// Avant (Stripe)
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  body: formData,
});

// Après (FedaPay)
const response = await fetch('/api/fedapay/create-checkout-session', {
  method: 'POST',
  body: formData,
});
```

---

## ✅ Checklist de mise en production

### Mode Test (Sandbox)

- [ ] Compte FedaPay créé
- [ ] Clés API sandbox récupérées
- [ ] Variables d'environnement configurées (`sandbox`)
- [ ] Webhook configuré (avec ngrok en local)
- [ ] Test de paiement par carte réussi
- [ ] Test de paiement Mobile Money réussi
- [ ] Vérification de la mise à jour Supabase

### Mode Production (Live)

- [ ] KYC validé sur FedaPay
- [ ] Coordonnées bancaires vérifiées
- [ ] Clés API live récupérées
- [ ] Variables d'environnement Vercel mises à jour (`live`)
- [ ] Webhook configuré avec URL de production
- [ ] Test de paiement réel (petite somme)
- [ ] Email de confirmation de paiement testé
- [ ] Monitoring activé

---

## 📊 Monitoring et Logs

### Logs FedaPay

Pour voir les paiements et transactions :
1. Dashboard FedaPay → **Transactions**
2. Filtrez par statut :
   - ✅ Approuvées
   - ⏳ En attente
   - ❌ Refusées

### Logs Vercel

Pour voir les webhooks reçus :
1. Vercel Dashboard → **Logs**
2. Cherchez `📨 FedaPay Webhook`

---

## 🆘 Support

**FedaPay Support** :
- Email : support@fedapay.com
- Documentation : https://docs.fedapay.com
- Dashboard : https://app.fedapay.com

**Problèmes courants** :

**1. Webhook non reçu**
- Vérifiez l'URL dans FedaPay Dashboard
- Vérifiez les logs Vercel
- Testez avec ngrok en local

**2. Paiement refusé**
- Vérifiez les fonds sur la carte de test
- Vérifiez que vous êtes en mode sandbox
- Consultez les logs FedaPay

**3. Utilisateur non mis à jour**
- Vérifiez les métadonnées de la transaction
- Vérifiez les logs du webhook
- Vérifiez la connexion Supabase

---

## 🚀 Prochaines étapes

1. **Créer votre compte FedaPay**
2. **Récupérer vos clés API**
3. **Configurer les variables d'environnement**
4. **Tester en mode sandbox**
5. **Déployer sur Vercel**
6. **Passer en mode live**

---

**Dernière mise à jour** : 10 décembre 2025
