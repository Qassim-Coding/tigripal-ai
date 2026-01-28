
import React, { useState } from 'react';
import { Star, Trash2, Volume2, Search, ArrowLeft, Loader2, Globe, Copy, Check } from 'lucide-react';
import { FavoriteItem, Language } from '../types';
import { generateTTS } from '../services/geminiService';
import { playRawAudio } from '../services/audioUtils';

interface LexiconViewProps {
  favorites: FavoriteItem[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

const LexiconView: React.FC<LexiconViewProps> = ({ favorites, onRemove, onClose }) => {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [hasCopiedAll, setHasCopiedAll] = useState(false);

  const filtered = favorites.filter(f => 
    f.fr.toLowerCase().includes(search.toLowerCase()) || 
    f.en.toLowerCase().includes(search.toLowerCase()) || 
    f.ti.toLowerCase().includes(search.toLowerCase())
  );

  const handleSpeak = async (text: string, lang: Language, id: string) => {
    try {
      setLoadingId(`${id}-${lang}`);
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

  const copyAll = () => {
    const text = favorites.map(f => `FR: ${f.fr}\nEN: ${f.en}\nTI: ${f.ti}\n---`).join('\n');
    navigator.clipboard.writeText(text);
    setHasCopiedAll(true);
    setTimeout(() => setHasCopiedAll(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-6 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">Mon Lexique</h2>
          </div>
          {favorites.length > 0 && (
            <button 
              onClick={copyAll}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border border-indigo-100"
            >
              {hasCopiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {hasCopiedAll ? 'Copié !' : 'Copier tout'}
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="w-full bg-slate-100 border-none rounded-full py-3.5 pl-11 pr-5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {filtered.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 relative group">
            <button onClick={() => onRemove(item.id)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="space-y-4">
              {/* French */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mb-1">Français</p>
                  <p className="text-slate-800 font-medium text-sm">{item.fr}</p>
                </div>
                <button onClick={() => handleSpeak(item.fr, Language.FRENCH, item.id)} className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                  {loadingId === `${item.id}-${Language.FRENCH}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* English */}
              <div className="flex items-start gap-3 border-t border-slate-50 pt-3">
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mb-1">Anglais</p>
                  <p className="text-indigo-600 font-medium text-sm">{item.en}</p>
                </div>
                <button onClick={() => handleSpeak(item.en, Language.ENGLISH, item.id)} className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                  {loadingId === `${item.id}-${Language.ENGLISH}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Tigrinya */}
              <div className="flex items-start gap-3 border-t border-slate-50 pt-3">
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mb-1">Tigrinya</p>
                  <p className="text-emerald-600 font-bold text-lg font-geez leading-tight">{item.ti}</p>
                </div>
                <button onClick={() => handleSpeak(item.ti, Language.TIGRINYA, item.id)} className="w-9 h-9 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                  {loadingId === `${item.id}-${Language.TIGRINYA}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-300">
            <p className="text-sm">Aucun favori enregistré.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LexiconView;
