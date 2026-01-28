
import React from 'react';
import { Languages, BookMarked, MessageSquare, Briefcase } from 'lucide-react';
import { ViewType } from '../types';

interface HeaderProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  favoritesCount: number;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, favoritesCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm">
      <div 
        className="flex items-center gap-2 group cursor-pointer active:scale-95 transition-transform" 
        onClick={() => setActiveView(ViewType.CHAT)}
      >
        <div className={`p-2 rounded-full shadow-sm transition-colors ${activeView === ViewType.CHAT ? 'bg-indigo-600 shadow-indigo-100' : 'bg-slate-100 group-hover:bg-indigo-100'}`}>
          <Languages className={`w-5 h-5 ${activeView === ViewType.CHAT ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-800">TigriPal AI</h1>
          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Traduire pour travailler ensemble</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* L'utilisateur peut aussi retourner au chat via une icône dédiée si besoin, ou on garde le design propre */}
        <div className="flex bg-slate-50 p-1 rounded-full border border-slate-100">
          <button 
            onClick={() => setActiveView(ViewType.CHAT)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${activeView === ViewType.CHAT ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
