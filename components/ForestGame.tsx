
import React, { useState, useEffect, useRef } from 'react';
import { generateGameChallenge, generateIllustration, createForestGameSession } from '../services/geminiService';

interface MonsterLocation {
  id: string;
  name: string;
  emoji: string;
  x: number; // percentage
  y: number; // percentage
  challengeType: 'DESCRIBE' | 'REARRANGE' | 'GUESS_IMAGE';
  isCompleted: boolean;
  biome: string;
}

const LOCATIONS: MonsterLocation[] = [
  { id: '1', name: 'Voi Đá Cổ Đại', emoji: '🐘', x: 20, y: 70, challengeType: 'DESCRIBE', isCompleted: false, biome: 'Rừng Rậm' },
  { id: '2', name: 'Cá Thần Ánh Trăng', emoji: '🐟', x: 50, y: 30, challengeType: 'GUESS_IMAGE', isCompleted: false, biome: 'Suối Bạc' },
  { id: '3', name: 'Gấu Bông Ngủ Quên', emoji: '🐻', x: 80, y: 60, challengeType: 'REARRANGE', isCompleted: false, biome: 'Hang Đá' },
  { id: '4', name: 'Hươu Sao Lấp Lánh', emoji: '🦌', x: 35, y: 20, challengeType: 'DESCRIBE', isCompleted: false, biome: 'Thung Lũng' },
  { id: '5', name: 'Đại Bàng Mây Trắng', emoji: '🦅', x: 70, y: 15, challengeType: 'REARRANGE', isCompleted: false, biome: 'Đỉnh Núi' },
];

export const ForestGame: React.FC = () => {
  const [gameState, setGameState] = useState<'MAP' | 'CHALLENGE'>('MAP');
  const [locations, setLocations] = useState(LOCATIONS);
  const [selectedMonster, setSelectedMonster] = useState<MonsterLocation | null>(null);
  
  // Challenge states
  const [challengeData, setChallengeData] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [rearrangeItems, setRearrangeItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);

  const startChallenge = async (monster: MonsterLocation) => {
    setSelectedMonster(monster);
    setIsLoading(true);
    setFeedback(null);
    setUserAnswer('');
    
    const data = await generateGameChallenge(monster.challengeType, monster.name);
    
    if (monster.challengeType === 'GUESS_IMAGE' && data) {
      const img = await generateIllustration(data.imagePrompt);
      data.imageUrl = img;
    } else if (monster.challengeType === 'REARRANGE' && data) {
      setRearrangeItems(data.words);
    }
    
    setChallengeData(data);
    setIsLoading(false);
    setGameState('CHALLENGE');
  };

  const checkAnswer = () => {
    if (!challengeData) return;
    
    let isCorrect = false;
    
    if (selectedMonster?.challengeType === 'DESCRIBE') {
      isCorrect = userAnswer.toLowerCase().includes(challengeData.target.toLowerCase());
    } else if (selectedMonster?.challengeType === 'REARRANGE') {
      isCorrect = userAnswer.trim() === challengeData.sentence.trim();
    } else if (selectedMonster?.challengeType === 'GUESS_IMAGE') {
      isCorrect = userAnswer === challengeData.answer;
    }

    if (isCorrect) {
      setFeedback({ text: 'Hú hú! Bé giỏi quá, linh thú đã trở thành bạn của bé rồi!', success: true });
      setLocations(prev => prev.map(loc => loc.id === selectedMonster?.id ? { ...loc, isCompleted: true } : loc));
      setTimeout(() => setGameState('MAP'), 2000);
    } else {
      setFeedback({ text: 'Oáp! Bé thử lại lần nữa xem sao nhé!', success: false });
    }
  };

  const handleWordClick = (word: string) => {
    setUserAnswer(prev => prev ? `${prev} ${word}` : word);
    setRearrangeItems(prev => prev.filter(w => w !== word));
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700">
      {gameState === 'MAP' ? (
        <div className="flex-1 flex flex-col gap-6 relative">
          <div className="flex justify-between items-center px-4">
            <div>
              <h2 className="text-4xl font-black text-emerald-900 tracking-tight">Bản đồ <span className="text-emerald-500">Rừng Xanh</span></h2>
              <p className="text-slate-500 font-bold italic">"Chạm vào linh thú để kết bạn bé nhé!"</p>
            </div>
            <div className="bg-white/80 px-6 py-3 rounded-full shadow-soft flex items-center gap-3 border-2 border-emerald-100">
              <span className="material-symbols-outlined text-amber-500">military_tech</span>
              <span className="text-xl font-black text-emerald-900">{locations.filter(l => l.isCompleted).length} / {locations.length}</span>
            </div>
          </div>

          {/* WORLD MAP VIEW */}
          <div className="flex-1 bg-emerald-50 rounded-[4rem] border-8 border-white shadow-2xl relative overflow-hidden group">
            {/* Background Texture/Art */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
            
            {/* Map Decoration: Rivers & Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 20 70 Q 35 45 50 30 T 80 60" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M 50 30 Q 40 25 35 20" fill="none" stroke="#60A5FA" strokeWidth="1" />
              <path d="M 50 30 Q 60 20 70 15" fill="none" stroke="#60A5FA" strokeWidth="1" />
            </svg>

            {/* Monster Nodes */}
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => startChallenge(loc)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 flex flex-col items-center gap-2 group/node z-20`}
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
              >
                <div className={`relative ${loc.isCompleted ? 'opacity-100' : 'animate-bounce-slow'}`}>
                   {/* Aura */}
                   <div className={`absolute -inset-6 rounded-full blur-xl transition-all ${
                     loc.isCompleted ? 'bg-emerald-400/30' : 'bg-primary/20 group-hover/node:bg-primary/40'
                   }`}></div>
                   
                   {/* Main Icon */}
                   <div className={`size-20 md:size-28 rounded-full border-4 flex items-center justify-center text-5xl md:text-7xl shadow-xl transition-all ${
                     loc.isCompleted ? 'bg-emerald-500 border-white rotate-12' : 'bg-white border-primary group-hover/node:scale-110'
                   }`}>
                     {loc.isCompleted ? '💖' : loc.emoji}
                   </div>

                   {/* Status Badge */}
                   {loc.isCompleted && (
                     <div className="absolute -top-2 -right-2 size-8 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-in zoom-in">
                        <span className="material-symbols-outlined text-white text-sm font-black">check</span>
                     </div>
                   )}
                </div>

                <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg border border-white/50 transform group-hover/node:translate-y-1 transition-transform">
                   <p className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest">{loc.name}</p>
                </div>
              </button>
            ))}

            {/* Floating Clouds */}
            <div className="absolute top-10 left-10 text-6xl opacity-10 animate-pulse">☁️</div>
            <div className="absolute bottom-20 right-20 text-8xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }}>☁️</div>
          </div>
        </div>
      ) : (
        /* CHALLENGE SCREEN */
        <div className="flex-1 flex flex-col gap-8 max-w-4xl mx-auto w-full px-4 py-8 animate-in slide-in-from-bottom-10">
          <button 
            onClick={() => setGameState('MAP')}
            className="flex items-center gap-2 text-slate-400 font-black uppercase text-sm hover:text-primary transition-colors self-start"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Quay lại bản đồ
          </button>

          <div className="bg-white dark:bg-[#1e1b2e] rounded-[3.5rem] p-10 shadow-soft border border-white flex flex-col gap-10 min-h-[500px] justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <span className="text-8xl opacity-10">{selectedMonster?.emoji}</span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center gap-8 text-center">
                 <div className="size-20 border-8 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                 <h3 className="text-2xl font-black text-primary">Bác Cú đang bày trò chơi...</h3>
              </div>
            ) : (
              <div className="flex flex-col gap-10 items-center text-center">
                <div className="space-y-2">
                  <span className="bg-primary/10 text-primary px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                    Thử thách {selectedMonster?.biome}
                  </span>
                  <h3 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    {selectedMonster?.name}
                  </h3>
                </div>

                {/* CHALLENGE TYPE: DESCRIBE */}
                {selectedMonster?.challengeType === 'DESCRIBE' && (
                  <div className="w-full flex flex-col gap-8 items-center">
                    <p className="text-2xl font-bold text-slate-600 italic">"{challengeData?.prompt}"</p>
                    <textarea
                      className="w-full h-32 p-8 bg-slate-50 dark:bg-gray-800 rounded-3xl border-2 border-transparent focus:border-primary outline-none text-xl font-bold text-slate-800 placeholder:text-slate-300"
                      placeholder="Bé hãy viết câu trả lời vào đây..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                    ></textarea>
                    <p className="text-xs font-black text-primary uppercase opacity-40">Mẹo: Trong câu nên có từ "{challengeData?.target}"</p>
                  </div>
                )}

                {/* CHALLENGE TYPE: REARRANGE */}
                {selectedMonster?.challengeType === 'REARRANGE' && (
                  <div className="w-full flex flex-col gap-10 items-center">
                    <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Sắp xếp các từ cho đúng nhé:</p>
                    <div className="flex flex-wrap justify-center gap-4">
                      {rearrangeItems.map((word, i) => (
                        <button
                          key={i}
                          onClick={() => handleWordClick(word)}
                          className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-slate-100 dark:border-gray-700 rounded-2xl font-black text-xl text-slate-700 dark:text-white hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                    <div className="w-full p-8 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border-4 border-dashed border-emerald-100 min-h-[100px] flex items-center justify-center">
                       <p className="text-3xl font-black text-emerald-900 dark:text-emerald-400 italic">
                         {userAnswer || "Lần lượt chọn từ..."}
                       </p>
                    </div>
                    {userAnswer && (
                       <button onClick={() => { 
                         setUserAnswer(''); 
                         setRearrangeItems(challengeData.words); 
                       }} className="text-xs font-black text-rose-500 uppercase hover:underline">Xếp lại từ đầu</button>
                    )}
                  </div>
                )}

                {/* CHALLENGE TYPE: GUESS_IMAGE */}
                {selectedMonster?.challengeType === 'GUESS_IMAGE' && (
                  <div className="w-full flex flex-col gap-8 items-center">
                    <div className="w-full max-w-sm aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                      {challengeData?.imageUrl ? (
                        <img src={challengeData.imageUrl} alt="Guess Challenge" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center animate-pulse">🖼️</div>
                      )}
                    </div>
                    <p className="text-xl font-bold text-slate-500">Trong tranh có điều gì đang xảy ra nhỉ?</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                       {challengeData?.options.map((opt: string, i: number) => (
                         <button
                           key={i}
                           onClick={() => setUserAnswer(opt)}
                           className={`p-6 rounded-2xl border-4 font-black text-xl transition-all shadow-md ${
                             userAnswer === opt ? 'bg-primary border-primary text-white scale-105' : 'bg-white border-slate-100 text-slate-700 hover:border-primary/30'
                           }`}
                         >
                           {opt}
                         </button>
                       ))}
                    </div>
                  </div>
                )}

                {/* FEEDBACK & ACTION */}
                {feedback && (
                  <div className={`p-6 rounded-2xl animate-in zoom-in duration-500 ${feedback.success ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    <p className="text-xl font-black">{feedback.text}</p>
                  </div>
                )}

                <button 
                  onClick={checkAnswer}
                  disabled={!userAnswer}
                  className="bg-primary text-white px-20 py-5 rounded-full text-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                >
                  Kiểm tra đáp án
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
