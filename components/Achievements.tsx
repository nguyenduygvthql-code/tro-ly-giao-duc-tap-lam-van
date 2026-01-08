
import React from 'react';

export const Achievements: React.FC = () => {
  const badges = [
    { name: 'Cú Chăm Chỉ', desc: 'Học liên tục 5 ngày', icon: 'local_fire_department', color: 'bg-orange-100 text-orange-500', earned: true },
    { name: 'Bút Vàng', desc: 'Viết được 10 bài văn hay', icon: 'edit_square', color: 'bg-yellow-100 text-yellow-600', earned: true },
    { name: 'Thợ Săn Từ', desc: 'Học 50 từ vựng mới', icon: 'search', color: 'bg-blue-100 text-blue-500', earned: true },
    { name: 'Họa Sĩ Nhí', desc: 'Lập dàn ý từ 5 bức tranh', icon: 'palette', color: 'bg-purple-100 text-purple-500', earned: false },
    { name: 'Người Bạn Nhí', desc: 'Nói chuyện với Cú 30 phút', icon: 'forum', color: 'bg-emerald-100 text-emerald-500', earned: false },
    { name: 'Nhà Thông Thái', desc: 'Sửa sạch 20 lỗi chính tả', icon: 'psychology', color: 'bg-rose-100 text-rose-500', earned: false },
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Level Summary */}
      <section className="bg-white rounded-[3rem] p-10 shadow-soft border border-slate-50 flex flex-col md:flex-row items-center gap-10">
        <div className="size-48 rounded-full bg-gradient-to-tr from-primary to-indigo-400 p-2 shadow-xl shadow-primary/20 flex-shrink-0">
          <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center border-4 border-white">
            <span className="text-5xl font-black text-primary">3</span>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Cấp độ</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-6 w-full text-center md:text-left">
          <h2 className="text-3xl font-black text-slate-800">Cố lên Minh Anh ơi!</h2>
          <p className="text-slate-500 font-medium">Chỉ còn <span className="text-primary font-black">350 XP</span> nữa là em sẽ lên Cấp độ 4 rồi đấy!</p>
          <div className="space-y-2">
            <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
              <div className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full shadow-lg transition-all duration-1000" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-xs font-black text-slate-400 px-2">
              <span>650 XP</span>
              <span>1000 XP</span>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Grid */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-accent-orange rounded-full"></div>
          <h3 className="text-2xl font-black text-slate-800">Bộ sưu tập Huy hiệu</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {badges.map((badge, i) => (
            <div 
              key={i} 
              className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center text-center gap-4 ${
                badge.earned 
                ? 'bg-white border-slate-50 shadow-soft hover:-translate-y-2 hover:shadow-xl' 
                : 'bg-slate-50 border-transparent opacity-60 grayscale'
              }`}
            >
              <div className={`size-20 rounded-3xl flex items-center justify-center shadow-sm ${badge.color}`}>
                <span className="material-symbols-outlined text-4xl">{badge.icon}</span>
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800">{badge.name}</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">{badge.desc}</p>
              </div>
              {badge.earned && (
                <div className="mt-2 inline-flex items-center gap-1 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Đã đạt
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* History List */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 bg-primary rounded-full"></div>
            <h3 className="text-2xl font-black text-slate-800">Hoạt động gần đây</h3>
          </div>
          <button className="text-sm font-black text-primary hover:underline">Xem tất cả</button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-soft">
          {[
            { action: 'Sửa bài viết: Tả con trâu', date: 'Hôm nay', xp: '+25 XP', icon: 'edit_square' },
            { action: 'Tìm từ vựng: Màu đỏ', date: 'Hôm qua', xp: '+15 XP', icon: 'menu_book' },
            { action: 'Nói chuyện cùng Bác Cú', date: '2 ngày trước', xp: '+40 XP', icon: 'mic' },
          ].map((item, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-slate-700">{item.action}</p>
                  <p className="text-xs text-slate-400 font-medium">{item.date}</p>
                </div>
              </div>
              <span className="text-primary font-black">{item.xp}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
