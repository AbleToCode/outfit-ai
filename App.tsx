import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { AnalysisResult } from './components/AnalysisResult';
import { Button } from './components/Button';
import { analyzeOutfit } from './services/qwenService';
import { AppState, FashionAnalysis } from './types';
import { ArrowRight, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FashionAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = useCallback((base64: string) => {
    setCurrentImage(base64);
    setAppState(AppState.IDLE); // Ready to analyze
    setError(null);
  }, []);

  const handleAnalyze = async () => {
    if (!currentImage) return;

    setAppState(AppState.ANALYZING);
    try {
      const result = await analyzeOutfit(currentImage);
      setAnalysisResult(result);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      setAppState(AppState.ERROR);
      setError(err.message || '分析过程中出现错误，请重试。');
    }
  };

  const resetApp = () => {
    setCurrentImage(null);
    setAnalysisResult(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd]">
      <Header />

      <main className="flex-grow container mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-20">
        
        {/* Hero Section - Only show when no result */}
        {appState !== AppState.RESULT && (
          <div className="text-center max-w-2xl mx-auto mb-8 animate-fade-in-down">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 mb-6 leading-tight">
              提升你的 <br className="md:hidden" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-900">穿搭品味</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-500 font-normal leading-relaxed px-4">
              你的私人时尚顾问。上传全身照，即刻获取专业评分与搭配建议，发现更好的自己。
            </p>
          </div>
        )}

        {/* Main Interaction Area */}
        <div className="flex flex-col items-center w-full">
          
          {appState === AppState.RESULT && analysisResult ? (
            <AnalysisResult analysis={analysisResult} onReset={resetApp} />
          ) : (
            <>
              <UploadSection 
                onImageSelected={handleImageSelected} 
                isAnalyzing={appState === AppState.ANALYZING}
              />

              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              {currentImage && appState !== AppState.ANALYZING && (
                <div className="animate-fade-in-up delay-100 w-full md:w-auto px-4">
                  <Button 
                    onClick={handleAnalyze} 
                    className="gap-2 text-lg px-12 py-4 h-14 md:h-auto shadow-xl shadow-neutral-200/50 w-full md:w-auto rounded-full"
                  >
                    <Sparkles className="w-5 h-5" />
                    开始分析
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-neutral-400 border-t border-neutral-100/50">
        <p>© {new Date().getFullYear()} Outfit. All rights reserved.</p>
      </footer>

      {/* Tailwind Custom Animations */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-fade-in-down { animation: fadeInDown 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .delay-100 { animation-delay: 100ms; }
      `}</style>
    </div>
  );
};

export default App;