
import React, { useEffect, useRef, useState } from 'react';
import { LiveClient } from '../services/geminiService';

interface TranscriptItem {
  id: number;
  text: string;
  explanation?: string;
  callToAction?: string;
  isModel: boolean;
  timestamp: Date;
}

const DEFAULT_GREETING = "Chào em! Bé hãy bấm mic rồi đọc một câu văn trong bài tập làm văn của bé nhé. Thầy Cú sẽ nghe và giúp bé sửa cho thật hay!";

export const LiveTutor: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const clientRef = useRef<LiveClient | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTranscripts([{
      id: 0,
      text: DEFAULT_GREETING,
      isModel: true,
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const toggleConnection = async () => {
    if (isConnected) {
      clientRef.current?.disconnect();
      setIsConnected(false);
      clientRef.current = null;
    } else {
      const client = new LiveClient(
        (text, isModel) => {
          let rawText = text.trim();
          if (!rawText) return;

          // Cấu trúc: [Nhận xét] | [Câu mẫu] | [Lời mời]
          let mainText = rawText;
          let explanationText = "";
          let ctaText = "";

          if (isModel && rawText.includes('|')) {
            const parts = rawText.split('|');
            explanationText = parts[0]?.replace(/\*\*|\*|#|_/g, '').trim() || "";
            mainText = parts[1]?.replace(/\*\*|\*|#|_/g, '').trim() || "";
            ctaText = parts[2]?.replace(/\*\*|\*|#|_/g, '').trim() || "";
          } else {
            mainText = rawText.replace(/\*\*|\*|#|_/g, '').trim();
          }

          setTranscripts(prev => {
            if (prev.length > 0 && prev[prev.length - 1].text === mainText && isModel === prev[prev.length - 1].isModel) return prev;

            const newItem: TranscriptItem = {
              id: Date.now() + Math.random(),
              text: mainText,
              explanation: explanationText,
              callToAction: ctaText,
              isModel,
              timestamp: new Date()
            };
            return [...prev, newItem];
          });
        },
        (status) => setIsConnected(status)
      );
      clientRef.current = client;
      try { 
        await client.connect(); 
      } catch (e) { 
        alert("Bé kiểm tra lại Microphone nhé!"); 
        setIsConnected(false); 
      }
    }
  };

  useEffect(() => { return () => clientRef.current?.disconnect(); }, []);

  return (
    <div className="h-full flex flex-col lg:flex-row gap-8 pb-32 overflow-hidden">
      {/* Cột trái: Thầy Cú */}
      <div className="w-full lg:w-1/3 flex flex-col items-center justify-center gap-6 shrink-0">
        <div className={`relative transition-all duration-700 ${isConnected ? 'scale-110' : 'scale-100'}`}>
          {isConnected && (
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-20"></div>
          )}
          <div className={`size-56 md:size-72 rounded-[4rem] bg-white dark:bg-[#1e1b2e] shadow-soft border-8 border-white dark:border-gray-800 flex items-center justify-center relative z-10 overflow-hidden`}>
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6X_002Xr2jxitxDyOfsQa27cTbbeBwQZa_3m9UpTVqNpBaQTxLMSVkrrJ9LsVoxrvMyL4Vd8x-04-uqRKVtAF4aJTr4E2dMsmCxXuJIFanpNOnKerD3he6qICtr58RX-0lnVTwAa06lU-XfAwE51BUZSd7ij6DgYp4qBAwPEEXdXraNAPE6BHIzoc-MXkXCObrqrpIQGXeX0KK6esVcp9cIUXUta9QKjiRzwkc_T6Zpa6mQ7OkHVvvlRzURKd1_kylDG6JUKCHwqw" 
              alt="Mascot" 
              className={`w-4/5 h-4/5 object-contain transition-all ${isConnected ? 'animate-bounce' : 'grayscale opacity-50'}`}
              style={{ animationDuration: '3s' }}
            />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Thầy Giáo Cú Mèo</h2>
          <div className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest inline-block shadow-sm">
            Dạy Văn Siêu Vui
          </div>
        </div>

        <button
          onClick={toggleConnection}
          className={`px-12 py-6 rounded-full text-xl font-black shadow-2xl flex items-center gap-4 transition-all active:scale-95 ${
            isConnected ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-primary text-white shadow-primary/30'
          }`}
        >
          <span className="material-symbols-outlined text-3xl">{isConnected ? 'stop_circle' : 'mic_external_on'}</span>
          {isConnected ? 'Thầy đang nghe...' : 'Bắt đầu luyện nói'}
        </button>
      </div>

      {/* Cột phải: Chat Log */}
      <div className="flex-1 flex flex-col min-h-[500px] h-full">
        <div className="flex-1 glass-panel rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/50 relative">
          <div className="px-10 py-6 bg-white/40 dark:bg-black/20 border-b border-white/20 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">school</span>
              Lớp Học Tiếng Việt Của Thầy Cú
            </h3>
            {isConnected && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></span>
                <span className="text-xs font-black text-emerald-500 uppercase">Đang thu âm...</span>
              </div>
            )}
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 md:px-10 py-10 flex flex-col gap-12 custom-scrollbar"
          >
            {transcripts.map((item) => (
              <div 
                key={item.id}
                className={`flex flex-col gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ${item.isModel ? 'items-start' : 'items-end'}`}
              >
                {!item.isModel ? (
                  <div className="flex flex-col items-end max-w-[80%]">
                    <span className="text-[10px] font-black text-slate-400 uppercase mr-3 mb-1 tracking-widest">Bé vừa nói:</span>
                    <div className="px-8 py-5 bg-indigo-50 dark:bg-gray-800 rounded-[2.5rem] rounded-tr-none text-slate-700 dark:text-slate-300 shadow-sm italic text-xl font-semibold border-2 border-indigo-100 dark:border-indigo-900/50">
                      "{item.text}"
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-6 w-full max-w-[95%]">
                    {/* Bước 1, 2, 3: Nhận xét & Soi lỗi */}
                    {item.explanation && (
                      <div className="ml-2 self-start max-w-[90%] animate-in slide-in-from-left-8 duration-700">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-[3rem] rounded-tl-none border-2 border-amber-200 dark:border-amber-800 shadow-lg relative group">
                           <div className="flex items-start gap-5">
                              <div className="size-14 rounded-2xl bg-amber-200 dark:bg-amber-700 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-outlined text-amber-800 dark:text-amber-100 text-3xl">chat_bubble</span>
                              </div>
                              <div className="flex flex-col gap-2">
                                <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-[0.2em]">Thầy Cú dặn bé nè:</p>
                                <p className="text-xl font-bold text-amber-950 dark:text-amber-50 leading-relaxed italic">
                                  {item.explanation}
                                </p>
                              </div>
                           </div>
                           <div className="absolute -left-2 top-0 w-4 h-4 bg-amber-50 dark:bg-amber-900/20 border-t-2 border-l-2 border-amber-200 dark:border-amber-800 transform rotate-45 -translate-x-1/2"></div>
                        </div>
                      </div>
                    )}

                    {/* Bước 4: Câu văn mẫu */}
                    {item.id !== 0 && item.text && (
                      <div className="w-full pl-6 animate-in fade-in duration-1000 delay-300">
                        <div className="flex items-center gap-2 mb-3 ml-4">
                           <span className="material-symbols-outlined text-primary text-2xl">magic_button</span>
                           <span className="text-xs font-black text-primary uppercase tracking-widest">Câu văn siêu hay:</span>
                        </div>
                        <div className="px-10 py-8 rounded-[3rem] shadow-xl text-2xl md:text-3xl leading-relaxed w-full bg-white dark:bg-gray-900 border-l-8 border-primary text-slate-900 dark:text-white font-black animate-in slide-up-4">
                          {item.text}
                        </div>
                      </div>
                    )}

                    {/* Bước 5: Lời mời hành động */}
                    {item.callToAction && (
                      <div className="ml-10 mt-2 flex items-center gap-3 animate-pulse">
                         <span className="material-symbols-outlined text-rose-500">record_voice_over</span>
                         <p className="text-lg font-black text-rose-600 uppercase tracking-tight">{item.callToAction}</p>
                      </div>
                    )}

                    {/* Lời chào mặc định khi mới mở */}
                    {item.id === 0 && (
                      <div className="px-10 py-8 rounded-[3rem] bg-indigo-50 dark:bg-indigo-900/20 text-slate-600 dark:text-slate-300 italic text-2xl font-bold border-2 border-indigo-100 dark:border-indigo-800">
                        {item.text}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 bg-white/20 dark:bg-black/10 text-center border-t border-white/20">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em] animate-pulse">
              Thầy Giáo Cú Mèo • Người Bạn Của Các Bé Học Giỏi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
