
import React, { useState, useRef, useEffect } from 'react';
import { generateTeacherResponse, analyzeStudentWriting, LiveClient, generateMindMap } from '../services/geminiService';
import { TextTaskType } from '../types';

export const TextTutor: React.FC = () => {
  const [input, setInput] = useState('');
  const [studentImage, setStudentImage] = useState<string | null>(null);
  const [gradingReport, setGradingReport] = useState<string>('');
  const [mindMapUrl, setMindMapUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeTask, setActiveTask] = useState<TextTaskType>(TextTaskType.CORRECTION);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveClientRef = useRef<LiveClient | null>(null);

  useEffect(() => {
    return () => {
      liveClientRef.current?.disconnect();
    };
  }, []);

  const handleAction = async (taskOverride?: TextTaskType) => {
    const task = taskOverride || activeTask;
    if (!input.trim()) return;
    
    setLoading(true);
    setGradingReport('');
    setMindMapUrl(null);

    try {
      let taskContext = "";
      if (task === TextTaskType.CORRECTION) {
        taskContext = "Hãy chấm bài viết sau của học sinh vùng cao. Tuân thủ cấu trúc 4 phần: 1. Lỗi cần sửa ngay, 2. Gợi ý sửa bài, 3. Mở rộng vốn từ, 4. Dàn ý gợi ý.";
      } else if (task === TextTaskType.VOCABULARY) {
        taskContext = "Gợi ý thêm các từ ngữ miêu tả thiên nhiên, bản làng sinh động cho bài viết này. Chú ý hướng dẫn học sinh thay từ đơn giản bằng từ giàu hình ảnh.";
      }

      const result = await generateTeacherResponse(input, taskContext);
      setGradingReport(result);
      
      const mindMap = await generateMindMap(input.substring(0, 30), [
        { main: "Nội dung chính", subs: ["Ý tưởng 1", "Ý tưởng 2"] },
        { main: "Ngôn ngữ", subs: ["Từ vựng", "Ngữ pháp"] }
      ]);
      setMindMapUrl(mindMap);

    } catch (err) {
      setGradingReport("Có lỗi kết nối rồi thầy ơi, mình thử lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    setLoading(true);
    setGradingReport('');
    setMindMapUrl(null);
    setStudentImage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Content = reader.result as string;
      setStudentImage(base64Content);
      const base64Data = base64Content.split(',')[1];
      try {
        const result = await analyzeStudentWriting(base64Data);
        if (result && result.fullText) {
          setInput(result.fullText);
          setGradingReport(result.gradingReport || "Bác Cú đã đọc xong bài của bé.");
          setActiveTask(TextTaskType.CORRECTION);
          
          const mindMap = await generateMindMap(result.mindMapSubject || "Phân tích bài viết", result.structure || []);
          setMindMapUrl(mindMap);
        } else {
          setGradingReport("Bác Cú không nhìn rõ chữ. Bé chụp lại rõ hơn nhé!");
        }
      } catch (err) {
        setGradingReport("Lỗi kết nối khi đọc ảnh.");
      } finally {
        setIsAnalyzingImage(false);
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleVoiceInput = async () => {
    if (isListening) {
      liveClientRef.current?.disconnect();
      setIsListening(false);
    } else {
      setIsListening(true);
      const client = new LiveClient(
        (text, isModel) => { if (!isModel && text.trim()) setInput(prev => prev + " " + text); },
        (isConnected) => setIsListening(isConnected)
      );
      try { await client.connect(); liveClientRef.current = client; }
      catch (err) { setIsListening(false); }
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 h-full pb-10 px-4">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end px-2 gap-4">
          <div>
            <h1 className="text-3xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
               Bác Cú <span className="text-primary">{gradingReport ? 'đã xong!' : 'soi bài cho bé'}</span>
            </h1>
          </div>
          
          <div className="inline-flex p-1 bg-white/80 backdrop-blur shadow-sm rounded-full border border-slate-100">
             {[
                { id: TextTaskType.CORRECTION, label: 'Chấm bài' },
                { id: TextTaskType.VOCABULARY, label: 'Mở rộng từ' },
             ].map(t => (
               <button 
                key={t.id}
                onClick={() => { setActiveTask(t.id); setGradingReport(''); setMindMapUrl(null); }}
                className={`px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTask === t.id ? 'bg-primary text-white shadow-md' : 'text-slate-400'
                }`}
               >
                 {t.label}
               </button>
             ))}
          </div>
        </div>

        <div className={`flex-1 bg-white dark:bg-[#1e1b2e] rounded-[3.5rem] p-10 shadow-soft flex flex-col gap-6 border-4 transition-all min-h-[500px] relative overflow-hidden ${
          isAnalyzingImage ? 'border-primary/30 animate-pulse' : 'border-white/50 shadow-2xl'
        }`}>
          <div className="flex-1 pl-12 overflow-y-auto custom-scrollbar relative z-10">
            <textarea 
              className="w-full h-full resize-none border-none outline-none focus:ring-0 bg-transparent text-xl lg:text-2xl text-slate-800 placeholder:text-gray-300 leading-relaxed font-bold font-display"
              placeholder="Nhấn máy ảnh để tải bài của bé cần sửa..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isAnalyzingImage}
            ></textarea>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-gray-100 gap-4 pl-12 z-20">
            <div className="flex gap-4">
              <button onClick={() => { setStudentImage(null); setInput(''); setGradingReport(''); setMindMapUrl(null); }} className="size-14 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-all">
                <span className="material-symbols-outlined">refresh</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="size-14 rounded-full bg-white text-primary border-4 border-primary/10 hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center">
                <span className="material-symbols-outlined">add_a_photo</span>
              </button>
              <button onClick={toggleVoiceInput} className={`size-14 rounded-full transition-all flex items-center justify-center shadow-xl ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-50 text-accent-green hover:bg-emerald-500'}`}>
                <span className="material-symbols-outlined">{isListening ? 'stop_circle' : 'mic'}</span>
              </button>
            </div>
            
            <button onClick={() => handleAction()} disabled={loading || !input.trim() || isAnalyzingImage} className="px-10 py-4 rounded-full font-black text-white shadow-2xl bg-primary hover:scale-105 active:scale-95 transition-all disabled:opacity-30">
              {loading ? 'Đang chấm...' : 'Chấm & Vẽ sơ đồ'}
            </button>
          </div>
        </div>
      </div>

      <aside className="w-full xl:w-[550px] shrink-0 flex flex-col gap-6">
        {studentImage && (
          <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border-4 border-white -rotate-1">
            <div className="rounded-[2rem] overflow-hidden aspect-[4/3] bg-slate-50 border border-slate-100">
              <img src={studentImage} alt="Vở của bé" className="w-full h-full object-contain" />
            </div>
          </div>
        )}

        <div className="bg-[#F0EEFF]/90 backdrop-blur-xl rounded-[3.5rem] p-8 border-b-8 border-[#dcd8fa] flex-1 flex flex-col shadow-2xl overflow-hidden min-h-[600px]">
          <div className="bg-white p-8 rounded-[2.5rem] rounded-bl-none shadow-soft flex-1 overflow-hidden flex flex-col border border-white">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
                  <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <p className="font-black text-slate-400 animate-pulse">Bác Cú đang phân tích sâu<br/>& vẽ sơ đồ...</p>
                </div>
              ) : gradingReport ? (
                <div className="space-y-8 animate-in fade-in duration-700">
                  {mindMapUrl && (
                    <div className="space-y-3">
                      <p className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">hub</span> Sơ đồ phân tích 3D
                      </p>
                      <div className="rounded-[2rem] overflow-hidden border-4 border-indigo-100 shadow-xl bg-white">
                        <img src={mindMapUrl} alt="Mind Map" className="w-full h-auto" />
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm">assignment_turned_in</span> 
                       Báo cáo từ Bác Cú
                     </p>
                     <div className="whitespace-pre-wrap text-base lg:text-lg text-slate-700 leading-relaxed font-medium font-body">
                       {gradingReport}
                     </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-8 opacity-20">
                   <span className="material-symbols-outlined text-8xl text-slate-300">description</span>
                   <p className="font-black text-xl italic uppercase tracking-widest">Đang chờ bài viết...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
