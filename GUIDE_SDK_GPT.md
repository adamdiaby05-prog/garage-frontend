# 🚀 Guide SDK OpenAI - IA Garage AutoGenius

## ✅ **Configuration Terminée !**

Votre clé API GPT a été intégrée et le SDK OpenAI est installé !

### 🔑 **Votre clé API configurée :**
```
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
```

## 🚀 **Démarrage Rapide**

### **Option 1: Script automatique (Recommandé)**
```bash
start-sdk-gpt.bat
```

### **Option 2: Manuel**
```bash
# 1. Démarrer le serveur
node server.js

# 2. Dans un autre terminal, tester
node test-gpt-sdk.js
```

## 🧪 **Tests Disponibles**

### **Test SDK complet**
```bash
node test-gpt-sdk.js
```

### **Test IA générale**
```bash
node test-ai-web.js
```

### **Test manuel**
- Allez sur : `http://localhost:3000/assistant-ia`
- Posez des questions techniques

## 🎯 **Avantages du SDK OpenAI**

### ✅ **Meilleure gestion d'erreur**
- Erreurs détaillées et explicites
- Fallback automatique vers le mode hybride
- Gestion des timeouts et limites

### ✅ **Métadonnées complètes**
- Nombre de tokens utilisés
- Coût estimé par requête
- Modèle utilisé
- Performance détaillée

### ✅ **Performance optimisée**
- Connexions persistantes
- Gestion automatique des retry
- Cache intelligent

### ✅ **Sécurité renforcée**
- Validation automatique de la clé
- Gestion sécurisée des erreurs
- Logs détaillés

## 💰 **Suivi des Coûts**

### **Informations de coût dans les réponses :**
```json
{
  "reply": "Réponse de GPT...",
  "llm": true,
  "model": "gpt-4o-mini",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

### **Calcul du coût :**
- **GPT-4o-mini** : ~$0.00015 par 1K tokens
- **Exemple** : 350 tokens = ~$0.00005
- **Réponse typique** : $0.01-0.05

## 🔧 **Configuration Avancée**

### **Modifier les paramètres dans `config.env` :**
```env
OPENAI_MODEL=gpt-4o-mini      # Modèle à utiliser
OPENAI_TEMPERATURE=0.2        # Créativité (0-1)
OPENAI_MAX_TOKENS=800         # Longueur max des réponses
```

### **Modèles disponibles :**
- **gpt-4o-mini** : Rapide, économique (recommandé)
- **gpt-3.5-turbo** : Bon rapport qualité/prix
- **gpt-4o** : Qualité maximale, plus cher

## 🎉 **Fonctionnalités Activées**

### **1. 🔍 Diagnostic Expert**
```
👤 "Mon moteur fait un bruit de cliquetis au démarrage"
🤖 [GPT analyse + conseils techniques + sécurité]
```

### **2. 📚 Explications Techniques**
```
👤 "Comment changer les plaquettes de frein ?"
🤖 [Procédure étape par étape + outils + sécurité]
```

### **3. 💰 Estimations de Prix**
```
👤 "Combien coûte une révision complète ?"
🤖 [Fourchette de prix + facteurs + conseils]
```

### **4. 🛡️ Conseils de Sécurité**
```
👤 "Symptômes d'une panne de batterie ?"
🤖 [Diagnostic + risques + actions à prendre]
```

### **5. 📅 Planning d'Entretien**
```
👤 "Quand faire la révision de ma Clio 2019 ?"
🤖 [Planning + points de contrôle + recommandations]
```

## 🚨 **Dépannage**

### **Erreur "Client OpenAI non initialisé"**
- Vérifiez que la clé API est correcte
- Redémarrez le serveur
- Vérifiez les logs

### **Erreur "Rate limit exceeded"**
- Attendez quelques minutes
- Le mode hybride se déclenche automatiquement

### **Erreur "Insufficient credits"**
- Rechargez votre compte OpenAI
- Le mode hybride continue de fonctionner

## 📊 **Monitoring**

### **Logs du serveur :**
```
🤖 Client OpenAI initialisé avec succès
📝 Question reçue: [votre question]
🤖 Réponse GPT générée
📊 Tokens utilisés: 350
```

### **Métriques dans les réponses :**
- `llm: true` = Utilise GPT
- `enhanced: true` = Réponse améliorée
- `usage` = Détails des tokens
- `model` = Modèle utilisé

## 🎯 **Exemples de Questions**

### **Questions Techniques (GPT excelle)**
- "Mon moteur fait un bruit de cliquetis au démarrage à froid"
- "Ma voiture tire à droite et vibre à haute vitesse"
- "Différence entre huile synthétique et minérale"

### **Questions sur vos Données (GPT + BDD)**
- "Liste des mécaniciens disponibles"
- "Réparations en cours pour ma Clio"
- "Statistiques du garage ce mois-ci"

### **Questions Mixtes (Intelligence Combinée)**
- "Symptômes d'une panne de batterie et avez-vous des mécaniciens ?"
- "Prix d'une révision et planning d'entretien"

---

## 🎉 **Félicitations !**

Votre garage a maintenant une IA qui utilise le **SDK OpenAI officiel** avec :

✅ **Clé API configurée**  
✅ **SDK installé et fonctionnel**  
✅ **Gestion d'erreur robuste**  
✅ **Métadonnées complètes**  
✅ **Performance optimisée**  
✅ **Fallback intelligent**  

**🚀 Votre IA est prête à rivaliser avec les meilleurs experts automobiles !** 🚗🤖✨
