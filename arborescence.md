# 📂 Arborescence Complète - TigriPal AI

Voici l'organisation structurelle de l'application finale prête pour la production.

```text
root/
├── index.html            # Point d'entrée HTML (PWA Meta, Fonts, Tailwind)
├── index.tsx             # Initialisation React & Montage
├── App.tsx               # Orchestrateur (Navigation, États globaux, Vues)
├── types.ts              # Interfaces TypeScript (Message, Language, ScanResult)
├── metadata.json         # Permissions système (Microphone, Caméra)
│
├── services/
│   ├── geminiService.ts  # Clients API Gemini (Audio, Image OCR, TTS Tigrinya)
│   └── audioUtils.ts     # Utilitaires Audio (Décodage PCM, Web Audio Context)
│
├── constants/
│   ├── phrases.ts        # Base de données du Kit de Survie (30 phrases)
│   └── tipsData.ts       # Base de données des Conseils (90 tips)
│
└── components/
    ├── Header.tsx            # Barre de titre & Accès rapide
    ├── BottomNav.tsx         # Navigation principale par onglets
    ├── Recorder.tsx          # Module de capture vocale & sélecteur de langues
    ├── VisionScanner.tsx     # Module Caméra / OCR / Analyse d'image
    ├── MessageBubble.tsx     # Affichage d'une traduction (TTS, Favoris, Phonétique)
    ├── LexiconView.tsx       # Gestion des favoris & Exportation
    ├── HistoryView.tsx       # Journal complet des traductions passées
    ├── SurvivalKit.tsx       # Liste des phrases essentielles sonorisées
    ├── TipsView.tsx          # Centre d'aide et conseils linguistiques
    ├── LanguageTipsDetail.tsx # Vue détaillée des conseils par langue
    ├── ConversationMode.tsx  # Interface face-à-face interactive
    └── TalkingAvatar.tsx     # Animation visuelle lors de la lecture audio
```

## 🛠️ Flux de Communication
1. **Multimodal** : Les services `translateAudio` et `translateImage` utilisent le même modèle Gemini 3 Pro pour garantir une cohérence de traduction.
2. **Persistance** : `App.tsx` synchronise systématiquement l'historique et les favoris avec le `localStorage`.
3. **Sécurité** : L'accès aux périphériques (Caméra/Micro) est protégé par des vérifications de permissions natives incluses dans `metadata.json`.
