
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, TranslationResult, TranslationScanResult } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

/**
 * Note: Utilisation de gemini-3-flash-preview pour la rapidité et la stabilité 
 * sur les tâches multimodales de traduction.
 */
const DEFAULT_MODEL = "gemini-3-flash-preview";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

export async function translateAudio(
  base64Audio: string,
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationResult> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Clé API manquante dans l'environnement.");

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    TASK: High-precision audio translation and transcription.
    AUDIO CONTEXT: The user is speaking in ${sourceLang}.
    INSTRUCTIONS: 
    1. Transcribe the audio precisely.
    2. Translate to ${targetLang}.
    3. Provide phonetic pronunciation for both.
    
    OUTPUT FORMAT: Strictly JSON.
    {
      "original": "Transcribed text",
      "originalPhonetic": "Phonetic",
      "translated": "Translated text",
      "translatedPhonetic": "Phonetic",
      "allVersions": { "fr": "...", "frPhonetic": "...", "ti": "...", "tiPhonetic": "...", "en": "...", "enPhonetic": "..." }
    }
  `;

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
        temperature: 0.1 
      },
    });

    const text = response.text;
    if (!text) throw new Error("Le modèle n'a renvoyé aucun texte.");
    return JSON.parse(cleanJsonResponse(text));
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
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Clé API manquante.");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    TASK: OCR and high-precision translation from an image.
    IMAGE CONTEXT: The text in the image is in ${sourceLang}.
    INSTRUCTIONS:
    1. Extract all visible text as 'original'.
    2. Translate it to ${targetLang}.
    3. Generate phonetic versions.
    
    OUTPUT FORMAT: JSON
    {
      "original": "Extracted text",
      "originalPhonetic": "...",
      "translated": "...",
      "translatedPhonetic": "...",
      "confidence": 0.95,
      "allVersions": { "fr": "...", "frPhonetic": "...", "ti": "...", "tiPhonetic": "...", "en": "...", "enPhonetic": "..." }
    }
  `;

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
        temperature: 0.1 
      },
    });

    const text = response.text;
    if (!text) throw new Error("Aucun texte détecté sur l'image.");
    return JSON.parse(cleanJsonResponse(text));
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    throw new Error(error.message || "Erreur d'analyse visuelle.");
  }
}

export async function generateTTS(text: string, isTigrinya: boolean): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return "";

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text: isTigrinya ? `Speak Tigrinya: ${text}` : text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: isTigrinya ? 'Kore' : 'Zephyr' } 
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  } catch (error) {
    console.error("TTS Error:", error);
    return "";
  }
}
