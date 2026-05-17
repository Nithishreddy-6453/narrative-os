"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Cpu, Network, Zap, Eye, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface OrchestrationLog {
  id: string;
  icon: "terminal" | "cpu" | "network" | "zap" | "eye" | "sparkles";
  prefix: string;
  message: string;
  delay: number;
  duration: number;
}

const orchestrationSequence: OrchestrationLog[] = [
  { id: "1", icon: "terminal", prefix: "INIT", message: "Initializing NarrativeOS intelligence engine...", delay: 0, duration: 800 },
  { id: "2", icon: "network", prefix: "FETCH", message: "Cloning repository structure...", delay: 900, duration: 1200 },
  { id: "3", icon: "cpu", prefix: "SCAN", message: "Parsing codebase modules and dependencies...", delay: 2200, duration: 1400 },
  { id: "4", icon: "zap", prefix: "ANALYZE", message: "Detecting primary execution pipeline...", delay: 3700, duration: 1100 },
  { id: "5", icon: "network", prefix: "GRAPH", message: "Building dependency matrix (15 nodes, 30+ edges)...", delay: 4900, duration: 1300 },
  { id: "6", icon: "eye", prefix: "INTEL", message: "Identifying critical paths and bottlenecks...", delay: 6300, duration: 1200 },
  { id: "7", icon: "sparkles", prefix: "NARRATIVE", message: "Generating execution flow walkthroughs...", delay: 7600, duration: 1100 },
  { id: "8", icon: "zap", prefix: "VISUAL", message: "Constructing intelligence canvas...", delay: 8800, duration: 900 },
  { id: "9", icon: "sparkles", prefix: "READY", message: "Architecture intelligence system online.", delay: 9800, duration: 1000 },
];

const iconMap = {
  terminal: Terminal,
  cpu: Cpu,
  network: Network,
  zap: Zap,
  eye: Eye,
  sparkles: Sparkles,
};

interface AIOrchestrationProps {
  onComplete: () => void;
}

export default function AIOrchestration({ onComplete }: AIOrchestrationProps) {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Show logs sequentially
    orchestrationSequence.forEach((log) => {
      setTimeout(() => {
        setVisibleLogs((prev) => [...prev, log.id]);
        setProgress(((orchestrationSequence.findIndex(l => l.id === log.id) + 1) / orchestrationSequence.length) * 100);
      }, log.delay);
    });

    // Complete after all logs
    const totalDuration = orchestrationSequence[orchestrationSequence.length - 1].delay + 
                         orchestrationSequence[orchestrationSequence.length - 1].duration + 500;
    
    const completeTimer = setTimeout(() => {
      onComplete();
    }, totalDuration);

    return () => clearTimeout(completeTimer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base"
    >
      {/* Ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-cyan/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-violet/10 blur-[100px] rounded-full"
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-charcoal border border-accent-cyan/20 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Cpu className="w-4 h-4 text-accent-cyan" />
            </motion.div>
            <span className="text-xs font-medium text-accent-cyan tracking-wider uppercase">AI Orchestration</span>
          </div>
          <h2 className="text-3xl font-medium text-white mb-2">Analyzing Repository Architecture</h2>
          <p className="text-sm text-text-secondary">NarrativeOS is constructing your intelligence canvas...</p>
        </motion.div>

        {/* Terminal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-surface-graphite/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(34,211,238,0.15)]"
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-surface-charcoal/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-text-secondary" />
              <span className="text-xs text-text-secondary font-mono">narrative-os-intelligence</span>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="p-6 font-mono text-sm min-h-[400px] max-h-[500px] overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {orchestrationSequence.map((log) => {
                const isVisible = visibleLogs.includes(log.id);
                if (!isVisible) return null;

                const Icon = iconMap[log.icon];
                const isComplete = visibleLogs.indexOf(log.id) < visibleLogs.length - 1;

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-3 flex items-start gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className={`mt-0.5 ${
                        isComplete ? "text-accent-cyan/60" : "text-accent-cyan"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold tracking-wider ${
                          isComplete ? "text-white/40" : "text-accent-cyan"
                        }`}>
                          [{log.prefix}]
                        </span>
                        {!isComplete && (
                          <motion.div
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="flex gap-1"
                          >
                            <span className="w-1 h-1 rounded-full bg-accent-cyan" />
                            <span className="w-1 h-1 rounded-full bg-accent-cyan" />
                            <span className="w-1 h-1 rounded-full bg-accent-cyan" />
                          </motion.div>
                        )}
                      </div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isComplete ? 0.5 : 1 }}
                        transition={{ duration: 0.3 }}
                        className={`text-sm leading-relaxed ${
                          isComplete ? "text-white/40" : "text-white/90"
                        }`}
                      >
                        {log.message}
                      </motion.p>
                    </div>

                    {isComplete && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-emerald-400 text-xs"
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Cursor blink */}
            {visibleLogs.length > 0 && (
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-accent-cyan ml-1"
              />
            )}
          </div>

          {/* Progress Bar */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary font-mono">Processing</span>
              <span className="text-xs text-accent-cyan font-mono">{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-violet rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-6"
        >
          <p className="text-xs text-text-secondary">
            Powered by <span className="text-accent-cyan">NarrativeOS Intelligence Engine</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Made with Bob
