
import React, { useState, useRef } from 'react';
import { getVisualVocabularyMetadata, generateIllustration, analyzeStudentWriting } from '../services/geminiService';
import { VocabCard, WritingAnalysis, AppMode } from '../types';

type TabMode = 'DICTIONARY' | 'GRADING' | 'GAME';

interface VisualVocabProps {
  onNavigate?: (mode: AppMode) => void;
}

export const VisualVocab: React.FC<VisualVocabProps> = ({ onNavigate }) => {
  const [tabMode, setTabMode] = useState<TabMode>('DICTIONARY');
  
  // Dictionary state
  const [searchTerm, setSearchTerm] = useState('');
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [vocabLoading, setVocabLoading] = useState(false);

  // Grading state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gradingResult, setGradingResult] = useState<WritingAnalysis | null>(null);
  const [gradingLoading, setGradingLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Game state
  const [gameState, setGameState] = useState<'IDLE' | 'LOADING' | 'PLAYING' | 'RESULT'>('IDLE');
  const [currentGameWord, setCurrentGameWord] = useState<VocabCard | null>(null);
  const [gameOptions, setGameOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [gameFeedback, setGameFeedback] = useState<{ text: string, type: 'SUCCESS' | 'ERROR' } | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setVocabLoading(true);
    setCards([]);
    
    try {
      const items = await getVisualVocabularyMetadata(searchTerm);
      if (!items || items.length === 0) {
         alert("Bác Cú chưa nghĩ ra từ nào hay hơn cho từ này. Bé thử từ khác nhé!");
         setVocabLoading(false);
         return;
      }

      const initialCards: VocabCard[] = items.map((item: any) => ({
        word: item.word || "Từ vựng",
        meaning: item.meaning || "Đang cập nhật...",
        sentence: item.sentence || "Bé hãy đặt câu với từ này nhé.",
        imagePrompt: item.imagePrompt || "Whimsical illustration for children",
        imageUrl: null,
        isLoadingImage: true,
      }));
      
      setCards(initialCards);
      setVocabLoading(false);

      // Chạy vẽ tranh song song cho từng thẻ
      initialCards.forEach(async (card, index) => {
        try {
          const base64Image = await generateIllustration(card.imagePrompt);
          setCards(prevCards => {
            const newCards = [...prevCards];
            if (newCards[index]) {
              newCards[index] = { ...newCards[index], imageUrl: base64Image, isLoadingImage: false };
            }
            return newCards;
          });
        } catch (err) {
          setCards(prevCards => {
            const newCards = [...prevCards];
            if (newCards[index]) {
              newCards[index] = { ...newCards[index], isLoadingImage: false };
            }
            return newCards;
          });
        }
      });
    } catch (error) {
      alert("Lỗi kết nối từ điển rồi thầy ơi!");
      setVocabLoading(false);
    }
  };

  const handleGrade = async () => {
    if (!previewUrl) return;
    setGradingLoading(true);
    const base64Data = previewUrl.split(',')[1];
    const result = await analyzeStudentWriting(base64Data);
    setGradingResult(result);
    setGradingLoading(false);
  };

  const startNewGameRound = async () => {
    setGameState('LOADING');
    setGameFeedback(null);
    const words = ["Con mèo", "Mặt trời", "Bản làng", "Dòng suối", "Cái cây", "Đám mây"];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    
    try {
      const items = await getVisualVocabularyMetadata(randomWord);
      if (items && items.length > 0) {
        const target = items[0];
        const imageUrl = await generateIllustration(target.imagePrompt);
        
        setCurrentGameWord({ ...target, imageUrl });
        const options = [target.word];
        while (options.length < 3) {
          const opt = words[Math.floor(Math.random() * words.length)];
          if (!options.includes(opt)) options.push(opt);
        }
        setGameOptions(options.sort(() => Math.random() - 0.5));
        setGameState('PLAYING');
      }
    } catch (e) {
      setGameState('IDLE');
    }
  };

  const handleGameChoice = (choice: string) => {
    if (choice === currentGameWord?.word) {
      setScore(s => s + 10);
      setGameFeedback({ text: "Chính xác! Bé giỏi quá!", type: 'SUCCESS' });
    } else {
      setGameFeedback({ text: "Chưa đúng rồi, bé thử lại nhé!", type: 'ERROR' });
    }
    setTimeout(() => {
      if (choice === currentGameWord?.word) startNewGameRound();
      else setGameFeedback(null);
    }, 1500);
  };

  const suggestions = [
    { label: "🌸 Đẹp", value: "đẹp", color: "text-secondary hover:bg-secondary/10" },
    { label: "🏃 Chạy", value: "chạy", color: "text-accent-green hover:bg-accent-green/10" },
    { label: "🌳 Xanh", value: "xanh", color: "text-primary hover:bg-primary/10" },
    { label: "😊 Vui", value: "vui", color: "text-pink-500 hover:bg-pink-50" }
  ];

  return (
    <div className="h-full flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-center px-2">
        <div className="inline-flex p-1.5 bg-white dark:bg-[#1e1b2e] rounded-full shadow-card self-start border border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setTabMode('DICTIONARY')}
            className={`px-6 md:px-10 py-3 rounded-full font-black text-xs md:text-sm transition-all ${
              tabMode === 'DICTIONARY' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400'
            }`}
          >
            Từ Điển Tranh
          </button>
          <button
            onClick={() => setTabMode('GAME')}
            className={`px-6 md:px-10 py-3 rounded-full font-black text-xs md:text-sm transition-all ${
              tabMode === 'GAME' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400'
            }`}
          >
            Trò Chơi
          </button>
          <button
            onClick={() => setTabMode('GRADING')}
            className={`px-6 md:px-10 py-3 rounded-full font-black text-xs md:text-sm transition-all ${
              tabMode === 'GRADING' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400'
            }`}
          >
            Chấm Bài Ảnh
          </button>
        </div>
      </div>

      {tabMode === 'DICTIONARY' ? (
        <div className="flex-1 flex flex-col gap-8 min-h-0">
          <div className="flex flex-col gap-2 px-2">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">Từ điển tranh: Mở rộng vốn từ</h2>
            <p className="text-slate-500 dark:text-gray-400 text-lg">Bé đang bị "bí từ"? Hãy nhập một từ cơ bản, Bác Cú sẽ tặng bé những từ hay hơn nhiều!</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center w-full max-w-5xl px-2">
            <label className="flex-1 relative group w-full">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-primary/50 text-3xl">lightbulb</span>
              </div>
              <input 
                className="w-full h-16 pl-16 pr-8 rounded-full border-2 border-transparent bg-white dark:bg-[#1e1b2e] shadow-soft text-xl placeholder:text-gray-400 focus:border-primary/30 focus:ring-8 focus:ring-primary/5 transition-all outline-none text-gray-800 dark:text-white font-semibold"
                placeholder="Ví dụ: đẹp, vui, chạy, núi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </label>
            <button 
              onClick={handleSearch}
              disabled={vocabLoading || !searchTerm.trim()}
              className="w-full md:w-auto h-16 px-12 rounded-full bg-primary hover:bg-primary-hover text-white font-black text-xl shadow-lg shadow-primary/30 flex items-center justify-center gap-3 shrink-0 disabled:opacity-50"
            >
              <span>{vocabLoading ? "Đang gợi ý..." : "Tìm từ hay hơn"}</span>
              <span className="material-symbols-outlined">auto_awesome</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-3 items-center px-4">
            <span className="text-sm font-black text-gray-400 uppercase tracking-widest mr-2">Bé thử tìm:</span>
            {suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => { setSearchTerm(s.value); }}
                className={`px-6 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm transition-all shadow-sm ${s.color}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-4 scroll-smooth">
            {cards.length === 0 && !vocabLoading && (
              <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6 py-20">
                <span className="material-symbols-outlined text-[120px] text-gray-300">import_contacts</span>
                <p className="text-2xl font-black text-gray-400">Nhập từ bé muốn thay đổi để Bác Cú giúp nhé!</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-2">
              {cards.map((card, idx) => (
                <div key={idx} className="group bg-white dark:bg-surface-dark rounded-[2rem] p-4 shadow-soft hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/10 flex flex-col h-full transform hover:-translate-y-2">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-6 bg-gray-50 dark:bg-gray-800 relative border border-gray-100 dark:border-gray-700 shadow-inner">
                    {card.isLoadingImage ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    ) : card.imageUrl ? (
                      <img src={card.imageUrl} alt={card.word} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 italic text-sm p-4 text-center">Bác Cú đang vẽ tranh...</div>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 px-2">
                    <div className="mb-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">Từ đắt giá</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors tracking-tight">{card.word}</h3>
                    <p className="text-sm font-bold text-slate-400 mb-4 line-clamp-2 italic">{card.meaning}</p>
                    
                    <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl mb-6 flex-1">
                      <p className="text-slate-600 dark:text-gray-300 text-sm font-bold leading-relaxed italic">
                        <span className="material-symbols-outlined text-xs align-middle mr-1">chat_bubble</span>
                        "{card.sentence}"
                      </p>
                    </div>
                    
                    <button className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base shadow-lg shadow-primary/20 hover:scale-105 transition-all">Dùng ngay từ này</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : tabMode === 'GAME' ? (
        /* GAME MODE */
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-8 animate-in zoom-in duration-500">
           <div className="bg-white dark:bg-[#1e1b2e] rounded-[3rem] p-10 shadow-soft border border-indigo-50 dark:border-indigo-900/30 flex flex-col items-center text-center gap-8 min-h-[500px] justify-center relative overflow-hidden">
              
              {gameState === 'IDLE' && (
                <div className="space-y-8">
                   <div className="size-32 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                     <span className="material-symbols-outlined text-6xl">extension</span>
                   </div>
                   <h2 className="text-3xl font-black text-slate-800 dark:text-white">Thử thách đoán tranh</h2>
                   <p className="text-slate-500 font-medium">Bé hãy nhìn tranh và chọn từ ngữ đúng nhất nhé!</p>
                   <button 
                    onClick={startNewGameRound}
                    className="bg-primary text-white text-xl font-black px-12 py-5 rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                   >
                     Bắt đầu chơi
                   </button>
                </div>
              )}

              {gameState === 'LOADING' && (
                <div className="flex flex-col items-center gap-6">
                   <div className="size-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                   <p className="text-xl font-black text-primary">Bác Cú đang vẽ tranh...</p>
                </div>
              )}

              {gameState === 'PLAYING' && currentGameWord && (
                <div className="w-full flex flex-col items-center gap-10">
                   <div className="absolute top-8 right-8 bg-indigo-50 dark:bg-indigo-900/20 px-6 py-2 rounded-full border border-indigo-100 dark:border-indigo-900/40">
                      <p className="text-primary font-black uppercase tracking-widest text-sm">Điểm: {score}</p>
                   </div>

                   <div className="w-full max-w-sm aspect-square rounded-[2.5rem] overflow-hidden shadow-xl border-8 border-white dark:border-gray-800 relative group">
                      <img src={currentGameWord.imageUrl!} alt="Game Challenge" className="w-full h-full object-cover" />
                      {gameFeedback && (
                        <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-sm transition-all ${
                          gameFeedback.type === 'SUCCESS' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                        }`}>
                           <div className="bg-white dark:bg-gray-800 px-8 py-4 rounded-3xl shadow-2xl animate-bounce">
                             <p className={`text-2xl font-black ${gameFeedback.type === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'}`}>
                               {gameFeedback.text}
                             </p>
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      {gameOptions.map((opt, i) => (
                        <button
                          key={i}
                          disabled={gameFeedback !== null}
                          onClick={() => handleGameChoice(opt)}
                          className="bg-slate-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 p-6 rounded-[2rem] border-2 border-transparent hover:border-primary text-xl font-black text-slate-700 dark:text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          {opt}
                        </button>
                      ))}
                   </div>
                </div>
              )}
           </div>
        </div>
      ) : (
        /* GRADING MODE */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
          <div className="bg-white dark:bg-[#1e1b2e] rounded-3xl p-8 shadow-soft border border-indigo-50 dark:border-indigo-900/30 flex flex-col gap-6">
            <h3 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
               <span className="material-symbols-outlined text-accent-green text-3xl">camera_enhance</span> Tải Ảnh Bài Viết
            </h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all bg-gray-50/50 dark:bg-gray-800/20"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain p-8" />
              ) : (
                <div className="text-center">
                  <div className="size-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-5xl text-gray-200 dark:text-gray-600">add_a_photo</span>
                  </div>
                  <span className="text-gray-400 font-black text-xl block uppercase tracking-wider">Chạm để chọn ảnh</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => { setPreviewUrl(reader.result as string); setGradingResult(null); };
                  reader.readAsDataURL(file);
                }
              }} className="hidden" accept="image/*" />
            </div>
            <button onClick={handleGrade} disabled={!selectedFile || gradingLoading} className="w-full py-5 bg-primary text-white rounded-full font-black text-xl shadow-lg shadow-primary/30 disabled:opacity-50">
              {gradingLoading ? 'Đang đọc bài...' : 'Chấm Bài Ngay'}
            </button>
          </div>

          <div className="bg-white dark:bg-[#1e1b2e] rounded-3xl shadow-soft border border-white dark:border-gray-800 flex flex-col overflow-hidden">
             <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30">
               <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Kính hiển vi của Cú</span>
             </div>
             <div className="flex-1 p-8 overflow-y-auto">
                {gradingResult && (
                  <div className="space-y-10">
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-8 rounded-[2rem] border-2 border-yellow-100 dark:border-yellow-900/20 shadow-sm">
                       <p className="text-gray-800 dark:text-gray-200 font-bold text-xl leading-relaxed italic">"{gradingResult.fullText}"</p>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-wider">Lỗi cần sửa:</h4>
                      {gradingResult.corrections.map((err, i) => (
                        <div key={i} className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-sm flex flex-col gap-3">
                          <div className="flex items-center gap-4">
                            <span className="text-rose-400 line-through font-bold text-lg">{err.original}</span>
                            <span className="material-symbols-outlined text-gray-300">arrow_forward</span>
                            <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-5 py-2 rounded-2xl font-black text-xl border border-emerald-100 dark:border-emerald-800">{err.suggestion}</span>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">{err.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
