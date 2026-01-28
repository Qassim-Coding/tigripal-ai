
import React, { useState } from 'react';
import { Briefcase, Volume2, ArrowLeft, Loader2, Search } from 'lucide-react';
import { SURVIVAL_PHRASES } from '../constants/phrases';
import { generateTTS } from '../services/geminiService';
import { playRawAudio } from '../services/audioUtils';
import { StaticPhrase } from '../types';

interface SurvivalKitProps {
  onClose: () => void;
}

const SurvivalKit: React.FC<SurvivalKitProps> = ({ onClose }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = SURVIVAL_PHRASES.filter(p => 
    p.fr.toLowerCase().includes(search.toLowerCase()) || 
    p.ti.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSpeak = async (phrase: StaticPhrase, lang: 'fr' | 'ti') => {
    try {
      if (lang === 'ti') {
        setLoadingId(`${phrase.id}-ti`);
        // On demande explicitement le Tigrinya au modèle TTS
        const base64Audio = await generateTTS(phrase.ti, true);
        if (base64Audio) {
          await playRawAudio(base64Audio);
        }
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phrase.fr);
        utterance.lang = 'fr-FR';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("TTS error:", error);
      alert("La synthèse vocale a échoué. Vérifiez votre connexion.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="p-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-2 -ml-2 text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Kit de Survie</h2>
            <p className="text-xs text-slate-500">30 phrases essentielles pour le travail</p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher une expression..."
            className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-20 opacity-40">
              <p className="text-sm font-medium">Aucun résultat pour cette recherche.</p>
            </div>
          ) : (
            filtered.map((phrase) => (
              <div key={phrase.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase mb-2 inline-block">
                      {phrase.category}
                    </span>
                    <p className="text-slate-800 font-semibold text-base">{phrase.fr}</p>
                    <p className="text-[11px] text-slate-400 italic">[{phrase.frPhonetic}]</p>
                  </div>
                  <button 
                    onClick={() => handleSpeak(phrase, 'fr')}
                    className="p-2.5 text-indigo-500 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="h-[1px] bg-slate-50 w-full"></div>
                
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-indigo-600 font-bold text-lg font-geez leading-tight">{phrase.ti}</p>
                    <p className="text-[11px] text-indigo-400 italic">[{phrase.tiPhonetic}]</p>
                  </div>
                  <button 
                    onClick={() => handleSpeak(phrase, 'ti')}
                    disabled={loadingId === `${phrase.id}-ti`}
                    className="p-2.5 text-emerald-500 bg-emerald-50 rounded-full hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                  >
                    {loadingId === `${phrase.id}-ti` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 text-center text-[10px] text-slate-400 font-medium">
        Données disponibles hors-ligne après chargement initial.
      </div>
    </div>
  );
};

export default SurvivalKit;
