import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../lib/settings';

export default function Footer() {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  // Discrete owner entrance: triple-clicking the logo icon directly navigates to /admin
  const handleSecretClick = () => {
    const next = clickCount + 1;
    if (next >= 3) {
      setClickCount(0);
      navigate('/admin');
    } else {
      setClickCount(next);
      setTimeout(() => setClickCount(0), 1500);
    }
  };
  
  return (
    <footer className="py-16 px-6 border-t border-white/5 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleSecretClick}
            title="Design Studio"
            className="w-8 h-8 bg-white/10 hover:bg-white/15 rounded-full flex items-center justify-center transition-colors cursor-default"
          >
            <span className="text-white text-[10px] font-bold">
              {settings.logoText || 'ZC'}
            </span>
          </button>
          <div className="text-sm font-display font-medium tracking-tight text-white select-none">
            {settings.siteName || 'DING JIE'}.
          </div>
        </div>
        
        <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-mono">
          <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-white transition-colors">Dribbble</a>
          <a href="#" className="hover:text-white transition-colors">Behance</a>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 italic">
                {settings.availableStatus || `Available — ${currentYear}`}
              </span>
           </div>
           <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-mono select-none">
             {settings.copyrightText || `© ${currentYear} ${settings.siteName || 'DING JIE'}. ALL RIGHTS RESERVED.`}
           </div>
        </div>
      </div>
    </footer>
  );
}
