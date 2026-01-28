
import React from 'react';
import { Clock, BookMarked, Briefcase, Camera } from 'lucide-react';
import { ViewType } from '../types';

interface BottomNavProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  const tabs = [
    { id: ViewType.HISTORY, icon: <Clock />, label: 'Historique' },
    { id: ViewType.PHOTO, icon: <Camera />, label: 'Scanner' },
    { id: ViewType.LEXICON, icon: <BookMarked />, label: 'Lexique' },
    { id: ViewType.SURVIVAL, icon: <Briefcase />, label: 'Kit' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 px-6 z-[60] pointer-events-none">
      <nav className="max-w-[320px] mx-auto bg-white/90 backdrop-blur-xl border border-slate-200/50 px-3 py-2 rounded-full flex justify-between items-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex flex-col items-center gap-0.5 transition-all duration-300 px-3 py-1 rounded-full ${isActive ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className="w-6 h-6 flex items-center justify-center transition-all">
                {React.cloneElement(tab.icon as React.ReactElement, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
