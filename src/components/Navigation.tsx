import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: '作品', href: '#work' },
    { name: '关于', href: '#about' },
    { name: '联系', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/10 backdrop-blur-3xl border-b border-white/[0.01]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-6 flex justify-between items-center text-zinc-100">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-6"
        >
          <Link to="/" className="flex items-center gap-4 group">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center transition-transform duration-1000 ease-in-out group-hover:rotate-[360deg]">
              <span className="text-black font-bold text-[9px] tracking-tighter">ZC</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-[12px] font-semibold tracking-tight text-white leading-none">Ding Jie</h1>
              <span className="text-[10px] text-zinc-500 mt-1">Creative Director</span>
            </div>
          </Link>
        </motion.div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-10 items-center">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.href}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 + 0.2 }}
              className="group relative text-[13px] font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {link.name}
            </motion.a>
          ))}
          <Link
            to="/admin"
            className="text-[11px] font-mono text-zinc-500 hover:text-amber-400 border border-white/5 hover:border-amber-500/30 px-2.5 py-1 rounded-md transition-colors"
            title="作品管理后台"
          >
            CMS 后台
          </Link>
          <div className="w-px h-4 bg-zinc-800 mx-2"></div>
          <span className="text-[11px] font-semibold text-zinc-500 tracking-wider">INDEX ©24</span>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-white">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-[#0A0A0A] border-b border-white/10 p-6 absolute top-full left-0 w-full"
        >
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-display text-2xl font-light py-2 text-zinc-100"
              >
                {link.name}
              </a>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="font-mono text-sm tracking-widest uppercase text-amber-400 py-2"
            >
              CMS 后台管理
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
