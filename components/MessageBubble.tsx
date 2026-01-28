
import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Copy, Check, Star, Loader2, Trash2 } from 'lucide-react';
import { Message, Language } from '../types';
import { generateTTS } from '../services/geminiService';
import { playRawAudio, initAudioContext } from '../services/audioUtils';
import TalkingAvatar from './TalkingAvatar';

interface MessageBubbleProps {
  message: Message;
  onLongPress: (message: Message) => void;
  onDelete: (id: string) => void;
  isFavorite?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onLongPress, onDelete, isFavorite }) => {
  const [isPlayingOrig, setIsPlayingOrig] = useState(false);
  const [isPlayingTrans, setIsPlayingTrans] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleSpeak = async (type: 'original' | 'translated') => {
    await initAudioContext();
    const isOriginal = type === 'original';
    const isPlaying = isOriginal ? isPlayingOrig : isPlayingTrans;
    const setIsPlaying = isOriginal ? setIsPlayingOrig : setIsPlayingTrans;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = isOriginal ? message.originalText : message.translatedText;
    const langToSpeak = isOriginal ? message.sourceLang : message.targetLang;
    
    try {
      if (langToSpeak === Language.TIGRINYA) {
        setIsLoadingTTS(true);
        setIsPlaying(true);
        const base64Audio = await generateTTS(textToSpeak, true);
        setIsLoadingTTS(false);
        await playRawAudio(base64Audio);
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = langToSpeak === Language.FRENCH ? 'fr-FR' : 'en-US';
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error(error);
      setIsLoadingTTS(false);
      setIsPlaying(false);
    }
  };

  const isTigrinyaSource = message.sourceLang === Language.TIGRINYA;
  const isTigrinyaTarget = message.targetLang === Language.TIGRINYA;

  return (
    <div className={`flex flex-col gap-1 mb-6 animate-in slide-in-from-bottom-2 duration-300 select-none`}>
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          {message.sourceLang} → {message.targetLang}
          {isFavorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
        </span>
        <button onClick={() => onDelete(message.id)} className="p-1 text-slate-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>

      <div 
        onMouseDown={() => (timerRef.current = window.setTimeout(() => onLongPress(message), 700))}
        onMouseUp={() => timerRef.current && clearTimeout(timerRef.current)}
        className={`bg-white rounded-[28px] p-5 shadow-sm border ${isFavorite ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'}`}
      >
        <div className="mb-4 flex gap-4 items-start">
          <TalkingAvatar isTalking={isPlayingOrig} size="sm" />
          <div className="flex-1">
            <p className={`text-slate-600 text-sm leading-relaxed ${isTigrinyaSource ? 'font-geez' : ''}`}>{message.originalText}</p>
            <p className="text-[11px] text-slate-400 italic mt-0.5">[{message.originalPhonetic}]</p>
          </div>
          <button onClick={() => handleSpeak('original')} className={`p-2 rounded-full transition-all ${isPlayingOrig ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-[1px] bg-slate-50 w-full mb-4"></div>

        <div className="flex gap-4 items-start">
          <TalkingAvatar isTalking={isPlayingTrans} size="sm" />
          <div className="flex-1">
            <p className={`text-indigo-600 font-bold leading-relaxed ${isTigrinyaTarget ? 'font-geez text-lg' : 'text-base'}`}>{message.translatedText}</p>
            <p className="text-[11px] text-indigo-400 italic mt-0.5">[{message.translatedPhonetic}]</p>
          </div>
          <button onClick={() => handleSpeak('translated')} className={`p-2 rounded-full transition-all ${isPlayingTrans ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
            {isLoadingTTS && isPlayingTrans ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
