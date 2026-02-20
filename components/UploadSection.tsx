import React, { useRef, useState } from 'react';
import { Image as ImageIcon, X, Sparkles, Camera } from 'lucide-react';
import { Button } from './Button';

interface UploadSectionProps {
  onImageSelected: (base64: string) => void;
  isAnalyzing: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelected, isAnalyzing }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset value to allow selecting the same file again
    event.target.value = '';
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件。');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8 mb-12 animate-fade-in-up px-4 md:px-0">
      {!preview ? (
        <div
          className={`relative flex flex-col items-center justify-center w-full h-auto min-h-[360px] md:h-96 rounded-[2rem] border-2 border-dashed transition-all duration-300 ease-out shadow-sm overflow-hidden
            ${isDragging ? 'border-neutral-800 bg-neutral-50 scale-[1.01]' : 'border-neutral-200 bg-white'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-50/50 rounded-[2rem] pointer-events-none" />
          
          <div className="flex flex-col items-center text-center p-8 z-10 w-full max-w-sm">
            <div className="w-20 h-20 mb-6 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center shadow-sm">
              <Sparkles className="w-8 h-8 text-neutral-400" />
            </div>
            
            <h3 className="text-xl font-bold text-neutral-900 mb-2">上传你的穿搭</h3>
            <p className="text-neutral-500 mb-8 leading-relaxed">
              拍摄或上传全身照，<br/>获取专业的时尚分析与建议
            </p>

            <div className="flex flex-col gap-3 w-full">
              <Button onClick={handleCameraClick} className="w-full gap-2 h-14 text-lg shadow-lg shadow-neutral-200/50">
                <Camera className="w-5 h-5" />
                拍摄照片
              </Button>
              <Button variant="secondary" onClick={handleGalleryClick} className="w-full gap-2 h-14 text-lg bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600">
                <ImageIcon className="w-5 h-5" />
                从相册选择
              </Button>
            </div>
            
            <p className="mt-6 text-xs text-neutral-300 font-medium">
              支持 JPG, PNG 格式
            </p>
          </div>

          {/* Hidden Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-neutral-900/5 bg-white aspect-[3/4] md:aspect-square mx-auto max-w-md">
           <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          
          <button 
            onClick={clearImage}
            disabled={isAnalyzing}
            className="absolute top-4 right-4 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-all active:scale-95 disabled:opacity-0"
          >
            <X className="w-5 h-5" />
          </button>

          {isAnalyzing && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-xl flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-neutral-900 animate-pulse" />
                </div>
              </div>
              <p className="mt-6 text-lg font-medium text-neutral-900 animate-pulse tracking-wide">正在分析细节...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};