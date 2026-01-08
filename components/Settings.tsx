
import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 px-2">
        <div className="size-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">settings</span>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Cài đặt ứng dụng</h2>
          <p className="text-slate-500 font-medium">Điều chỉnh để việc học của bé thú vị hơn nhé!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <section className="bg-white dark:bg-[#1e1b2e] rounded-[2.5rem] p-8 shadow-soft border border-slate-50 dark:border-gray-800 space-y-6">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">face</span>
            Tài khoản của bé
          </h3>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="size-24 rounded-full bg-cover bg-center border-4 border-indigo-50 shadow-md" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCO_wjuKidRFvAlXXlLJ9YGy5ZXa-LnVe2nrfl9HzbzzgkiTw5bJF2Xbcu1aRbW8BUh0EdOwxlELGt3Xigi3n9Xft2GwUWRrBZCdh8k3__cXqBJcM-aWr2yG7O3YGdYtw9FPi8AB0XYTFWVT52ctSB_efU9nqCDR4KRJMfBmPENsYcOtgYkDxeaJikxw-faiBuzb6hMXyRfH5cnyXfxANPm-SWbc8Y75Y-x_qvp9Q7jRfkJzTAcQjDAplMZbTtfe8wUcqc1f6b3U6zC')" }}></div>
            <div className="text-center">
              <p className="text-xl font-black text-slate-800 dark:text-white">Minh Anh</p>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Học sinh Lớp 3A</p>
            </div>
          </div>
          <button className="w-full py-4 rounded-2xl bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300 font-black text-sm hover:bg-slate-100 transition-colors">
            Thay đổi ảnh đại diện
          </button>
        </section>

        {/* Preferences Card */}
        <section className="bg-white dark:bg-[#1e1b2e] rounded-[2.5rem] p-8 shadow-soft border border-slate-50 dark:border-gray-800 space-y-8">
          <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-green">tune</span>
            Tuỳ chỉnh
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">dark_mode</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">Chế độ tối</span>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${isDarkMode ? 'bg-primary justify-end' : 'bg-slate-200 justify-start'}`}
              >
                <div className="size-6 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">volume_up</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">Âm thanh</span>
              </div>
              <button 
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${isSoundEnabled ? 'bg-primary justify-end' : 'bg-slate-200 justify-start'}`}
              >
                <div className="size-6 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">translate</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">Ngôn ngữ</span>
              </div>
              <span className="text-primary font-black text-sm uppercase">Tiếng Việt</span>
            </div>
          </div>
        </section>

        {/* System & Support */}
        <section className="md:col-span-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] p-8 border border-indigo-100 dark:border-indigo-900/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
             <div className="size-16 rounded-3xl bg-white dark:bg-gray-800 flex items-center justify-center text-primary shadow-sm">
               <span className="material-symbols-outlined text-4xl">contact_support</span>
             </div>
             <div>
               <h4 className="text-xl font-black text-slate-800 dark:text-white">Bé cần giúp đỡ?</h4>
               <p className="text-slate-500 text-sm font-medium">Hỏi ba mẹ hoặc thầy cô để được hỗ trợ nhé!</p>
             </div>
          </div>
          <div className="flex gap-4">
             <button className="px-8 py-3 bg-white dark:bg-gray-800 text-slate-700 dark:text-white font-black rounded-full shadow-sm border border-slate-100 dark:border-gray-700 text-sm">Hướng dẫn</button>
             <button className="px-8 py-3 bg-primary text-white font-black rounded-full shadow-lg shadow-primary/20 text-sm">Góc phụ huynh</button>
          </div>
        </section>
      </div>

      <div className="text-center mt-4">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Phiên bản 2.1.0 • Made with ❤️ for kids</p>
        <div className="text-[10px] text-primary font-bold uppercase tracking-widest space-y-1">
          <p>Tác giả: Nguyễn Ngọc Duy</p>
          <p>Đồng tác giả: Tổ trưởng các tổ chuyên môn</p>
        </div>
      </div>
    </div>
  );
};
