import React, { useEffect, useState } from 'react';
import { FashionAnalysis } from '../types';
import { Star, ArrowRight, CheckCircle2, Palette } from 'lucide-react';
import { Button } from './Button';

interface AnalysisResultProps {
  analysis: FashionAnalysis;
  onReset: () => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, onReset }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`w-full max-w-4xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      
      {/* Score Section */}
      <div className="text-center mb-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">穿搭指数</h2>
        <div className="flex items-baseline justify-center gap-2">
          <span className={`text-8xl font-bold tracking-tighter ${getScoreColor(analysis.score)}`}>
            {analysis.score}
          </span>
          <span className="text-3xl text-neutral-300 font-light">/10</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10 px-4 md:px-0">
        {/* Critique Card */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-neutral-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-neutral-100 rounded-full">
              <Star className="w-4 h-4 text-neutral-900" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">专业点评</h3>
          </div>
          <p className="text-neutral-600 leading-relaxed text-base text-justify">
            {analysis.critique}
          </p>
        </div>

        {/* Palette Card */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-neutral-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-neutral-100 rounded-full">
              <Palette className="w-4 h-4 text-neutral-900" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">色彩灵感</h3>
          </div>
          <div className="flex gap-3 mt-6 justify-center md:justify-start">
            {analysis.colorPalette.map((color, index) => (
              <div key={index} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div 
                  className="w-12 h-12 rounded-full shadow-inner border border-black/5 transition-transform group-hover:scale-110" 
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <span className="text-[10px] uppercase font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="mx-4 md:mx-0 bg-neutral-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <h3 className="text-xl font-semibold mb-8 relative z-10 flex items-center gap-2">
          <span className="w-1 h-6 bg-yellow-500 rounded-full block"></span>
          优化建议
        </h3>
        <div className="grid gap-6 relative z-10">
          {analysis.suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5 text-neutral-500" />
              </div>
              <p className="text-lg text-neutral-200 font-light leading-relaxed">
                {suggestion}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pb-20 px-4">
        <Button onClick={onReset} variant="outline" className="gap-2 w-full md:w-auto h-14 md:h-12 text-base">
          分析下一套 <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

    </div>
  );
};