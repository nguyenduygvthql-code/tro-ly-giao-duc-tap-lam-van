
import React from 'react';
import { AppMode } from '../types';

interface HomeProps {
  onNavigate: (mode: AppMode) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const featureCards = [
    { 
      id: AppMode.TEXT_TUTOR, 
      label: 'Sửa lỗi bài viết', 
      desc: 'Chấm bài & sửa lỗi sinh động', 
      icon: 'edit_square', 
      color: 'bg-red-50/50 text-red-500', 
      hover: 'hover:bg-red-100' 
    },
    { 
      id: AppMode.OUTLINE_TUTOR, 
      label: 'Lập dàn ý', 
      desc: 'Bác Cú vẽ sơ đồ tư duy 3D', 
      icon: 'schema', 
      color: 'bg-orange-50/50 text-orange-500', 
      hover: 'hover:bg-orange-100' 
    },
    { 
      id: AppMode.VISUAL_VOCAB, 
      label: 'Từ vựng hình ảnh', 
      desc: 'Học từ mới qua tranh vẽ AI', 
      icon: 'palette', 
      color: 'bg-rose-50/50 text-rose-500', 
      hover: 'hover:bg-rose-100' 
    },
    { 
      id: AppMode.IMAGE_IDEAS, 
      label: 'Viết theo tranh', 
      desc: 'Nhìn hình tìm ý tưởng hay', 
      icon: 'image_search', 
      color: 'bg-blue-50/50 text-blue-500', 
      hover: 'hover:bg-blue-100' 
    },
    { 
      id: AppMode.LIVE_CONVERSATION, 
      label: 'Nghe – kể – viết', 
      desc: 'Nói chuyện cùng Bác Cú', 
      icon: 'mic_external_on', 
      color: 'bg-amber-50/50 text-amber-500', 
      hover: 'hover:bg-amber-100' 
    },
    { 
      id: AppMode.VIETNAMESE_GAME, 
      label: 'Trò chơi Tiếng Việt', 
      desc: 'Thử thách vui nhộn các lớp 1-5', 
      icon: 'videogame_asset', 
      color: 'bg-emerald-50/50 text-emerald-500', 
      hover: 'hover:bg-emerald-100' 
    },
  ];

  return (
    <div className="max-[1200px] mx-auto flex flex-col gap-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined">auto_stories</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight drop-shadow-sm">Bản Làng Ngôn Ngữ</h1>
        </div>
      </div>

      {/* 2. Welcome Section - Focus on Correction */}
      <section className="bg-white/40 backdrop-blur-md rounded-[3rem] p-10 md:p-14 shadow-soft border-b-8 border-indigo-100/30 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="flex-1 text-center md:text-left z-10">
          <h2 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight leading-[1.1] mb-6">
            Bé viết văn <br /> <span className="text-primary">Đúng và Hay</span>
          </h2>
          <p className="text-slate-600 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
            Chụp ảnh bài viết của con, Bác Cú sẽ giúp sửa lỗi chính tả, mở rộng vốn từ và lập sơ đồ dàn ý 3D siêu tốc nhé!
          </p>
          <button 
            onClick={() => onNavigate(AppMode.TEXT_TUTOR)}
            className="mt-10 bg-primary hover:bg-primary-hover text-white text-xl font-black px-12 py-5 rounded-full shadow-xl shadow-primary/30 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 mx-auto md:mx-0"
          >
            <span className="material-symbols-outlined text-2xl">edit_note</span>
            Sửa lỗi bài ngay
          </button>
        </div>

        <div className="relative z-10 shrink-0">
          <div className="size-64 md:size-80 flex items-center justify-center">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6X_002Xr2jxitxDyOfsQa27cTbbeBwQZa_3m9UpTVqNpBaQTxLMSVkrrJ9LsVoxrvMyL4Vd8x-04-uqRKVtAF4aJTr4E2dMsmCxXuJIFanpNOnKerD3he6qICtr58RX-0lnVTwAa06lU-XfAwE51BUZSd7ij6DgYp4qBAwPEEXdXraNAPE6BHIzoc-MXkXCObrqrpIQGXeX0KK6esVcp9cIUXUta9QKjiRzwkc_T6Zpa6mQ7OkHVvvlRzURKd1_kylDG6JUKCHwqw" 
              alt="Bác Cú AI" 
              className="w-full h-full object-contain animate-bounce"
              style={{ animationDuration: '4s' }}
            />
          </div>
          <span className="material-symbols-outlined text-amber-400 absolute top-0 right-0 animate-pulse text-4xl">star</span>
        </div>
      </section>

      {/* 3. Feature Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
        {featureCards.map((card, i) => (
          <button
            key={i}
            onClick={() => onNavigate(card.id)}
            className={`group bg-white/40 backdrop-blur-sm p-8 rounded-[2.5rem] shadow-soft border border-white/50 flex flex-col items-start text-left transition-all hover:shadow-xl hover:-translate-y-2 relative overflow-hidden`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -mr-8 -mt-8 transition-transform group-hover:scale-150 ${card.color}`}></div>
            
            <div className={`size-16 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 ${card.color}`}>
              <span className="material-symbols-outlined text-4xl">{card.icon}</span>
            </div>
            
            <h3 className="text-2xl font-black text-slate-800 mb-2">{card.label}</h3>
            <p className="text-slate-600 font-medium leading-relaxed">{card.desc}</p>
            
            <div className="mt-8 flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Mở tính năng
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </div>
          </button>
        ))}
      </section>

      {/* 4. Footer */}
      <footer className="mt-8 pt-8 border-t border-indigo-100/30 text-center px-4">
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">
          Trường PTDTBT Tiểu học Quảng Lâm
        </p>
        <div className="text-xs font-bold text-primary mb-3 space-y-1">
          <p>Tác giả: Nguyễn Ngọc Duy</p>
          <p>Đồng tác giả: Tổ trưởng các tổ chuyên môn</p>
        </div>
        <p className="text-[10px] text-slate-400 font-medium tracking-wide">
          Thiết kế dành cho các bé học giỏi!
        </p>
      </footer>
    </div>
  );
};
