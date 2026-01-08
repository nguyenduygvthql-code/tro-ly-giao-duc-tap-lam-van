
import React, { useState } from 'react';
import { Home } from './components/Home';
import { TextTutor } from './components/TextTutor';
import { OutlineTutor } from './components/OutlineTutor';
import { ImageTutor } from './components/ImageTutor';
import { LiveTutor } from './components/LiveTutor';
import { VisualVocab } from './components/VisualVocab';
import { Settings } from './components/Settings';
import { VietnameseGame } from './components/VietnameseGame';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    { id: AppMode.HOME, label: 'Trang chủ', icon: 'home', color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
    { id: AppMode.TEXT_TUTOR, label: 'Sửa lỗi bài', icon: 'edit_note', color: 'text-red-500', bgColor: 'bg-red-50' },
    { id: AppMode.OUTLINE_TUTOR, label: 'Lập dàn ý', icon: 'schema', color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { id: AppMode.VISUAL_VOCAB, label: 'Từ điển tranh', icon: 'menu_book', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { id: AppMode.IMAGE_IDEAS, label: 'Dàn ý ảnh', icon: 'format_list_bulleted', color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { id: AppMode.LIVE_CONVERSATION, label: 'Nói để viết', icon: 'auto_fix', color: 'text-amber-500', bgColor: 'bg-amber-50' },
    { id: AppMode.VIETNAMESE_GAME, label: 'Trò chơi TV', icon: 'videogame_asset', color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  ];

  return (
    <div className="flex h-screen w-full bg-transparent font-display overflow-hidden">
      {/* SIDEBAR */}
      <aside className={`h-full p-4 shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-24' : 'w-72'}`}>
        <div className="flex flex-col h-full glass-panel rounded-[2.5rem] shadow-xl overflow-hidden border-2 border-white/40">
          <div className={`p-6 flex items-center mb-2 ${isSidebarCollapsed ? 'justify-center' : 'justify-end'}`}>
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="size-10 rounded-xl hover:bg-white/50 text-slate-400 hover:text-primary transition-all flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined text-2xl">
                {isSidebarCollapsed ? 'menu' : 'menu_open'}
              </span>
            </button>
          </div>
          
          <nav className="flex-1 px-3 py-2 flex flex-col gap-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`group relative flex items-center rounded-2xl transition-all duration-200 h-14 ${
                  mode === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'text-slate-500 hover:bg-white/40 hover:text-primary'
                } ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-4'}`}
              >
                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  mode === item.id ? 'bg-white/20' : `${item.bgColor} ${item.color}`
                }`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                {!isSidebarCollapsed && <span className="font-bold whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
            
            <div className="mt-auto pt-4 border-t border-white/20">
              <button 
                onClick={() => setMode(AppMode.SETTINGS)}
                className={`flex items-center rounded-2xl transition-all h-14 w-full ${
                  mode === AppMode.SETTINGS ? 'bg-primary text-white' : 'text-slate-400 hover:bg-white/40'
                } ${isSidebarCollapsed ? 'justify-center' : 'px-4 gap-4'}`}
              >
                <div className="size-10 rounded-full flex items-center justify-center shrink-0 bg-slate-100">
                  <span className="material-symbols-outlined text-slate-500">settings</span>
                </div>
                {!isSidebarCollapsed && <span className="font-bold">Cài đặt</span>}
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {mode !== AppMode.HOME && (
          <header className="px-8 py-6 flex items-center justify-between z-10">
            <div className="glass-panel px-6 py-2 rounded-full shadow-sm flex items-center gap-4 border border-white/50">
               <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-black">AI</div>
               <span className="text-sm font-black uppercase tracking-tight text-slate-700">Trợ Lý Cú Mèo</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col gap-1 w-32">
                <div className="h-2 w-full bg-white/40 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 border border-white/50">
                <span className="material-symbols-outlined text-accent-orange text-sm">local_fire_department</span>
                <span className="text-sm font-black text-accent-orange">5</span>
              </div>
            </div>
          </header>
        )}

        <div className={`flex-1 overflow-y-auto px-4 lg:px-8 pb-12 transition-all ${mode === AppMode.HOME ? 'pt-8' : ''}`}>
          {mode === AppMode.HOME && <Home onNavigate={(newMode) => setMode(newMode)} />}
          {mode === AppMode.VIETNAMESE_GAME && <VietnameseGame />}
          {mode === AppMode.TEXT_TUTOR && <TextTutor />}
          {mode === AppMode.OUTLINE_TUTOR && <OutlineTutor />}
          {mode === AppMode.VISUAL_VOCAB && <VisualVocab onNavigate={(newMode) => setMode(newMode)} />}
          {mode === AppMode.IMAGE_IDEAS && <ImageTutor />}
          {mode === AppMode.LIVE_CONVERSATION && <LiveTutor />}
          {mode === AppMode.SETTINGS && <Settings />}
        </div>
      </main>
    </div>
  );
};

export default App;
