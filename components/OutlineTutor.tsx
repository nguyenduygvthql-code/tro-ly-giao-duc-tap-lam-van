
import React, { useState, useRef } from 'react';
import { generateTeacherResponse, analyzeStudentWriting, generateMindMap } from '../services/geminiService';

export const OutlineTutor: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState<string>('');
  const [mindMapUrl, setMindMapUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateOutline = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setOutline('');
    setMindMapUrl(null);

    try {
      const taskContext = "Hãy lập dàn ý chi tiết để học sinh có thể viết một bài văn hay về chủ đề này. Dàn ý phải sinh động, dễ hiểu cho trẻ em.";
      const result = await generateTeacherResponse(topic, taskContext);
      setOutline(result);
      
      // Tạo sơ đồ tư duy dựa trên chủ đề
      const mindMap = await generateMindMap(topic.substring(0, 30), [
        { main: "Mở bài", subs: ["Giới thiệu", "Cảm nghĩ đầu"] },
        { main: "Thân bài 1", subs: ["Miêu tả bao quát", "Chi tiết nổi bật"] },
        { main: "Thân bài 2", subs: ["Hoạt động", "Kỷ niệm"] },
        { main: "Kết bài", subs: ["Cảm nghĩ", "Lời hứa"] }
      ]);
      setMindMapUrl(mindMap);
    } catch (err) {
      setOutline("Cú Mèo bị mệt rồi, thầy giúp bé thử lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    setLoading(true);
    setOutline('');
    setMindMapUrl(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Content = reader.result as string;
      const base64Data = base64Content.split(',')[1];
      try {
        const result = await analyzeStudentWriting(base64Data);
        if (result) {
          setTopic(result.mindMapSubject || result.fullText.substring(0, 50));
          setOutline(result.gradingReport || "Đã lập xong dàn ý từ ảnh.");
          const mindMap = await generateMindMap(result.mindMapSubject || "Dàn ý từ bài viết", result.structure || []);
          setMindMapUrl(mindMap);
        }
      } catch (err) {
        setOutline("Lỗi kết nối khi đọc ảnh.");
      } finally {
        setIsAnalyzingImage(false);
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 h-full pb-10 px-4">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

      <div className="flex-1 flex flex-col gap-6">
        <div className="flex flex-col gap-2 px-2">
          <h1 className="text-3xl lg:text-5xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
             Lập <span className="text-orange-500 uppercase">Dàn Ý</span> Cùng Bác Cú
          </h1>
          <p className="text-slate-500 font-medium text-lg italic">"Bé bí ý tưởng? Nhập chủ đề hoặc tải bài mẫu, Bác Cú vẽ sơ đồ ngay!"</p>
        </div>

        <div className={`flex-1 bg-white dark:bg-[#1e1b2e] rounded-[3.5rem] p-10 shadow-soft flex flex-col gap-8 border-4 transition-all min-h-[500px] relative overflow-hidden ${
          isAnalyzingImage ? 'border-orange-200 animate-pulse' : 'border-white/50 shadow-2xl'
        }`}>
          <div className="flex-1 pl-12 overflow-y-auto custom-scrollbar relative z-10 flex flex-col gap-6">
            <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest bg-orange-50 w-fit px-4 py-1 rounded-full">Chủ đề của bài văn</h4>
            <textarea 
              className="w-full h-full resize-none border-none outline-none focus:ring-0 bg-transparent text-2xl lg:text-4xl text-slate-800 placeholder:text-gray-300 leading-tight font-black font-display"
              placeholder="Ví dụ: Tả cô giáo, Tả con trâu, Ngày đầu đi học..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isAnalyzingImage}
            ></textarea>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-gray-100 gap-4 pl-12 z-20">
            <div className="flex gap-4">
              <button onClick={() => { setTopic(''); setOutline(''); setMindMapUrl(null); }} className="size-14 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-all">
                <span className="material-symbols-outlined">refresh</span>
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="size-14 rounded-full bg-orange-50 text-orange-500 border-4 border-orange-100 hover:bg-orange-500 hover:text-white transition-all shadow-xl flex items-center justify-center">
                <span className="material-symbols-outlined">add_a_photo</span>
              </button>
            </div>
            
            <button 
              onClick={handleCreateOutline} 
              disabled={loading || !topic.trim() || isAnalyzingImage} 
              className="px-12 py-5 rounded-full font-black text-white shadow-2xl bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center gap-3 text-lg"
            >
              <span className="material-symbols-outlined">auto_graph</span>
              {loading ? 'Đang lập dàn ý...' : 'Vẽ sơ đồ dàn ý'}
            </button>
          </div>
        </div>
      </div>

      <aside className="w-full xl:w-[550px] shrink-0 flex flex-col gap-6">
        <div className="bg-[#FFF4E8]/90 backdrop-blur-xl rounded-[3.5rem] p-8 border-b-8 border-[#F9DCC4] flex-1 flex flex-col shadow-2xl overflow-hidden min-h-[600px]">
          <div className="bg-white p-8 rounded-[2.5rem] rounded-bl-none shadow-soft flex-1 overflow-hidden flex flex-col border border-white">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-8 text-center">
                  <div className="size-20 border-8 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                  <p className="font-black text-orange-500 text-xl animate-pulse">Bác Cú đang sắp xếp các ý tưởng<br/>& vẽ sơ đồ 3D cho bé...</p>
                </div>
              ) : outline ? (
                <div className="space-y-10 animate-in fade-in zoom-in duration-700">
                  {mindMapUrl && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="size-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">1</span>
                        <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Sơ đồ tư duy "Cây tri thức"</p>
                      </div>
                      <div className="rounded-[2.5rem] overflow-hidden border-4 border-orange-100 shadow-xl bg-orange-50">
                        <img src={mindMapUrl} alt="Mind Map" className="w-full h-auto" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="size-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-black">2</span>
                        <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Dàn ý chi tiết</p>
                    </div>
                    <div className="prose prose-slate max-w-none">
                       <div className="whitespace-pre-wrap text-lg text-slate-700 leading-relaxed font-bold italic border-l-8 border-orange-200 pl-6 py-4 bg-orange-50/30 rounded-r-3xl">
                         {outline}
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-8 opacity-20">
                   <span className="material-symbols-outlined text-[120px] text-orange-200">account_tree</span>
                   <p className="font-black text-2xl italic uppercase tracking-widest px-10">Đang đợi bé nhập chủ đề...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
