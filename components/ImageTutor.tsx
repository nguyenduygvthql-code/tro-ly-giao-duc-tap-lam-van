
import React, { useState, useRef } from 'react';
import { analyzeImageForIdeas } from '../services/geminiService';
import { ImageAnalysisResult } from '../types';

export const ImageTutor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!previewUrl) return;
    setLoading(true);
    const base64Data = previewUrl.split(',')[1];
    try {
      const result = await analyzeImageForIdeas(base64Data);
      if (result) {
        setAnalysisResult(result);
      } else {
        alert("Cú Mèo chưa nhìn rõ bức ảnh này, bé thử lại nhé!");
      }
    } catch (e) {
      alert("Đã xảy ra lỗi khi phân tích ảnh.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 pb-32">
      {/* Header Section with Mascot */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="flex-1">
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight leading-tight mb-3">
            Cùng tìm <span className="text-primary">ý tưởng</span> nhé!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            Tải ảnh lên để <span className="text-primary font-bold">Cú Mèo</span> giúp bé tìm ý tưởng hay nha!
          </p>
        </div>
        
        {/* AI Owl Mascot */}
        <div className="flex items-end gap-4 relative">
          <div className="hidden md:block bg-white dark:bg-[#1e1b2e] p-4 rounded-2xl rounded-tr-none shadow-soft max-w-[200px] mb-8 relative border-2 border-indigo-50 dark:border-indigo-900/30 animate-bounce" style={{ animationDuration: "3s" }}>
            <p className="text-sm font-bold text-primary dark:text-primary-light leading-tight">
              {loading ? "Đang ngắm ảnh..." : analysisResult ? "Hú hú! Bé xem ý tưởng chưa?" : "Hú hú! Ảnh nào khó đã có Cú lo!"}
            </p>
            <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white dark:bg-[#1e1b2e] border-r-2 border-b-2 border-indigo-50 dark:border-indigo-900/30 transform rotate-45 translate-x-1/2"></div>
          </div>
          <div className="size-24 md:size-32 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center overflow-hidden shrink-0">
             <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6X_002Xr2jxitxDyOfsQa27cTbbeBwQZa_3m9UpTVqNpBaQTxLMSVkrrJ9LsVoxrvMyL4Vd8x-04-uqRKVtAF4aJTr4E2dMsmCxXuJIFanpNOnKerD3he6qICtr58RX-0lnVTwAa06lU-XfAwE51BUZSd7ij6DgYp4qBAwPEEXdXraNAPE6BHIzoc-MXkXCObrqrpIQGXeX0KK6esVcp9cIUXUta9QKjiRzwkc_T6Zpa6mQ7OkHVvvlRzURKd1_kylDG6JUKCHwqw" alt="Mascot" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* Upload Area & Action Button */}
      <section className="bg-white/80 backdrop-blur-md dark:bg-[#1e1b2e]/80 rounded-[2.5rem] p-8 shadow-soft border border-indigo-50/50 dark:border-indigo-900/20 flex flex-col gap-8">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-80 border-4 border-dashed border-indigo-200 dark:border-indigo-900/40 rounded-3xl bg-indigo-50/30 dark:bg-indigo-900/10 flex flex-col items-center justify-center gap-4 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group/upload relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#4b2bee 2px, transparent 2px)", backgroundSize: "24px 24px" }}></div>
          
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="h-full w-full object-contain relative z-10 p-4 drop-shadow-md" />
          ) : (
            <>
              <div className="size-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md group-hover/upload:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-primary text-4xl">add_photo_alternate</span>
              </div>
              <div className="text-center z-10">
                <p className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-1">Thả ảnh vào đây</p>
                <p className="text-slate-400 font-medium uppercase text-xs tracking-widest">Hoặc bấm để chọn từ máy tính</p>
              </div>
            </>
          )}
          <input type="file" ref={fileInputRef} onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setSelectedFile(file);
              const reader = new FileReader();
              reader.onloadend = () => { setPreviewUrl(reader.result as string); setAnalysisResult(null); };
              reader.readAsDataURL(file);
            }
          }} className="hidden" accept="image/*" />
        </div>

        {/* Action Button - Placed firmly inside the section with clear margin */}
        <div className="flex justify-center">
          <button 
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
            className="bg-primary hover:bg-primary-hover text-white text-xl font-black py-5 px-16 rounded-full shadow-xl shadow-primary/30 flex items-center gap-4 hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-2xl">auto_awesome</span>
            )}
            <span>{loading ? "Đang ngắm ảnh..." : "Xem ý tưởng ngay"}</span>
          </button>
        </div>
      </section>

      {/* Suggestions / Ideas Grid */}
      {analysisResult && (
        <section className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 px-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-1.5 bg-primary rounded-full"></div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Gợi ý của Cú Mèo:</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ai thế nhỉ? */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <span className="material-symbols-outlined text-2xl">person_search</span>
                </div>
                <h4 className="text-xl font-extrabold text-primary">Ai thế nhỉ?</h4>
              </div>
              {analysisResult.subjects.map((item, i) => (
                <div key={i} className="bg-white/80 dark:bg-[#1e1b2e]/80 backdrop-blur-sm p-5 rounded-2xl shadow-card border-b-4 border-b-primary/10 hover:border-b-primary hover:-translate-y-1 transition-all cursor-default group">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-lg">{item}</p>
                    <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors">sparkles</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Nhân vật chính</p>
                </div>
              ))}
            </div>

            {/* Ở đâu ta? */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-accent-green/10 p-2.5 rounded-xl text-accent-green">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <h4 className="text-xl font-extrabold text-accent-green">Ở đâu ta?</h4>
              </div>
              {analysisResult.locations.map((item, i) => (
                <div key={i} className="bg-white/80 dark:bg-[#1e1b2e]/80 backdrop-blur-sm p-5 rounded-2xl shadow-card border-b-4 border-b-accent-green/10 hover:border-b-accent-green hover:-translate-y-1 transition-all cursor-default group">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-lg">{item}</p>
                    <span className="material-symbols-outlined text-slate-200 group-hover:text-accent-green transition-colors">map</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Bối cảnh</p>
                </div>
              ))}
            </div>

            {/* Làm gì đấy? */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-accent-orange/10 p-2.5 rounded-xl text-accent-orange">
                  <span className="material-symbols-outlined text-2xl">sprint</span>
                </div>
                <h4 className="text-xl font-extrabold text-accent-orange">Làm gì đấy?</h4>
              </div>
              {analysisResult.actions.map((item, i) => (
                <div key={i} className="bg-white/80 dark:bg-[#1e1b2e]/80 backdrop-blur-sm p-5 rounded-2xl shadow-card border-b-4 border-b-accent-orange/10 hover:border-b-accent-orange hover:-translate-y-1 transition-all cursor-default group">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-lg">{item}</p>
                    <span className="material-symbols-outlined text-slate-200 group-hover:text-accent-orange transition-colors">bolt</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Hoạt động</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Sentences */}
          <div className="mt-16 space-y-6 pb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1.5 bg-primary/40 rounded-full"></div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">Câu văn mẫu gợi ý:</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisResult.sentences.map((sent, i) => (
                <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-[2.5rem] border-2 border-primary/5 shadow-soft relative overflow-hidden group hover:border-primary/20 transition-all">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20"></div>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-200 italic leading-relaxed group-hover:text-primary transition-colors">
                    "{sent}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
