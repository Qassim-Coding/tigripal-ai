
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';
import Recorder from './components/Recorder';
import LexiconView from './components/LexiconView';
import SurvivalKit from './components/SurvivalKit';
import TipsView from './components/TipsView';
import LanguageTipsDetail from './components/LanguageTipsDetail';
import HistoryView from './components/HistoryView';
import BottomNav from './components/BottomNav';
import VisionScanner from './components/VisionScanner';
import { Message, Language, FavoriteItem, ViewType, TranslationScanResult } from './types';
import { translateAudio } from './services/geminiService';
import { Sparkles, Lightbulb, Info, AlertCircle, Camera, RefreshCcw } from 'lucide-react';

const APP_TIPS = [
  { title: "Mode Vision", content: "Vous pouvez désormais traduire des panneaux ou des documents en prenant une photo." },
  { title: "Prononciation Tigrinya", content: "Le Tigrinya est une langue tonale. Écoutez bien la fin des mots." },
  { title: "Politesse", content: "En Tigrinya, utiliser 'በጃኹም' (Bejakhum) est aussi crucial que notre 'S'il vous plaît'." }
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState<Language>(Language.FRENCH);
  const [targetLang, setTargetLang] = useState<Language>(Language.TIGRINYA);
  const [activeView, setActiveView] = useState<ViewType>(ViewType.CHAT);
  const [selectedTipLanguage, setSelectedTipLanguage] = useState<Language>(Language.FRENCH);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedFavs = localStorage.getItem('tigripal_favorites');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    const savedHistory = localStorage.getItem('tigripal_history');
    if (savedHistory) setMessages(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('tigripal_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('tigripal_history', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeView === ViewType.CHAT) scrollToBottom();
  }, [messages, activeView]);

  const handleRecordComplete = async (base64Audio: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await translateAudio(base64Audio, sourceLang, targetLang);
      addMessageFromResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVisionComplete = (result: TranslationScanResult) => {
    addMessageFromResult(result);
  };

  const addMessageFromResult = (result: any) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      originalText: result.original,
      originalPhonetic: result.originalPhonetic || "",
      translatedText: result.translated,
      translatedPhonetic: result.translatedPhonetic || "",
      sourceLang: sourceLang,
      targetLang: targetLang,
      timestamp: Date.now(),
      fullData: result.allVersions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleFavorite = (message: Message) => {
    if (!message.fullData) return;
    const existingIndex = favorites.findIndex(f => f.id === message.id);
    if (existingIndex !== -1) {
      setFavorites(prev => prev.filter(f => f.id !== message.id));
    } else {
      const newFav: FavoriteItem = {
        id: message.id,
        fr: message.fullData.fr,
        frPhonetic: message.fullData.frPhonetic,
        ti: message.fullData.ti,
        tiPhonetic: message.fullData.tiPhonetic,
        en: message.fullData.en,
        enPhonetic: message.fullData.enPhonetic,
        timestamp: Date.now()
      };
      setFavorites(prev => [newFav, ...prev]);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case ViewType.PHOTO:
        return <VisionScanner onClose={() => setActiveView(ViewType.CHAT)} onSaveResult={handleVisionComplete} />;
      case ViewType.HISTORY:
        return <HistoryView 
          messages={messages} 
          favorites={favorites} 
          onToggleFavorite={toggleFavorite} 
          onDelete={id => setMessages(m => m.filter(x => x.id !== id))}
          onClose={() => setActiveView(ViewType.CHAT)} 
        />;
      case ViewType.LEXICON:
        return <LexiconView favorites={favorites} onRemove={id => setFavorites(f => f.filter(x => x.id !== id))} onClose={() => setActiveView(ViewType.CHAT)} />;
      case ViewType.SURVIVAL:
        return <SurvivalKit onClose={() => setActiveView(ViewType.CHAT)} />;
      case ViewType.TIPS:
        return <TipsView onClose={() => setActiveView(ViewType.CHAT)} onOpenDetail={openTipLanguage => { setSelectedTipLanguage(openTipLanguage); setActiveView(ViewType.TIPS_DETAIL); }} />;
      case ViewType.TIPS_DETAIL:
        return <LanguageTipsDetail lang={selectedTipLanguage} onClose={() => setActiveView(ViewType.TIPS)} />;
      case ViewType.CHAT:
      default:
        return (
          <div className="pt-6 pb-[320px]">
            {error && (
              <div className="mx-6 mb-6 p-6 bg-white border-2 border-red-100 rounded-[32px] shadow-xl shadow-red-50/50 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-red-900 uppercase tracking-tight mb-2">Configuration requise</p>
                    <div className="text-xs text-red-700/80 leading-relaxed whitespace-pre-wrap font-medium">
                      {error}
                    </div>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase text-white bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-full shadow-lg shadow-red-200 transition-all active:scale-95"
                    >
                      <RefreshCcw className="w-3 h-3" /> Recharger l'application
                    </button>
                  </div>
                </div>
              </div>
            )}

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[35vh] text-center space-y-6 px-8 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Bonjour !</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">Prêt pour une traduction vocale ou visuelle ?</p>
                </div>
              </div>
            ) : (
              <div className="px-4">
                <div className="mb-4">
                  <p className="text-[9px] text-center text-slate-300 font-black uppercase tracking-widest mb-6">Dernière conversation</p>
                  <MessageBubble 
                    message={messages[messages.length - 1]} 
                    onLongPress={toggleFavorite}
                    onDelete={id => setMessages(m => m.filter(x => x.id !== id))}
                    isFavorite={favorites.some(f => f.id === messages[messages.length - 1].id)}
                  />
                </div>
              </div>
            )}
            
            <div className="px-6 space-y-4">
              <button 
                onClick={() => setActiveView(ViewType.PHOTO)}
                className="w-full bg-slate-900 text-white p-6 rounded-[32px] flex items-center gap-4 shadow-xl active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-sm">Traduire une image</h3>
                  <p className="text-[10px] text-white/50 leading-tight">Panneaux, documents, menus...</p>
                </div>
              </button>

              <div className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm overflow-hidden relative">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-black text-slate-800 tracking-tight">Conseils TigriPal</h3>
                </div>
                <div className="space-y-4 mb-5">
                  {APP_TIPS.map((tip, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-5 h-5 shrink-0 rounded-full bg-slate-50 flex items-center justify-center">
                        <Info className="w-3 h-3 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-700 leading-none mb-1">{tip.title}</p>
                        <p className="text-[10px] text-slate-500 leading-snug">{tip.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div ref={messagesEndRef} />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto shadow-2xl bg-white overflow-hidden relative">
      <Header activeView={activeView} setActiveView={setActiveView} favoritesCount={favorites.length} />
      <main className="flex-1 overflow-y-auto relative bg-slate-50/30">{renderContent()}</main>
      
      {activeView === ViewType.CHAT && (
        <Recorder 
          onRecordComplete={handleRecordComplete} 
          isProcessing={isProcessing}
          sourceLang={sourceLang}
          targetLang={targetLang}
          onLanguageChange={(s, t) => { setSourceLang(s); setTargetLang(t); }}
        />
      )}

      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;
