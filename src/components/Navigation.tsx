import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../lib/settings';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSiteSettings();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Only display admin badge if the user is already authenticated as admin
    const checkAdmin = () => {
      const isAuth = localStorage.getItem('ding_admin_session') === 'ding8190';
      setIsAdminLoggedIn(isAuth);
    };
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  const navLinks = [
    { name: '作品', href: '#work' },
    { name: '关于', href: '#about' },
    { name: '履历', href: '#experience' },
    { name: '联系', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 sm:px-8 pt-4 pointer-events-none">
      <div className="max-w-[1360px] mx-auto pointer-events-auto">
        <div className="apple-glass-capsule glass-rim-top rounded-full px-5 sm:px-7 py-3 flex justify-between items-center text-zinc-100 transition-all duration-300">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-white to-zinc-300 flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-105 shadow-[0_2px_10px_rgba(255,255,255,0.25)]">
                <span className="text-black font-extrabold text-[10px] tracking-tight">
                  {settings.logoText || 'ZC'}
                </span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-[13px] font-semibold tracking-tight text-white/95 leading-none group-hover:text-white transition-colors">
                  {settings.siteName || 'Ding Jie'}
                </h1>
                <span className="text-[10px] text-zinc-400/90 font-mono tracking-wider mt-0.5">
                  {settings.designerRole || 'Creative Director'}
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.2 }}
                className="group relative px-3 py-1.5 rounded-full text-[13px] font-medium text-zinc-300/90 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                {link.name}
              </motion.a>
            ))}

            {/* Only visible to the authenticated admin - strictly invisible to public visitors */}
            {isAdminLoggedIn && (
              <Link
                to="/admin"
                className="text-[11px] font-mono text-amber-300 bg-amber-500/15 border border-amber-400/30 hover:bg-amber-400/25 px-3 py-1 rounded-full transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                title="管理员专属控制台"
              >
                控制台
              </Link>
            )}

            <div className="w-px h-4 bg-white/15 mx-1" />
            <div className="flex items-center gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="text-[10px] font-mono font-medium text-zinc-400 tracking-wider">INDEX ©24</span>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="md:hidden apple-glass-card glass-rim-top rounded-3xl p-6 mt-3 border border-white/15 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-display text-xl font-light py-2 text-zinc-100 hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <span className="text-xs font-mono text-zinc-500">→</span>
                </a>
              ))}
              {isAdminLoggedIn && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="font-mono text-xs tracking-widest uppercase text-amber-300 bg-amber-500/10 border border-amber-400/20 px-4 py-2.5 rounded-xl mt-2 text-center"
                >
                  管理控制台
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
