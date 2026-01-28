
import React, { useState } from 'react';
import { Clock, Star, Volume2, Search, ArrowLeft, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import { Message, Language, FavoriteItem } from '../types';
import { generateTTS } from '../services/geminiService';
import { playRawAudio, initAudioContext } from '../services/audioUtils';

interface HistoryViewProps {
  messages: Message[];
  favorites: FavoriteItem[];
  onToggleFavorite: (message: Message) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ messages, favorites, onToggleFavorite, onDelete, onClose }) => {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = messages
    .filter(m => 
      m.originalText.toLowerCase().includes(search.toLowerCase()) || 
      m.translatedText.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleSpeak = async (text: string, lang: Language, msgId: string, type: string) => {
    const id = `${msgId}-${type}`;
    try {
      setLoadingId(id);
      await initAudioContext();
      if (lang === Language.TIGRINYA) {
        const audio = await generateTTS(text, true);
        await playRawAudio(audio);
      } else {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === Language.FRENCH ? 'fr-FR' : 'en-US';
        window.speechSynthesis.speak(u);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const isFav = (id: string) => favorites.some(f => f.id === id);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Historique</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Vos dernières traductions</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Rechercher dans l'historique..."
            className="w-full bg-slate-100 border-none rounded-full py-3.5 pl-11 pr-5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {filtered.map(msg => (
          <div key={msg.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                {new Date(msg.timestamp).toLocaleDateString()} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => onToggleFavorite(msg)} 
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${isFav(msg.id) ? 'bg-amber-50 text-amber-400' : 'text-slate-300 hover:bg-slate-50'}`}
                >
                  <Star className={`w-4 h-4 ${isFav(msg.id) ? 'fill-amber-400' : ''}`} />
                </button>
                <button 
                  onClick={() => onDelete(msg.id)} 
                  className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Original */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className={`text-slate-600 text-sm ${msg.sourceLang === Language.TIGRINYA ? 'font-geez' : ''}`}>{msg.originalText}</p>
                  <p className="text-[10px] text-slate-400 italic mt-0.5">[{msg.originalPhonetic}]</p>
                </div>
                <button 
                  onClick={() => handleSpeak(msg.originalText, msg.sourceLang, msg.id, 'orig')} 
                  className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 transition-all"
                >
                  {loadingId === `${msg.id}-orig` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="h-[1px] bg-slate-50 w-full"></div>

              {/* Translated */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className={`text-indigo-600 font-bold ${msg.targetLang === Language.TIGRINYA ? 'font-geez text-lg leading-tight' : 'text-base'}`}>{msg.translatedText}</p>
                  <p className="text-[10px] text-indigo-400 italic mt-0.5">[{msg.translatedPhonetic}]</p>
                </div>
                <button 
                  onClick={() => handleSpeak(msg.translatedText, msg.targetLang, msg.id, 'trans')} 
                  className="w-8 h-8 flex items-center justify-center bg-indigo-50 rounded-full text-indigo-600 transition-all"
                >
                  {loadingId === `${msg.id}-trans` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-300">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Aucune traduction dans l'historique.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
