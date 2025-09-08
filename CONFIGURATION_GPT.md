# 🚀 Configuration GPT pour votre IA Garage AutoGenius

## 🔑 Étape 1: Obtenir votre clé API GPT

### 1. Créer un compte OpenAI
- Allez sur [https://platform.openai.com/](https://platform.openai.com/)
- Créez un compte ou connectez-vous
- Vérifiez votre email

### 2. Obtenir votre clé API
- Cliquez sur votre profil → "View API keys"
- Cliquez sur "Create new secret key"
- Copiez la clé (elle commence par `sk-...`)
- ⚠️ **IMPORTANT** : Gardez cette clé secrète !

### 3. Vérifier vos crédits
- Vérifiez votre solde dans "Billing"
- GPT-4o-mini coûte environ $0.00015 par 1K tokens
- Une réponse typique coûte environ $0.01-0.05

## ⚙️ Étape 2: Configurer votre serveur

### 1. Modifier le fichier `config.env`
```env
# Configuration de la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=garage_db
DB_PORT=3306

# Configuration de l'IA GPT
OPENAI_API_KEY=sk-votre_cle_api_ici
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.2
OPENAI_MAX_TOKENS=800

# Configuration du serveur
PORT=5000
JWT_SECRET=votre_jwt_secret_ici
```

### 2. Redémarrer le serveur
```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
node server.js
```

## 🧪 Étape 3: Tester GPT

### 1. Test rapide
```bash
node test-gpt-ia.js
```

### 2. Test manuel
- Allez sur `http://localhost:3000/assistant-ia`
- Posez une question technique complexe
- Vérifiez que la réponse utilise GPT

## 🎯 Fonctionnalités GPT activées

### ✅ **Réponses professionnelles**
- Explications techniques détaillées
- Conseils de sécurité appropriés
- Procédures étape par étape
- Diagnostic intelligent des pannes

### ✅ **Adaptation contextuelle**
- Utilise vos données garage
- Combine avec des informations techniques
- Réponses personnalisées selon le rôle
- Conseils adaptés à votre contexte

### ✅ **Fallback intelligent**
- Si GPT échoue → Mode hybride
- Si pas de clé → Mode standard
- Toujours une réponse disponible
- Gestion d'erreur robuste

## 💰 Gestion des coûts

### **Modèles recommandés**
- **GPT-4o-mini** : Rapide, efficace, économique
- **GPT-3.5-turbo** : Bon rapport qualité/prix
- **GPT-4o** : Qualité maximale, plus cher

### **Optimisation des coûts**
- Limitez `max_tokens` selon vos besoins
- Utilisez `temperature` basse pour la précision
- Activez le mode hybride pour économiser
- Surveillez votre consommation

## 🔧 Configuration avancée

### **Personnalisation des prompts**
- Modifiez `gpt-config.js` pour adapter les réponses
- Ajoutez des instructions spécifiques à votre garage
- Personnalisez selon vos clients

### **Paramètres de performance**
```javascript
// Dans gpt-config.js
parameters: {
  temperature: 0.1,        // Plus précis
  maxTokens: 600,          // Réponses moyennes
  topP: 0.9,              // Qualité optimale
}
```

## 🚨 Dépannage

### **Erreur "Invalid API key"**
- Vérifiez que la clé est correcte
- Assurez-vous qu'elle commence par `sk-`
- Vérifiez que le compte est actif

### **Erreur "Rate limit exceeded"**
- Attendez quelques minutes
- Vérifiez votre plan d'abonnement
- Utilisez le mode hybride en attendant

### **Erreur "Insufficient credits"**
- Rechargez votre compte OpenAI
- Vérifiez votre solde
- Utilisez le mode hybride temporairement

## 🎉 Résultat final

Avec GPT activé, votre IA peut maintenant :

1. **🔍 Diagnostiquer** des pannes complexes
2. **📚 Expliquer** des procédures techniques
3. **💰 Estimer** des coûts de réparation
4. **🛡️ Conseiller** sur la sécurité
5. **📅 Planifier** l'entretien
6. **🌐 Combiner** vos données avec l'expertise GPT

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez votre configuration
2. Testez avec `test-gpt-ia.js`
3. Consultez les logs du serveur
4. Vérifiez votre compte OpenAI

---

**🎯 Votre garage a maintenant une IA aussi puissante qu'un expert automobile !** 🚗🤖✨
