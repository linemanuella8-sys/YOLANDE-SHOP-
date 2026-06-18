Guide rapide - Migrer PagnéShop vers Firebase (production)

1) Créer un projet Firebase
   - https://console.firebase.google.com/
   - Activer Authentication, Firestore Database (mode Production), Storage, Hosting

2) Authentification Google
   - Authentication > Sign-in method > Google > Enable
   - Configure OAuth consent screen if demandé

3) Ajouter une application Web
   - Copier la config Firebase et remplacer `firebaseConfig` dans `o.html`
   - NE PAS exposer les clés d'Admin ou serviceAccount sur le frontend.

4) Règles Firestore
   - Déployer `firestore.rules` fourni via Firebase Console ou `firebase deploy --only firestore:rules`

5) Functions (emails)
   - cd functions
   - npm install
   - Ajouter variable d'environnement SendGrid: `firebase functions:config:set sendgrid.key="YOUR_KEY"`
   - Déployer: `firebase deploy --only functions`

6) Backend Node (optionnel)
   - Déployer `backend` sur votre serveur ou Cloud Run.
   - Utiliser Firebase Admin SDK avec clés de service (NE PAS committer la clé).

7) Hosting
   - `firebase deploy --only hosting` (après build / préparation du frontend)

8) Sécurité conseillée
   - Activer Firebase App Check
   - Ajouter règles CORS strictes pour API
   - Utiliser reCAPTCHA pour formulaires sensibles
   - Paramétrer quotas et alertes

9) Local dev
   - Utiliser Firebase Emulator Suite pour Firestore/Auth/Functions

10) Notes
   - Le frontend `o.html` contient désormais un wrapper DB qui propage les données vers Firestore quand connecté.
   - Pour basculer full-remote, connectez-vous (Google) et vérifiez vos collections `users`, `orders`, `products`.
