
import React, { useState, useEffect } from 'react';
import { generateGameQuestions } from '../services/geminiService';
import { GameQuestion } from '../types';

type GameState = 'INTRO' | 'SELECT_GRADE' | 'LOADING' | 'PLAYING' | 'RESULT';

export const VietnameseGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('INTRO');
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  const startLevel = async (grade: number) => {
    setSelectedGrade(grade);
    setGameState('LOADING');
    const data = await generateGameQuestions(grade);
    setQuestions(data);
    setCurrentIndex(0);
    setScore(0);
    setGameState('PLAYING');
  };

  const handleAnswer = (index: number) => {
    if (isAnswering) return;
    setIsAnswering(true);
    setSelectedOption(index);
    if (index === questions[currentIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowHint(false);
      setIsAnswering(false);
    } else {
      setGameState('RESULT');
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {/* MÀN HÌNH GIỚI THIỆU */}
      {gameState === 'INTRO' && (
        <div className="bg-white dark:bg-[#1e1b2e] rounded-[3rem] p-12 shadow-soft border-4 border-indigo-50 text-center max-w-2xl animate-in zoom-in duration-500">
          <div className="size-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
             <span className="material-symbols-outlined text-7xl text-yellow-500">videogame_asset</span>
          </div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-6">Trò Chơi Tiếng Việt</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xl font-medium mb-10 leading-relaxed">
            Học mà chơi, chơi mà học cùng Bác Cú! <br/> Bé đã sẵn sàng thử thách chưa nào?
          </p>
          <button 
            onClick={() => setGameState('SELECT_GRADE')}
            className="bg-primary hover:bg-primary-hover text-white px-16 py-5 rounded-full text-2xl font-black shadow-xl hover:scale-105 transition-all"
          >
            Bắt đầu ngay
          </button>
        </div>
      )}

      {/* MÀN HÌNH CHỌN LỚP */}
      {gameState === 'SELECT_GRADE' && (
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
           <h2 className="text-3xl font-black text-slate-800 dark:text-white text-center mb-12">Bé đang học lớp mấy nhỉ?</h2>
           <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(grade => (
                <button
                  key={grade}
                  onClick={() => startLevel(grade)}
                  className="group bg-white dark:bg-[#1e1b2e] p-8 rounded-[2.5rem] shadow-soft border-2 border-transparent hover:border-primary hover:-translate-y-2 transition-all flex flex-col items-center gap-4"
                >
                  <div className={`size-20 rounded-2xl flex items-center justify-center text-4xl font-black shadow-inner transition-all group-hover:scale-110 ${
                    grade === 1 ? 'bg-rose-50 text-rose-500' :
                    grade === 2 ? 'bg-orange-50 text-orange-500' :
                    grade === 3 ? 'bg-yellow-50 text-yellow-500' :
                    grade === 4 ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    {grade}
                  </div>
                  <span className="text-xl font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Lớp {grade}</span>
                </button>
              ))}
           </div>
           <button onClick={() => setGameState('INTRO')} className="mt-12 text-slate-400 font-bold hover:underline mx-auto block">Quay lại</button>
        </div>
      )}

      {/* MÀN HÌNH LOADING */}
      {gameState === 'LOADING' && (
        <div className="flex flex-col items-center gap-8 animate-pulse">
           <div className="size-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           <p className="text-2xl font-black text-primary uppercase tracking-widest">Bác Cú đang soạn đề bài...</p>
        </div>
      )}

      {/* MÀN HÌNH CHƠI GAME */}
      {gameState === 'PLAYING' && questions[currentIndex] && (
        <div className="w-full max-w-4xl flex flex-col gap-8 animate-in slide-in-from-right-10 duration-500">
           {/* Progress */}
           <div className="flex justify-between items-center px-4">
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Câu {currentIndex + 1} / {questions.length}</span>
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-amber-400">star</span>
                 <span className="text-xl font-black text-amber-500">{score}</span>
              </div>
           </div>
           <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
           </div>

           {/* Question Card */}
           <div className="bg-white dark:bg-[#1e1b2e] p-10 md:p-14 rounded-[4rem] shadow-soft border-4 border-white dark:border-gray-800 relative">
              <div className="absolute -top-10 -left-6 rotate-[-15deg] hidden md:block">
                 <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6X_002Xr2jxitxDyOfsQa27cTbbeBwQZa_3m9UpTVqNpBaQTxLMSVkrrJ9LsVoxrvMyL4Vd8x-04-uqRKVtAF4aJTr4E2dMsmCxXuJIFanpNOnKerD3he6qICtr58RX-0lnVTwAa06lU-XfAwE51BUZSd7ij6DgYp4qBAwPEEXdXraNAPE6BHIzoc-MXkXCObrqrpIQGXeX0KK6esVcp9cIUXUta9QKjiRzwkc_T6Zpa6mQ7OkHVvvlRzURKd1_kylDG6JUKCHwqw" className="size-32 object-contain" />
              </div>

              <h3 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-12 text-center leading-tight">
                 {questions[currentIndex].question}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {questions[currentIndex].options.map((opt, i) => (
                   <button
                    key={i}
                    disabled={isAnswering}
                    onClick={() => handleAnswer(i)}
                    className={`p-6 md:p-8 rounded-[2.5rem] border-4 text-xl md:text-2xl font-black transition-all shadow-md flex items-center justify-between group ${
                      selectedOption === null 
                        ? 'bg-slate-50 border-transparent hover:border-primary hover:bg-white text-slate-700' 
                        : i === questions[currentIndex].correctIndex 
                          ? 'bg-emerald-500 border-emerald-600 text-white animate-in zoom-in' 
                          : selectedOption === i 
                            ? 'bg-rose-500 border-rose-600 text-white' 
                            : 'bg-slate-100 border-transparent opacity-50 text-slate-400'
                    }`}
                   >
                     <span>{opt}</span>
                     {selectedOption !== null && i === questions[currentIndex].correctIndex && (
                       <span className="material-symbols-outlined text-white text-3xl">check_circle</span>
                     )}
                   </button>
                 ))}
              </div>

              {isAnswering && (
                <div className="mt-12 flex flex-col items-center gap-6 animate-in fade-in duration-500">
                   {selectedOption !== questions[currentIndex].correctIndex && (
                     <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl border-2 border-amber-200 text-amber-700 text-lg font-bold italic">
                        💡 Gợi ý: {questions[currentIndex].hint}
                     </div>
                   )}
                   <button 
                    onClick={nextQuestion}
                    className="bg-primary text-white px-12 py-4 rounded-full text-xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                   >
                     {currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
                     <span className="material-symbols-outlined">arrow_forward</span>
                   </button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* MÀN HÌNH KẾT QUẢ */}
      {gameState === 'RESULT' && (
        <div className="bg-white dark:bg-[#1e1b2e] rounded-[4rem] p-12 shadow-soft border-4 border-emerald-100 text-center max-w-2xl animate-in zoom-in duration-700">
           <div className="text-9xl mb-6">
              {score >= questions.length * 0.8 ? '🏆' : score >= questions.length * 0.5 ? '⭐' : '💪'}
           </div>
           <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Tuyệt vời!</h2>
           <p className="text-slate-500 font-bold mb-8">Bé đã hoàn thành thử thách Lớp {selectedGrade}</p>
           
           <div className="flex justify-center gap-4 mb-10">
              {[...Array(score)].map((_, i) => (
                <span key={i} className="text-5xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>⭐</span>
              ))}
           </div>

           <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-[2.5rem] mb-12 text-left">
              <p className="font-black text-primary uppercase text-xs tracking-widest mb-2">Nhận xét của Bác Cú:</p>
              <p className="text-xl font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">
                 {score === questions.length ? "Hú hú! Bé là thiên tài ngôn ngữ! Không sai câu nào luôn." : 
                  score >= questions.length * 0.5 ? "Bé làm rất tốt, chỉ cần chú ý hơn một chút nữa là hoàn hảo." : 
                  "Bé hãy luyện tập thêm phần này nhé, Bác Cú tin bé sẽ làm được!"}
              </p>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => startLevel(selectedGrade)}
                className="bg-primary text-white px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition-all"
              >
                Chơi lại lớp {selectedGrade}
              </button>
              <button 
                onClick={() => setGameState('SELECT_GRADE')}
                className="bg-slate-100 text-slate-600 px-10 py-4 rounded-full font-black text-lg hover:bg-slate-200 transition-all"
              >
                Chọn lớp khác
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
