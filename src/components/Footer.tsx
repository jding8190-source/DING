export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-16 px-6 border-t border-white/5 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">ZC</span>
          </div>
          <div className="text-sm font-display font-medium tracking-tight text-white">DESIGNER.</div>
        </div>
        
        <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-mono">
          <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-white transition-colors">Dribbble</a>
          <a href="#" className="hover:text-white transition-colors">Behance</a>
          <a href="#/admin" className="hover:text-amber-400 text-zinc-400 transition-colors">CMS 后台</a>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 italic">Available — 2024</span>
           </div>
           <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-mono">
             © {currentYear}
           </div>
        </div>
      </div>
    </footer>
  );
}
