
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, TranslationResult, TranslationScanResult } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

const DEFAULT_MODEL = "gemini-3-flash-preview";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

/**
 * Récupère la clé API de manière sécurisée.
 * En production (Vercel), elle doit être dans les variables d'environnement.
 */
function getApiKey() {
  // Tentative de récupération via process.env (injecté par le bundler)
  // ou via une propriété globale si disponible.
  const key = (typeof process !== 'undefined' ? process.env.API_KEY : undefined) || 
              (window as any).process?.env?.API_KEY;

  if (!key || key === "undefined" || key === "" || key.length < 10) {
    throw new Error(
      "CLÉ API MANQUANTE : L'application ne trouve pas votre clé Gemini.\n\n" +
      "1. Allez sur Vercel > Settings > Environment Variables.\n" +
      "2. Ajoutez 'API_KEY' avec votre clé.\n" +
      "3. Allez dans 'Deployments' et cliquez sur 'Redeploy'."
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

    if (!response.text) throw new Error("Réponse vide de l'IA.");
    return JSON.parse(cleanJsonResponse(response.text));
  } catch (error: any) {
    console.error("Gemini Audio Error:", error);
    throw new Error(error.message || "Erreur lors de la traduction audio.");
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

    if (!response.text) throw new Error("Aucun texte détecté.");
    return JSON.parse(cleanJsonResponse(response.text));
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    throw new Error(error.message || "Erreur d'analyse visuelle.");
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
