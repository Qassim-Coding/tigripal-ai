
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, TranslationResult, TranslationScanResult } from "../types";

const DEFAULT_MODEL = "gemini-3-flash-preview";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

/**
 * Nettoyage des réponses JSON pour éviter les erreurs de parsing
 */
function cleanJsonResponse(text: string): string {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

/**
 * Récupère la clé API de manière robuste pour Vite/Vercel.
 * Note : Vite nécessite le préfixe VITE_ pour exposer une variable au client.
 */
function getApiKey(): string {
  // Vite utilise import.meta.env pour les variables d'environnement côté client
  // Les variables doivent commencer par VITE_ pour être exposées
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!key) {
    throw new Error(
      "CLÉ API INTROUVABLE SUR VERCEL :\n\n" +
      "1. Dans les réglages Vercel, ajoutez une variable d'environnement nommée 'VITE_GEMINI_API_KEY'.\n" +
      "2. Collez votre clé API Gemini dans la valeur.\n" +
      "3. Allez dans l'onglet 'Deployments' et cliquez sur 'Redeploy'.\n\n" +
      "C'est indispensable pour que le navigateur puisse lire la clé.\n" +
      "Note : Le préfixe VITE_ est obligatoire pour que Vite expose la variable au client."
    );
  }
  return key;
}

export async function translateAudio(
  base64Audio: string,
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationResult> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const prompt = `Translate this audio from ${sourceLang} to ${targetLang}. 
  Include all versions for fr, ti, en in an 'allVersions' object.`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "audio/webm", data: base64Audio } },
          { text: prompt },
        ],
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            originalPhonetic: { type: Type.STRING },
            translated: { type: Type.STRING },
            translatedPhonetic: { type: Type.STRING },
            allVersions: {
              type: Type.OBJECT,
              properties: {
                fr: { type: Type.STRING },
                frPhonetic: { type: Type.STRING },
                ti: { type: Type.STRING },
                tiPhonetic: { type: Type.STRING },
                en: { type: Type.STRING },
                enPhonetic: { type: Type.STRING },
              },
              required: ["fr", "frPhonetic", "ti", "tiPhonetic", "en", "enPhonetic"]
            }
          },
          required: ["original", "originalPhonetic", "translated", "translatedPhonetic", "allVersions"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA.");
    return JSON.parse(cleanJsonResponse(text));
  } catch (error: any) {
    console.error("Gemini Audio Error:", error);
    throw error;
  }
}

export async function translateImage(
  base64Image: string,
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationScanResult> {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  const prompt = `OCR and translate text in this image from ${sourceLang} to ${targetLang}. 
  Provide phonetic transcriptions and include all versions for fr, ti, en in an 'allVersions' object.`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt },
        ],
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            originalPhonetic: { type: Type.STRING },
            translated: { type: Type.STRING },
            translatedPhonetic: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            allVersions: {
              type: Type.OBJECT,
              properties: {
                fr: { type: Type.STRING },
                frPhonetic: { type: Type.STRING },
                ti: { type: Type.STRING },
                tiPhonetic: { type: Type.STRING },
                en: { type: Type.STRING },
                enPhonetic: { type: Type.STRING },
              },
              required: ["fr", "frPhonetic", "ti", "tiPhonetic", "en", "enPhonetic"]
            }
          },
          required: ["original", "originalPhonetic", "translated", "translatedPhonetic", "confidence", "allVersions"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("Aucun texte détecté.");
    return JSON.parse(cleanJsonResponse(text));
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
}

export async function generateTTS(text: string, isTigrinya: boolean): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text: isTigrinya ? `Say this in Tigrinya: ${text}` : text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: isTigrinya ? 'Kore' : 'Zephyr' } },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  } catch (error) {
    console.error("TTS Error:", error);
    return "";
  }
}
