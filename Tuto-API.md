
# 🚀 Guide de Mise en Production - TigriPal AI

Ce guide t'explique comment déployer l'application pour qu'elle soit fonctionnelle sur mobile avec toutes ses capacités d'IA (Vocal, Photo, Traduction).

## 1. Obtenir une Clé API Gemini (Indispensable)
L'application utilise les modèles de pointe de Google. Sans clé, l'IA ne répondra pas.
1. Rends-toi sur [Google AI Studio](https://aistudio.google.com/).
2. Connecte-toi avec un compte Google.
3. Clique sur **"Get API Key"**.
4. Crée une nouvelle clé (**Create API key in new project**).
5. **Copie cette clé.** Elle sera nécessaire pour l'étape 3.

## 2. Déploiement (Vercel ou Netlify)
Pour que le micro et la caméra fonctionnent, l'application **doit impérativement** être hébergée sur une adresse sécurisée (`https://`).
*   **Option recommandée :** [Vercel](https://vercel.com/) (Gratuit et ultra-rapide).
*   Connecte ton dépôt GitHub ou uploade tes fichiers.

## 3. Configuration des Variables d'Environnement
C'est l'étape la plus importante pour la sécurité. Ne colle jamais ta clé directement dans le code.
1. Dans les paramètres de ton projet (Vercel ou Netlify), cherche l'onglet **Environment Variables**.
2. Ajoute une variable nommée : `API_KEY`.
3. Colle ta clé obtenue à l'étape 1 dans la valeur.
4. Redéploie l'application.

## 4. Autorisations Mobiles & PWA
Une fois l'URL `https://...` générée :
1. Ouvre le lien sur ton smartphone (Safari sur iOS, Chrome sur Android).
2. **Microphone & Caméra :** Le navigateur demandera l'autorisation. Clique sur "Autoriser".
3. **Mode Application (PWA) :**
   *   Sur iOS : Clique sur "Partager" -> "Sur l'écran d'accueil".
   *   Sur Android : Clique sur les trois points -> "Installer l'application".
   *   Cela permettra à l'app de s'ouvrir en plein écran, sans la barre d'adresse du navigateur.

## 5. Fonctionnement des APIs utilisées
Voici ce qui tourne "sous le capot" pour rassurer ton utilisateur :
*   **Traduction & OCR (Vision) :** Utilise `gemini-3-pro-preview`. C'est le modèle le plus puissant capable de lire le Tigrinya sur une photo et de comprendre l'audio complexe.
*   **Synthèse Vocale (TTS) :**
    *   *Français/Anglais :* Utilise la voix native du téléphone (fonctionne même avec une connexion faible).
    *   *Tigrinya :* Utilise `gemini-2.5-flash-preview-tts` pour une prononciation parfaite du Ge'ez.
*   **Confidentialité :** Aucune photo n'est stockée sur un serveur. Tout est traité "à la volée" puis oublié. L'historique reste uniquement dans la mémoire du téléphone (LocalStorage).

## 6. Test de validation (Checklist)
Avant de donner l'app à ton pote, vérifie :
- [ ] L'audio est transcrit quand tu parles français.
- [ ] Le scanner photo arrive à lire un texte sur ton écran d'ordi.
- [ ] Le bouton haut-parleur prononce bien le Tigrinya (vérifie le son du téléphone !).
- [ ] Les favoris (Lexique) survivent au rechargement de la page.

---
*Développé avec expertise pour une communication sans frontières.*
