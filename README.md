# 🌍 TigriPal AI - Traducteur Vocal & Visuel Intelligent

TigriPal AI est une application mobile-first conçue pour briser les barrières linguistiques entre le **Français**, le **Tigrinya** et l'**Anglais**. Elle utilise les modèles d'IA les plus avancés de Google pour offrir une précision professionnelle dans un contexte de travail ou de vie quotidienne.

## 🚀 Fonctionnalités Clés

- **🎤 Traduction Vocale Temps Réel** : Transcription et traduction instantanée avec gestion de la phonétique pour faciliter la prononciation.
- **📸 Mode Scanner (Vision)** : Prenez une photo d'un panneau, d'un document ou d'une étiquette pour extraire et traduire le texte (OCR haute précision).
- **🔊 Synthèse Vocale Hybride** : 
  - Français/Anglais via les APIs natives du navigateur (ultra-fluide).
  - Tigrinya via **Gemini 2.5 Flash TTS** pour une diction parfaite des sons éjectifs.
- **📚 Lexique & Favoris** : Enregistrez vos phrases importantes pour les retrouver instantanément, même sans réseau (via LocalStorage).
- **💡 Guide & Kit de Survie** : 30 phrases essentielles pour le travail et des dizaines de conseils linguistiques et culturels intégrés.
- **🔄 Mode Conversation** : Interface face-à-face pour discuter naturellement avec une autre personne.

## 🧠 Architecture Technique

- **Framework** : React 19 (SPA Mobile-First).
- **IA (Cœur)** : **Gemini 3 Pro** (pour la traduction multimodale et l'OCR) et **Gemini 2.5 Flash** (pour le TTS Tigrinya).
- **UI/UX** : Tailwind CSS avec des animations fluides et un design "Glassmorphism" moderne.
- **Sécurité** : Les clés API sont gérées via des variables d'environnement (`process.env.API_KEY`).
- **PWA Ready** : Optimisé pour être installé sur l'écran d'accueil du smartphone.

## 🛠️ Installation & Production

1. **Clé API** : Obtenez une clé sur [Google AI Studio](https://aistudio.google.com/).
2. **Hébergement** : Déployez sur Vercel ou Netlify (HTTPS obligatoire pour le micro/caméra).
3. **Variable d'environnement** : Ajoutez `API_KEY` dans les paramètres de votre service d'hébergement.
4. **Usage** : Ouvrez l'URL sur votre téléphone et ajoutez l'application à l'écran d'accueil.

## ⚠️ Notes importantes
- **Luminosité** : Le mode scanner fonctionne mieux avec une lumière claire et directe sur le texte.
- **Mode Silencieux** : Sur iPhone, désactivez le bouton physique "Silencieux" pour entendre la synthèse vocale.

---
*Développé pour faciliter l'intégration et la communication sans frontières.*