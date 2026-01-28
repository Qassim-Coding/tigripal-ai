
export enum Language {
  FRENCH = 'French',
  TIGRINYA = 'Tigrinya',
  ENGLISH = 'English'
}

export enum ViewType {
  CHAT = 'chat',
  HISTORY = 'history',
  LEXICON = 'lexicon',
  SURVIVAL = 'survival',
  TIPS = 'tips',
  TIPS_DETAIL = 'tips_detail',
  PHOTO = 'photo'
}

export interface Message {
  id: string;
  originalText: string;
  originalPhonetic: string;
  translatedText: string;
  translatedPhonetic: string;
  sourceLang: Language;
  targetLang: Language;
  timestamp: number;
  fullData?: {
    fr: string;
    frPhonetic: string;
    ti: string;
    tiPhonetic: string;
    en: string;
    enPhonetic: string;
  };
}

export interface TranslationResult {
  original: string;
  originalPhonetic: string;
  translated: string;
  translatedPhonetic: string;
  allVersions: {
    fr: string;
    frPhonetic: string;
    ti: string;
    tiPhonetic: string;
    en: string;
    enPhonetic: string;
  };
}

export interface TranslationScanResult extends TranslationResult {
  confidence: number;
}

export interface FavoriteItem {
  id: string;
  fr: string;
  frPhonetic: string;
  ti: string;
  tiPhonetic: string;
  en: string;
  enPhonetic: string;
  timestamp: number;
}

export interface StaticPhrase {
  id: string;
  fr: string;
  ti: string;
  en: string;
  frPhonetic: string;
  tiPhonetic: string;
  enPhonetic: string;
  category: string;
}

export interface TipItem {
  cat: 'TI' | 'FR' | 'EN';
  title: string;
  text: string;
}
