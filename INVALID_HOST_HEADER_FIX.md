# Configuration pour résoudre l'erreur "Invalid Host header"

## Solution 1: Variables d'environnement pour React

Créez un fichier `.env.local` dans la racine du projet avec :

```
DANGEROUSLY_DISABLE_HOST_CHECK=true
HOST=0.0.0.0
```

## Solution 2: Configuration dans package.json

Ajoutez dans package.json :
```json
{
  "scripts": {
    "start": "HOST=0.0.0.0 react-scripts start"
  }
}
```

## Solution 3: Pour Dokploy spécifiquement

Ajoutez ces variables d'environnement dans Dokploy :
- DANGEROUSLY_DISABLE_HOST_CHECK=true
- HOST=0.0.0.0
- PORT=3000

## Solution 4: Configuration serveur personnalisé

Si vous utilisez un serveur personnalisé, ajoutez :
```javascript
const express = require('express');
const app = express();

// Désactiver la vérification du host header
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
```
