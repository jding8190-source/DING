import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Home from './components/Home';
import ProjectDetail from './components/ProjectDetail';
import Archive from './components/Archive';
import Admin from './components/Admin';
import FlowingLight from './components/FlowingLight';
import { SettingsProvider } from './lib/settings';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <>
      <FlowingLight />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
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
