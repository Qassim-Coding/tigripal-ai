
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
 * Récupère la clé API de manière robuste sur Vercel/Navigateur.
 * Note : Vercel exige souvent le préfixe NEXT_PUBLIC_ pour exposer une variable au client.
 */
function getApiKey(): string {
  // On vérifie process.env.API_KEY (demandé) ET les variantes de build classiques
  const key = process.env.API_KEY || (process.env as any).NEXT_PUBLIC_API_KEY || (process.env as any).VITE_API_KEY;
  
  if (!key) {
    throw new Error(
      "CLÉ API INTROUVABLE SUR VERCEL :\n\n" +
      "1. Renommez votre variable 'API_KEY' en 'NEXT_PUBLIC_API_KEY' dans les réglages Vercel.\n" +
      "2. Allez dans l'onglet 'Deployments' et cliquez sur 'Redeploy'.\n\n" +
      "C'est indispensable pour que le navigateur de votre téléphone puisse lire la clé."
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
