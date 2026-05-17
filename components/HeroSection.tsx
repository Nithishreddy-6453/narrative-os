"use client";

import { motion } from "framer-motion";
import { Network, Cpu, Code2 } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Neural Motion & Cinematic Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-accent-violet/10 blur-[120px] rounded-full mix-blend-screen opacity-50"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-accent-cyan/10 blur-[100px] mix-blend-screen opacity-40"></div>
      </div>

      {/* Ambient topology traces — subtle computational life */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" preserveAspectRatio="none">
        {/* Horizontal architectural grid lines */}
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((y, i) => (
          <line key={`h-${i}`} x1="10%" y1={`${y * 100}%`} x2="90%" y2={`${y * 100}%`} stroke="white" strokeWidth="0.5">
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${6 + i * 1.2}s`} repeatCount="indefinite" />
          </line>
        ))}
        {/* Vertical grid */}
        {[0.25, 0.4, 0.55, 0.7].map((x, i) => (
          <line key={`v-${i}`} x1={`${x * 100}%`} y1="15%" x2={`${x * 100}%`} y2="85%" stroke="white" strokeWidth="0.5" strokeDasharray="4 8">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur={`${7 + i * 0.8}s`} repeatCount="indefinite" />
          </line>
        ))}
        {/* Flowing dependency traces */}
        <path d="M 15% 30% Q 35% 25%, 50% 40% T 85% 35%" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="0.5">
          <animate attributeName="stroke-dashoffset" from="100" to="0" dur="8s" repeatCount="indefinite" />
        </path>
        <path d="M 20% 60% Q 40% 55%, 55% 65% T 80% 55%" fill="none" stroke="rgba(129,140,248,0.2)" strokeWidth="0.5">
          <animate attributeName="stroke-dashoffset" from="80" to="0" dur="10s" repeatCount="indefinite" />
        </path>
        {/* Ambient flow particles */}
        <circle r="1" fill="rgba(34,211,238,0.4)">
          <animateMotion dur="12s" repeatCount="indefinite" path="M 100,200 Q 300,150 500,250 T 900,200" />
        </circle>
        <circle r="0.8" fill="rgba(129,140,248,0.3)">
          <animateMotion dur="15s" repeatCount="indefinite" path="M 800,350 Q 600,300 400,380 T 100,330" />
        </circle>
      </svg>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-charcoal border border-white/5 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse"></span>
          <span className="text-sm font-medium text-text-secondary">NarrativeOS Alpha 1.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 leading-[1.1]"
        >
          Transform repositories <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-violet">
            into interactive stories.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12 font-light leading-relaxed"
        >
          The AI-native operating system for repository intelligence, powered by IBM Bob. 
          Experience a cinematic, spatial interface that makes complex codebases visually understandable.
        </motion.p>

        {/* Floating Architecture Nodes */}
        <div className="relative w-full max-w-3xl h-[200px] md:h-[300px] mx-auto mt-12">
          <FloatingNode icon={<Network />} title="Dependency Flow" x="-30%" y="-20%" delay={0.4} />
          <FloatingNode icon={<Cpu />} title="System Architecture" x="0%" y="20%" delay={0.6} />
          <FloatingNode icon={<Code2 />} title="Critical Paths" x="30%" y="-10%" delay={0.8} />
          
          {/* Animated connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/10" style={{ filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.2))" }}>
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
              d="M 250,80 Q 400,100 400,200"
              fill="transparent"
              strokeWidth="1"
            />
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, delay: 1.2, ease: "easeInOut" }}
              d="M 400,200 Q 550,150 600,100"
              fill="transparent"
              strokeWidth="1"
            />
            {/* Connection flow particles */}
            <circle r="2" fill="#22d3ee" opacity="0.5">
              <animateMotion dur="3s" repeatCount="indefinite" path="M 250,80 Q 400,100 400,200" />
            </circle>
            <circle r="2" fill="#818cf8" opacity="0.4">
              <animateMotion dur="3.5s" repeatCount="indefinite" path="M 400,200 Q 550,150 600,100" />
            </circle>
          </svg>

          {/* IBM Bob Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-surface-charcoal/80 border border-accent-cyan/20 backdrop-blur-md"
          >
            <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-xs text-accent-cyan font-medium">Powered by IBM Bob Intelligence</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FloatingNode({ icon, title, x, y, delay }: { icon: React.ReactNode, title: string, x: string, y: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x, y }}
      animate={{ opacity: 1, scale: 1, x, y }}
      transition={{ 
        opacity: { duration: 1, delay },
        scale: { duration: 1, delay, type: "spring", bounce: 0.4 },
        y: { duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: delay }
      }}
      className="absolute top-1/2 left-1/2 flex items-center gap-3 bg-surface-graphite/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl shadow-2xl"
      style={{ transform: "translate(-50%, -50%)" }}
    >
      <div className="w-10 h-10 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan border border-accent-cyan/20">
        {icon}
      </div>
      <span className="font-medium text-sm text-text-primary tracking-wide">{title}</span>
    </motion.div>
  );
}
