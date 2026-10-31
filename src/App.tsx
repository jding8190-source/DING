import { lazy, Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Home from './components/Home';
import ProjectDetail from './components/ProjectDetail';
import Archive from './components/Archive';
import FlowingLight from './components/FlowingLight';
import { SettingsProvider } from './lib/settings';

// Code splitting: Admin is dynamically loaded on-demand so public visitors enjoy lightning-fast initial load
const Admin = lazy(() => import('./components/Admin'));

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060606] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
          加载管理控制台...
        </span>
      </div>
    </div>
  );
}

function GlobalShortcutListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Owner secret shortcut: Ctrl+Shift+A or Cmd+Shift+A to jump straight to admin portal
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <>
      <GlobalShortcutListener />
      <FlowingLight />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route 
              path="/admin" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <Admin />
                </Suspense>
              } 
            />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <Router>
        <main className="selection:bg-white selection:text-black min-h-screen bg-[#080808]">
          <AnimatedRoutes />
        </main>
      </Router>
    </SettingsProvider>
  );
}
