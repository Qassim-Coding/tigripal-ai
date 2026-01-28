
import React, { useState, useRef, useCallback } from 'react';
import { Mic, Loader2, ArrowLeftRight } from 'lucide-react';
import { Language } from '../types';
import { initAudioContext } from '../services/audioUtils';

interface RecorderProps {
  onRecordComplete: (base64Audio: string) => void;
  isProcessing: boolean;
  sourceLang: Language;
  targetLang: Language;
  onLanguageChange: (source: Language, target: Language) => void;
}

const Recorder: React.FC<RecorderProps> = ({ 
  onRecordComplete, 
  isProcessing, 
  sourceLang,
  targetLang,
  onLanguageChange
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const langs = [
    { id: Language.FRENCH, label: 'FR' },
    { id: Language.ENGLISH, label: 'EN' },
    { id: Language.TIGRINYA, label: 'TI' }
  ];

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // On coupe les pistes du micro immédiatement
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);
  }, []);

  const startRecording = async () => {
    if (isProcessing || isRecording) return;

    try {
      await initAudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            onRecordComplete(base64);
          };
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erreur micro:", err);
      alert("Impossible d'accéder au microphone.");
      setIsRecording(false);
    }
  };

  const swapLanguages = () => {
    if (isProcessing) return;
    onLanguageChange(targetLang, sourceLang);
  };

  return (
    <div className="fixed bottom-24 left-0 right-0 px-6 z-50 pointer-events-none">
      <div className="max-w-sm mx-auto bg-white/95 backdrop-blur-xl rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/50 p-5 pointer-events-auto">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50">
            <div className="flex-1 flex gap-1">
              {langs.map(l => (
                <button
                  key={`src-${l.id}`}
                  disabled={isProcessing}
                  onClick={() => onLanguageChange(l.id, targetLang)}
                  className={`flex-1 py-2 rounded-full text-[10px] font-black transition-all ${sourceLang === l.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            
            <button 
              onClick={swapLanguages} 
              disabled={isProcessing}
              className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-indigo-600 transition-colors disabled:opacity-30"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <div className="flex-1 flex gap-1">
              {langs.map(l => (
                <button
                  key={`tgt-${l.id}`}
                  disabled={isProcessing}
                  onClick={() => onLanguageChange(sourceLang, l.id)}
                  className={`flex-1 py-2 rounded-full text-[10px] font-black transition-all ${targetLang === l.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              disabled={isProcessing}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={isRecording ? stopRecording : undefined}
              onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
              onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
              className={`group relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 active:scale-90 ${
                isRecording 
                  ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                  : isProcessing 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white shadow-[0_10px_25px_rgba(79,70,229,0.3)] hover:shadow-indigo-400'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Mic className={`w-7 h-7 ${isRecording ? 'animate-pulse' : 'group-hover:scale-110'}`} />
              )}
              
              {isRecording && (
                <div className="absolute -inset-3 rounded-full border-2 border-red-500/30 animate-ping" />
              )}
              
              <div className={`absolute -bottom-1 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter shadow-sm transition-all ${isRecording ? 'bg-red-600 text-white translate-y-2' : 'bg-slate-800 text-white opacity-0'}`}>
                Enregistrement...
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recorder;
