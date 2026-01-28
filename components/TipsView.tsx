
import React from 'react';
import { ArrowLeft, Zap, Globe, Star, Shield, ArrowRight, BookOpen, Info } from 'lucide-react';
import { ALL_TIPS } from '../constants/tipsData';
import { Language } from '../types';

interface TipsViewProps {
  onClose: () => void;
  onOpenDetail: (lang: Language) => void;
}

const TipsView: React.FC<TipsViewProps> = ({ onClose, onOpenDetail }) => {
  const categories = [
    { lang: Language.TIGRINYA, cat: 'TI', label: 'Tigrinya 🇪🇷', icon: <Globe className="w-4 h-4" />, color: 'emerald' },
    { lang: Language.FRENCH, cat: 'FR', label: 'Français 🇫🇷', icon: <Star className="w-4 h-4" />, color: 'indigo' },
    { lang: Language.ENGLISH, cat: 'EN', label: 'Anglais 🇬🇧', icon: <Shield className="w-4 h-4" />, color: 'amber' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="p-6 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center -ml-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tips</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Guide linguistique</p>
          </div>
        </div>
        <div className="bg-indigo-50 p-2.5 rounded-full shadow-inner">
           <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-12 pb-32">
        {/* Instruction Section */}
        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-[32px] flex gap-4 shadow-sm">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
            <Info className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs text-indigo-700 leading-relaxed font-medium">
            Découvrez nos 30 conseils d'experts par langue. Cliquez sur <strong>"En savoir plus"</strong> à la fin de chaque section pour accéder à la liste complète.
          </p>
        </div>

        {categories.map((group) => {
          const tips = ALL_TIPS.filter(t => t.cat === group.cat).slice(0, 5);
          const colorClasses = {
            emerald: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', btn: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', border: 'hover:border-emerald-200', zap: 'bg-emerald-50 text-emerald-600' },
            indigo: { iconBg: 'bg-indigo-100', iconText: 'text-indigo-600', btn: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100', border: 'hover:border-indigo-200', zap: 'bg-indigo-50 text-indigo-600' },
            amber: { iconBg: 'bg-amber-100', iconText: 'text-amber-600', btn: 'bg-amber-50 text-amber-600 hover:bg-amber-100', border: 'hover:border-amber-200', zap: 'bg-amber-50 text-amber-600' },
          }[group.color as 'emerald' | 'indigo' | 'amber'];

          return (
            <section key={group.cat}>
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className={`w-9 h-9 rounded-full ${colorClasses.iconBg} flex items-center justify-center ${colorClasses.iconText} shadow-sm`}>
                  {group.icon}
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{group.label}</h3>
              </div>
              <div className="grid gap-3 mb-4">
                {tips.map((t, i) => (
                  <div key={i} className={`bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm transition-colors ${colorClasses.border}`}>
                    <div className="flex items-start gap-3">
                       <div className={`${colorClasses.zap} w-7 h-7 flex items-center justify-center rounded-full shrink-0 mt-0.5 shadow-sm`}>
                          <Zap className="w-3.5 h-3.5" />
                       </div>
                       <div>
                         <p className="font-bold text-slate-800 text-[13px] mb-1">{t.title}</p>
                         <p className="text-xs text-slate-500 leading-relaxed">{t.text}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => onOpenDetail(group.lang)}
                className={`w-full py-4 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${colorClasses.btn}`}
              >
                En savoir plus <ArrowRight className="w-4 h-4" />
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default TipsView;
