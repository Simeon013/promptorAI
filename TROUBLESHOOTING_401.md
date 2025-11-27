# Résolution de l'erreur 401 lors de la génération de prompts

## Symptôme
Lorsque vous cliquez sur "Générer le prompt", vous obtenez une erreur 401 (Unauthorized) dans la console :
```
api/generate:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

## Cause
L'erreur 401 signifie que la clé API du provider AI configuré pour votre plan n'est pas valide ou manquante.

Promptor supporte plusieurs providers :
- **GEMINI** (par défaut pour le plan FREE)
- **OPENAI** (GPT models)
- **PERPLEXITY** (Sonar models)
- **CLAUDE** (non encore supporté)
- **MISTRAL** (non encore supporté)

Le système essaie de récupérer les clés depuis deux sources :
1. La base de données Supabase (table `admin_api_keys`)
2. Les variables d'environnement (fallback)

## Identifier le provider utilisé

Le provider utilisé dépend du **modèle configuré** pour votre plan dans `/admin/models`.

Par défaut :
- Plan **FREE** : `gemini-2.5-flash` (provider GEMINI)
- Plan **STARTER** : `gemini-2.5-flash` (provider GEMINI)
- Plan **PRO** : `gpt-4o-mini` (provider OPENAI)

## Solutions

### Solution 1 : Configurer via l'interface admin (Recommandé)

#### Pour Gemini (Google AI)
1. Obtenez une clé API :
   - Allez sur [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Créez ou copiez votre clé API

2. Configurez dans Promptor :
   - Allez sur `/admin/api-keys`
   - Cliquez sur "Ajouter une clé API"
   - Sélectionnez **GEMINI** comme provider
   - Collez votre clé API
   - Cochez "Active"
   - Cliquez sur "Enregistrer"

#### Pour OpenAI (ChatGPT)
1. Obtenez une clé API :
   - Allez sur [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Créez une nouvelle clé API

2. Configurez dans Promptor :
   - Allez sur `/admin/api-keys`
   - Sélectionnez **OPENAI** comme provider
   - Collez votre clé API
   - Cochez "Active"
   - Cliquez sur "Enregistrer"

#### Pour Perplexity
1. Obtenez une clé API :
   - Allez sur [https://www.perplexity.ai/settings/api](https://www.perplexity.ai/settings/api)
   - Créez une nouvelle clé API

2. Configurez dans Promptor :
   - Allez sur `/admin/api-keys`
   - Sélectionnez **PERPLEXITY** comme provider
   - Collez votre clé API
   - Cochez "Active"
   - Cliquez sur "Enregistrer"

3. Testez la clé :
   - Cliquez sur "Tester" à côté de la clé
   - Vérifiez qu'elle est valide

### Solution 2 : Utiliser les variables d'environnement (Développement local)

Si vous êtes en développement local :

1. Créez ou éditez le fichier `.env.local` à la racine du projet :
   ```env
   # Choisissez le(s) provider(s) que vous souhaitez utiliser
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   PERPLEXITY_API_KEY=your_perplexity_api_key_here
   ```

2. Redémarrez le serveur de développement :
   ```bash
   npm run dev
   ```

### Solution 3 : Vérifier la configuration Supabase

Si la clé est configurée mais ne fonctionne pas :

1. Vérifiez que la table `admin_api_keys` existe dans Supabase
2. Exécutez cette requête SQL pour vérifier :
   ```sql
   SELECT provider, is_active, created_at
   FROM admin_api_keys
   WHERE provider = 'GEMINI';
   ```

3. Si la table n'existe pas, créez-la avec le script dans `SUPABASE_QUICK_SETUP.md`

## Vérification

Une fois la clé configurée, testez la génération :

1. Allez sur `/editor`
2. Entrez une idée simple : "Un chat dans la lave"
3. Cliquez sur "Générer le prompt"
4. Vous devriez obtenir un résultat sans erreur 401

## Autres erreurs possibles

- **429 (Too Many Requests)** : Quota API dépassé, attendez ou augmentez votre quota Gemini
- **403 (Forbidden)** : Clé API révoquée ou invalide
- **500 (Internal Server Error)** : Erreur serveur, vérifiez les logs

## Support

Si le problème persiste :
1. Vérifiez les logs serveur : `npm run dev` dans le terminal
2. Ouvrez la console développeur : F12 > Console
3. Vérifiez le panel Network pour voir la réponse exacte de l'API
