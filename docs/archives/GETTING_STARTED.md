# 🚀 Démarrage Rapide - Promptor

## Installation en 5 Minutes

### 1. Prérequis
- Node.js 18+ installé
- Une clé API Gemini ([obtenir ici](https://aistudio.google.com/app/apikey))

### 2. Installation

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
```

### 3. Configuration

Éditez `.env.local` et ajoutez votre clé Gemini:

```env
GEMINI_API_KEY=votre_clé_ici
```

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera disponible sur **http://localhost:3000** 🎉

---

## 🎨 Utilisation

### Mode Génération

1. Sélectionnez "Générer"
2. Entrez votre idée (ex: "un robot dans une ville futuriste")
3. Ajoutez des contraintes optionnelles
4. Cliquez sur "Générer le Prompt"
5. Copiez le résultat !

### Mode Amélioration

1. Sélectionnez "Améliorer"
2. Collez votre prompt existant
3. Ajoutez des contraintes d'amélioration
4. Cliquez sur "Améliorer le Prompt"
5. Récupérez la version améliorée !

### Suggestions Intelligentes

1. Entrez votre idée
2. Cliquez sur "Suggestions"
3. Sélectionnez les mots-clés suggérés
4. Ils s'ajouteront automatiquement à votre prompt !

---

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev              # Lancer le serveur de dev (Turbopack)

# Production
npm run build            # Build pour production
npm start                # Démarrer en mode production

# Base de données (optionnel, pour Phase 2+)
npm run db:push          # Pousser le schéma Prisma
npm run db:studio        # Ouvrir Prisma Studio
npm run db:generate      # Générer le client Prisma

# Qualité du code
npm run lint             # Linter ESLint
```

---

## 📁 Structure du Projet

```
promptor/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 🏠 Page d'accueil
│   ├── layout.tsx         # Layout principal
│   ├── globals.css        # Styles globaux
│   └── api/               # API Routes
│       ├── generate/      # Génération de prompts
│       └── suggestions/   # Suggestions IA
├── components/
│   └── ui/                # Composants Shadcn/ui
├── lib/
│   ├── ai/                # Services IA (Gemini)
│   ├── db/                # Prisma (DB)
│   └── utils.ts           # Utilitaires
├── types/                 # Types TypeScript
├── config/                # Configuration
└── public/                # Assets statiques
```

---

## 🎯 Fonctionnalités Actuelles

- ✅ Génération de prompts détaillés
- ✅ Amélioration de prompts existants
- ✅ Suggestions intelligentes par catégories
- ✅ Interface moderne dark mode
- ✅ Copie en un clic
- ✅ Support multilingue

---

## 🚧 Prochainement (Phase 2+)

- [ ] Authentification utilisateur
- [ ] Sauvegarde cloud des prompts
- [ ] Dashboard avec analytics
- [ ] Plans d'abonnement (Free, Starter, Pro)
- [ ] Workspaces collaboratifs
- [ ] API publique
- [ ] Templates marketplace
- [ ] Support multi-modèles (GPT-4, Claude)

---

## 🐛 Résolution de Problèmes

### Le serveur ne démarre pas
```bash
# Nettoyer le cache
rm -rf .next node_modules/.cache
npm install
npm run dev
```

### Erreur "API Key not valid"
- Vérifiez que `GEMINI_API_KEY` est bien définie dans `.env.local`
- Assurez-vous que la clé est valide sur [Google AI Studio](https://aistudio.google.com)
- Redémarrez le serveur après modification du `.env.local`

### Port 3000 déjà utilisé
```bash
# Le serveur utilisera automatiquement le port 3001
# Ou arrêter le processus sur le port 3000:
npx kill-port 3000
```

### Erreur de build TypeScript
```bash
# Vérifier les erreurs
npm run lint

# Régénérer les types Next.js
rm -rf .next
npm run dev
```

---

## 💡 Astuces

### 1. Raccourcis Clavier (à venir)
- `Ctrl + Enter` : Générer/Améliorer
- `Ctrl + K` : Focus sur input
- `Ctrl + C` : Copier le résultat

### 2. Meilleurs Prompts
- Soyez spécifique dans vos idées
- Utilisez les contraintes pour affiner
- Testez les suggestions pour enrichir
- Itérez en mode "Améliorer"

### 3. Suggestions Pertinentes
- Plus votre input est détaillé, meilleures sont les suggestions
- Les suggestions s'adaptent au contexte (image, texte, code)

---

## 📞 Support

- 📖 [Documentation complète](README.md)
- 🔧 [Guide de migration](MIGRATION.md)
- 🐛 [Issues GitHub](https://github.com/votre-username/promptor/issues)
- 💬 [Discord Community](https://discord.gg/promptor) (à venir)

---

## 🎓 Tutoriels

### Générer un prompt pour DALL-E
1. Mode: Générer
2. Idée: "Chat astronaute sur la lune"
3. Contraintes: "Style réaliste, 4K, cinématique"
4. Résultat optimisé pour DALL-E ✨

### Améliorer un prompt pour ChatGPT
1. Mode: Améliorer
2. Prompt: "Écris une histoire"
3. Contraintes: "En français, style fantastique, 500 mots"
4. Résultat structuré et détaillé 🚀

---

**Bon prompt engineering ! 🎨✨**
