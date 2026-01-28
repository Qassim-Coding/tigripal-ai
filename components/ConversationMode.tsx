
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, Loader2, RotateCw, Volume2 } from 'lucide-react';
import { Language, TranslationResult } from '../types';
import { translateAudio, generateTTS } from '../services/geminiService';
import { playRawAudio, initAudioContext } from '../services/audioUtils';

interface Props {
  onClose: () => void;
}

const ConversationMode: React.FC<Props> = ({ onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState<'top' | 'bottom' | null>(null);
  const [lastResult, setLastResult] = useState<TranslationResult | null>(null);
  const [lastSpeaker, setLastSpeaker] = useState<'top' | 'bottom' | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async (side: 'top' | 'bottom') => {
    await initAudioContext();
    const sourceLang = side === 'top' ? Language.TIGRINYA : Language.FRENCH;
    const targetLang = side === 'top' ? Language.FRENCH : Language.TIGRINYA;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          await processTranslation(base64, sourceLang, targetLang, side);
        };
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(side);
    } catch (err) { alert("Micro requis"); }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(null);
  };

  const processTranslation = async (base64: string, src: Language, tgt: Language, side: 'top' | 'bottom') => {
    setIsProcessing(true);
    try {
      const result = await translateAudio(base64, src, tgt);
      setLastResult(result);
      setLastSpeaker(side);
      
      // Auto-TTS for the target person
      if (tgt === Language.TIGRINYA) {
        const audio = await generateTTS(result.translated, true);
        await playRawAudio(audio);
      } else {
        const u = new SpeechSynthesisUtterance(result.translated);
        u.lang = 'fr-FR';
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col overflow-hidden">
      {/* Top Half (Flipped for the other person) */}
      <div className="flex-1 bg-indigo-900 flex flex-col rotate-180 p-8 relative">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
           {lastSpeaker === 'bottom' && lastResult ? (
             <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
               <p className="text-4xl font-bold text-white font-geez leading-tight">{lastResult.translated}</p>
               <p className="text-indigo-200 text-lg">[{lastResult.translatedPhonetic}]</p>
             </div>
           ) : (
             <p className="text-indigo-300 font-medium">En attente de traduction...</p>
           )}
        </div>
        <div className="flex justify-center pb-8">
          <button 
            onMouseDown={() => startRecording('top')}
            onMouseUp={stopRecording}
            onTouchStart={() => startRecording('top')}
            onTouchEnd={stopRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording === 'top' ? 'bg-red-500 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'bg-white/10 text-white'}`}
          >
            {isProcessing && lastSpeaker === 'top' ? <Loader2 className="animate-spin" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>
        <span className="absolute top-6 left-6 text-white/20 font-black tracking-widest text-xs uppercase">Partie Tigrinya</span>
      </div>

      {/* Control Bar */}
      <div className="h-16 bg-white flex items-center justify-between px-6 border-y border-slate-200">
        <button onClick={onClose} className="text-slate-500 flex items-center gap-2 font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Quitter
        </button>
        <div className="flex gap-2">
           <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'}`} />
           <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-200'}`} />
        </div>
        <button onClick={() => { setLastResult(null); setLastSpeaker(null); }} className="text-indigo-600 font-bold text-sm flex items-center gap-2">
          <RotateCw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Bottom Half (For the user) */}
      <div className="flex-1 bg-white flex flex-col p-8 relative">
        <span className="absolute top-6 left-6 text-slate-200 font-black tracking-widest text-xs uppercase">Partie Français</span>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
           {lastSpeaker === 'top' && lastResult ? (
             <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
               <p className="text-3xl font-bold text-slate-800">{lastResult.translated}</p>
               <p className="text-slate-400 text-lg italic">[{lastResult.translatedPhonetic}]</p>
             </div>
           ) : (
             <p className="text-slate-300 font-medium">Appuyez pour parler en Français</p>
           )}
        </div>
        <div className="flex justify-center pb-8">
          <button 
            onMouseDown={() => startRecording('bottom')}
            onMouseUp={stopRecording}
            onTouchStart={() => startRecording('bottom')}
            onTouchEnd={stopRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording === 'bottom' ? 'bg-red-500 scale-110 shadow-[0_0_50px_rgba(239,68,68,0.5)]' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'}`}
          >
             {isProcessing && lastSpeaker === 'bottom' ? <Loader2 className="animate-spin" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationMode;
