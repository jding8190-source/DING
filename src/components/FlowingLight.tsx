import { motion } from 'motion/react';

export default function FlowingLight() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Warm Desk Lamp Glow - Left Edge */}
      <div className="absolute top-[-10%] left-[-20%] w-[80vw] h-[80vw] bg-amber-500/[0.04] blur-[150px] rounded-full pointer-events-none" />
      
      {/* Purple Ambient Glow - Right Edge */}
      <div className="absolute bottom-[-10%] right-[-20%] w-[80vw] h-[80vw] bg-violet-600/[0.05] blur-[150px] rounded-full pointer-events-none" />
    </div>
  );
}
