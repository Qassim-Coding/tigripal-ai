
import React from 'react';
import { ArrowLeft, Zap, Globe, Star, Shield } from 'lucide-react';
import { ALL_TIPS } from '../constants/tipsData';
import { Language } from '../types';

interface Props {
  lang: Language;
  onClose: () => void;
}

const LanguageTipsDetail: React.FC<Props> = ({ lang, onClose }) => {
  const cat = lang === Language.TIGRINYA ? 'TI' : lang === Language.FRENCH ? 'FR' : 'EN';
  const tips = ALL_TIPS.filter(t => t.cat === cat);
  
  const getStyle = () => {
    if (lang === Language.TIGRINYA) return { icon: <Globe />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' };
    if (lang === Language.FRENCH) return { icon: <Star />, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'hover:border-indigo-200' };
    return { icon: <Shield />, color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-200' };
  };

  const style = getStyle();

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="p-6 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tips {lang}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Guide Complet - 30 conseils</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        {tips.map((t, i) => (
          <div key={i} className={`bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm transition-colors ${style.border}`}>
            <div className="flex items-start gap-4">
              <div className={`${style.bg} ${style.color} w-8 h-8 flex items-center justify-center rounded-full shrink-0 mt-0.5 shadow-sm`}>
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-[13px] mb-1">{t.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{t.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageTipsDetail;
