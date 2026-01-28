
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, TranslationResult, TranslationScanResult } from "../types";

function cleanJsonResponse(text: string): string {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

export async function translateAudio(
  base64Audio: string,
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = "gemini-3-pro-preview";
  
  const prompt = `
    TASK: High-precision audio translation and transcription.
    AUDIO CONTEXT: The user is speaking in ${sourceLang}.
    OUTPUT FORMAT: Strictly JSON.
    {
      "original": "Transcribed text",
      "originalPhonetic": "Phonetic",
      "translated": "Translated text",
      "translatedPhonetic": "Phonetic",
      "allVersions": { "fr": "...", "frPhonetic": "...", "ti": "...", "tiPhonetic": "...", "en": "...", "enPhonetic": "..." }
    }
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        { inlineData: { mimeType: "audio/webm", data: base64Audio } },
        { text: prompt },
      ],
    },
    config: { responseMimeType: "application/json", temperature: 0.1 },
  });

  return JSON.parse(cleanJsonResponse(response.text || "{}"));
}

export async function translateImage(
  base64Image: string,
  sourceLang: Language,
  targetLang: Language
): Promise<TranslationScanResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = "gemini-3-pro-preview";

  const prompt = `
    TASK: OCR and high-precision translation from an image.
    IMAGE CONTEXT: The text in the image is in ${sourceLang}.
    INSTRUCTIONS:
    1. Extract the raw text from the image as 'original'.
    2. Translate it to ${targetLang}.
    3. Generate all language versions (fr, ti, en).
    4. Provide a confidence score (0 to 1).
    
    OUTPUT FORMAT: JSON
    {
      "original": "Extracted text",
      "originalPhonetic": "...",
      "translated": "...",
      "translatedPhonetic": "...",
      "confidence": 0.95,
      "allVersions": { ... same structure as audio ... }
    }
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt },
      ],
    },
    config: { responseMimeType: "application/json", temperature: 0.1 },
  });

  return JSON.parse(cleanJsonResponse(response.text || "{}"));
}

export async function generateTTS(text: string, isTigrinya: boolean): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: isTigrinya ? `Speak Tigrinya: ${text}` : text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: isTigrinya ? 'Kore' : 'Zephyr' } },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
}
