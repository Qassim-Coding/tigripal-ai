
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, ArrowLeftRight, Check, Edit3, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { Language, TranslationScanResult } from '../types';
import { translateImage } from '../services/geminiService';

interface Props {
  onClose: () => void;
  onSaveResult: (result: TranslationScanResult) => void;
}

const VisionScanner: React.FC<Props> = ({ onClose, onSaveResult }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [result, setResult] = useState<TranslationScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceLang, setSourceLang] = useState(Language.FRENCH);
  const [targetLang, setTargetLang] = useState(Language.TIGRINYA);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError("Accès caméra refusé. Vérifiez les réglages de votre navigateur.");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    const base64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    setPreviewImage(canvasRef.current.toDataURL('image/jpeg'));
    stopCamera();
    processImage(base64);
  };

  const processImage = async (base64: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await translateImage(base64, sourceLang, targetLang);
      setResult(res);
      setEditedText(res.original);
    } catch (err: any) {
      setError(err.message || "Échec de l'analyse visuelle.");
      setPreviewImage(null);
      startCamera();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setPreviewImage(reader.result as string);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between text-white bg-black/50 backdrop-blur-md absolute top-0 left-0 right-0 z-10">
        <button onClick={onClose} className="p-2"><X className="w-6 h-6" /></button>
        <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <span className="text-xs font-bold">{sourceLang === Language.FRENCH ? 'FR' : 'TI'}</span>
          <ArrowLeftRight className="w-3 h-3 opacity-50" />
          <span className="text-xs font-bold">{targetLang === Language.TIGRINYA ? 'TI' : 'FR'}</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-900">
        {error && (
          <div className="absolute top-20 left-6 right-6 z-20 bg-red-500/90 text-white p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold">Erreur</p>
              <p className="text-[11px] leading-tight opacity-90">{error}</p>
            </div>
          </div>
        )}

        {!previewImage ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-white/30 rounded-lg relative">
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1 rounded-tl-sm" />
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1 rounded-tr-sm" />
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1 rounded-bl-sm" />
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1 rounded-br-sm" />
              </div>
            </div>
          </>
        ) : (
          <img src={previewImage} className="w-full h-full object-contain" />
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold">Analyse multimodale...</h3>
            <p className="text-sm text-white/60">Extraction du texte par Gemini Flash.</p>
          </div>
        )}
      </div>

      {/* Footer / Results */}
      {result ? (
        <div className="bg-white rounded-t-[40px] p-6 max-h-[60vh] overflow-y-auto animate-in slide-in-from-bottom duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                Confiance {Math.round(result.confidence * 100)}%
              </div>
            </div>
            <button onClick={() => { setResult(null); setPreviewImage(null); startCamera(); }} className="p-2 text-slate-400">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl relative">
              <p className="text-[10px] font-black text-slate-300 uppercase mb-2">Texte original (OCR)</p>
              {isEditing ? (
                <textarea 
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full bg-white border border-indigo-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                />
              ) : (
                <p className="text-slate-700 text-sm leading-relaxed">{editedText}</p>
              )}
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="absolute top-4 right-4 text-indigo-500 p-2"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </button>
            </div>

            <div className="bg-indigo-600 p-5 rounded-3xl text-white shadow-xl shadow-indigo-100">
              <p className="text-[10px] font-black text-white/50 uppercase mb-2">Traduction</p>
              <p className={`text-xl font-bold ${targetLang === Language.TIGRINYA ? 'font-geez' : ''}`}>{result.translated}</p>
              <p className="text-indigo-200 text-xs italic mt-1">[{result.translatedPhonetic}]</p>
            </div>
          </div>

          <button 
            onClick={() => { onSaveResult(result); onClose(); }}
            className="w-full py-4 bg-slate-900 text-white rounded-full font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Check className="w-5 h-5" /> Ajouter à l'historique
          </button>
        </div>
      ) : !isProcessing && (
        <div className="p-8 pb-12 flex items-center justify-around bg-black/80 backdrop-blur-xl">
          <label className="p-4 bg-white/10 rounded-full text-white cursor-pointer active:scale-90 transition-all">
            <ImageIcon className="w-6 h-6" />
            <input type="file" accept="image/*" className="hidden" onChange={handleGallery} />
          </label>
          
          <button 
            onClick={capture}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-90 transition-all"
          >
            <div className="w-16 h-16 border-4 border-slate-900 rounded-full" />
          </button>

          <div className="w-14" /> {/* Spacer */}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default VisionScanner;
