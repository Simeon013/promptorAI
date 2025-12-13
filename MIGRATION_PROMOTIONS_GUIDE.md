# Guide : Exécuter la Migration Promotions

## ⚠️ IMPORTANT : Migration Requise

Pour utiliser le système de promotions, vous devez d'abord créer les tables dans Supabase.

---

## 📋 Étape par Étape

### Méthode 1 : Via Supabase Dashboard (Recommandé)

#### 1. Ouvrir le SQL Editor

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **Promptor**
3. Dans le menu de gauche, cliquez sur **SQL Editor**
4. Cliquez sur **New Query**

#### 2. Copier le Script SQL

Ouvrez le fichier `supabase/migrations/004_pack_promotions_and_currencies.sql` et copiez **TOUT son contenu** (environ 330 lignes).

#### 3. Exécuter le Script

1. Collez le contenu dans l'éditeur SQL
2. Cliquez sur le bouton **Run** (en bas à droite)
3. Attendez quelques secondes
4. Vous devriez voir : ✅ **Success. No rows returned**

#### 4. Vérifier que ça a Fonctionné

1. Dans le menu de gauche, cliquez sur **Table Editor**
2. Vous devriez voir ces nouvelles tables :
   - ✅ `pack_promotions`
   - ✅ `pack_promotion_uses`
   - ✅ `currency_rates`
3. Cliquez sur `currency_rates` → vous devriez voir 3 lignes (XOF, EUR, USD)

---

### Méthode 2 : Via Ligne de Commande (Avancé)

Si vous avez Supabase CLI installé :

```bash
# Depuis le dossier du projet
cd c:\Projects\Pro\promptor

# Exécuter la migration
supabase db push
```

---

## ✅ Après la Migration

### 1. Recharger la Page Admin

Allez sur : http://localhost:3000/admin

Vous devriez maintenant voir dans le menu :
- Dashboard
- Crédits - Vue
- Crédits - Packs
- **Crédits - Promos** ← NOUVEAU !
- Utilisateurs
- ...

### 2. Accéder aux Promotions

Cliquez sur **"Crédits - Promos"** dans le menu.

Vous verrez :
- Page vide avec le message "Aucune promotion créée"
- Bouton vert **"+ Nouvelle Promotion"**

### 3. Créer Votre Première Promotion

Cliquez sur **"+ Nouvelle Promotion"** et testez avec :

**Exemple Simple** :

```
Nom : Promo Test
Description : Réduction de 20% pour tester

Packs ciblés :
☑️ Tous les packs

Réduction :
Type : Pourcentage
Valeur : 20

Période :
Début : 2025-12-13 00:00
Fin : 2025-12-31 23:59

Limites :
Utilisations max : (vide)
Max par utilisateur : 1

Affichage :
☑️ Afficher sur la page pricing
Texte du badge : -20%
Couleur : Rouge
```

Cliquez sur **"Créer"**

### 4. Vérifier sur la Page Pricing

Allez sur : http://localhost:3000/pricing

Vous devriez voir :
- Badge rouge **"-20%"** en haut à gauche de chaque pack
- Prix original barré : ~~1000 FCFA~~
- Prix réduit : **800 FCFA**
- Badge vert : "Économisez 200 FCFA"

---

## 🔧 Dépannage

### Erreur : "relation pack_promotions does not exist"

➡️ La migration n'a pas été exécutée. Recommencez l'étape 1.

### Erreur : "duplicate key value violates unique constraint"

➡️ La migration a déjà été exécutée. Tout est OK !

### La page Promotions est vide

➡️ Normal ! Cliquez sur "+ Nouvelle Promotion" pour créer votre première promo.

### Les promotions n'apparaissent pas sur /pricing

Vérifiez :
1. La promotion est **active** (switch vert dans la liste)
2. La date de **début** est dans le passé
3. La date de **fin** est dans le futur
4. Le switch **"Afficher sur la page pricing"** est coché

---

## 📊 Qu'est-ce qui a été créé ?

### Tables Supabase

**`pack_promotions`** :
- Stocke toutes les promotions (actives et inactives)
- Champs : nom, description, type de réduction, période, limites, affichage

**`pack_promotion_uses`** :
- Suivi des utilisations par utilisateur
- Empêche qu'un utilisateur utilise une promo plusieurs fois

**`currency_rates`** :
- Taux de change pour XOF, EUR, USD
- Permet les conversions automatiques

### Colonnes ajoutées

**`credit_packs`** :
- `price_xof` : Prix en francs CFA
- `price_eur` : Prix en euros
- `price_usd` : Prix en dollars

**`credit_purchases`** :
- `promotion_id` : ID de la promotion utilisée
- `promotion_name` : Nom de la promotion (snapshot)
- `promotion_discount` : Montant de la réduction appliquée

### Fonctions PostgreSQL

- `get_active_promotions_for_pack()` : Trouve la meilleure promo pour un pack
- `calculate_price_with_promotion()` : Calcule le prix final avec réduction

---

## 🎯 Cas d'Usage

### Promo Black Friday (-30% tous les packs)

```sql
INSERT INTO pack_promotions (name, all_packs, discount_type, discount_value, starts_at, ends_at, badge_text, badge_color, show_on_pricing)
VALUES (
  'Black Friday 2025',
  true,
  'percentage',
  30,
  '2025-11-25 00:00:00',
  '2025-11-30 23:59:59',
  '-30%',
  'red',
  true
);
```

### Promo Early Bird (montant fixe sur un pack)

```sql
INSERT INTO pack_promotions (name, pack_id, all_packs, discount_type, discount_value, starts_at, ends_at, badge_text, badge_color)
VALUES (
  'Early Bird',
  'uuid-du-pack-starter',
  false,
  'fixed_amount',
  500,
  '2025-12-01 00:00:00',
  '2026-01-31 23:59:59',
  '-500 FCFA',
  'orange'
);
```

---

## 📖 Documentation Complète

Pour plus de détails, consultez :
- [CURRENCIES_AND_PROMOTIONS_GUIDE.md](CURRENCIES_AND_PROMOTIONS_GUIDE.md) - Guide complet du système

---

**Prêt à lancer ?** Commencez par exécuter la migration dans Supabase !
