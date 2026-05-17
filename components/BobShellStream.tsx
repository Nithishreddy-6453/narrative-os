"use client";

import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { Terminal, Cpu, Network, Zap, Eye, Sparkles, CheckCircle2, Activity } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import type { RepositoryMetadata, ParsingProgress } from "@/types/repository";

type BobMode = "PLAN" | "REVIEW" | "ORCHESTRATOR" | "ANALYSIS" | "GOVERNANCE" | "SECURITY" | "REMEDIATION";

interface BobLog {
  id: string;
  mode: BobMode;
  prefix: string;
  message: string;
  timestamp: string;
  duration?: string;
  delay: number;
  typingDuration: number;
}

const bobOrchestrationSequence: BobLog[] = [
  {
    id: "1",
    mode: "ORCHESTRATOR",
    prefix: "BOB",
    message: "Initializing repository intelligence engine...",
    timestamp: "00:00.000",
    delay: 0,
    typingDuration: 700
  },
  {
    id: "2",
    mode: "PLAN",
    prefix: "PLAN",
    message: "Generating architecture graph...",
    timestamp: "00:00.800",
    delay: 800,
    typingDuration: 850
  },
  {
    id: "3",
    mode: "PLAN",
    prefix: "PLAN",
    message: "Running dependency audit...",
    timestamp: "00:01.750",
    duration: "1.1s",
    delay: 1750,
    typingDuration: 900
  },
  {
    id: "4",
    mode: "REVIEW",
    prefix: "REVIEW",
    message: "Running dependency audit across 5 architecture layers...",
    timestamp: "00:02.900",
    delay: 2900,
    typingDuration: 850
  },
  {
    id: "5",
    mode: "ANALYSIS",
    prefix: "INTEL",
    message: "Detecting critical paths...",
    timestamp: "00:03.900",
    duration: "1.3s",
    delay: 3900,
    typingDuration: 950
  },
  {
    id: "6",
    mode: "ANALYSIS",
    prefix: "INTEL",
    message: "Identifying architectural bottlenecks and synthesis risks...",
    timestamp: "00:05.400",
    delay: 5400,
    typingDuration: 900
  },
  {
    id: "7",
    mode: "ORCHESTRATOR",
    prefix: "GRAPH",
    message: "Constructing topology map with 30+ dependency edges...",
    timestamp: "00:06.500",
    duration: "1.0s",
    delay: 6500,
    typingDuration: 850
  },
  {
    id: "8",
    mode: "PLAN",
    prefix: "NARRATIVE",
    message: "Generating execution flow walkthroughs (6 chapters)...",
    timestamp: "00:07.700",
    delay: 7700,
    typingDuration: 800
  },
  {
    id: "9",
    mode: "GOVERNANCE",
    prefix: "GOVERNANCE",
    message: "Verifying architectural constraints...",
    timestamp: "00:08.700",
    duration: "0.8s",
    delay: 8700,
    typingDuration: 900
  },
  {
    id: "10",
    mode: "ORCHESTRATOR",
    prefix: "VISUAL",
    message: "Intelligence canvas stabilized. Materializing graph layers...",
    timestamp: "00:09.900",
    delay: 9900,
    typingDuration: 850
  },
  {
    id: "11",
    mode: "ORCHESTRATOR",
    prefix: "BOB",
    message: "Architecture intelligence system online. Ready for exploration.",
    timestamp: "00:11.000",
    duration: "11.0s",
    delay: 11000,
    typingDuration: 900
  },
];

const modeColors: Record<BobMode, { text: string; bg: string; border: string }> = {
  PLAN: { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
  REVIEW: { text: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/30" },
  ORCHESTRATOR: { text: "text-accent-cyan", bg: "bg-accent-cyan/10", border: "border-accent-cyan/30" },
  ANALYSIS: { text: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" },
  GOVERNANCE: { text: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  SECURITY: { text: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30" },
  REMEDIATION: { text: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30" },
};

// Governance-focused orchestration sequence
export const governanceOrchestrationSequence: BobLog[] = [
  {
    id: "gov-1",
    mode: "ORCHESTRATOR",
    prefix: "BOB",
    message: "Initiating governance review mode...",
    timestamp: "00:00.000",
    delay: 0,
    typingDuration: 600
  },
  {
    id: "gov-2",
    mode: "REVIEW",
    prefix: "REVIEW",
    message: "Auditing architectural constraints and design patterns...",
    timestamp: "00:00.700",
    delay: 700,
    typingDuration: 800
  },
  {
    id: "gov-3",
    mode: "SECURITY",
    prefix: "SECURITY",
    message: "Scanning for security vulnerabilities and unsafe patterns...",
    timestamp: "00:01.600",
    duration: "0.9s",
    delay: 1600,
    typingDuration: 850
  },
  {
    id: "gov-4",
    mode: "GOVERNANCE",
    prefix: "GOVERNANCE",
    message: "Detecting dependency violations and coupling issues...",
    timestamp: "00:02.600",
    delay: 2600,
    typingDuration: 900
  },
  {
    id: "gov-5",
    mode: "ANALYSIS",
    prefix: "COMPLEXITY",
    message: "Analyzing module complexity...",
    timestamp: "00:03.600",
    duration: "1.0s",
    delay: 3600,
    typingDuration: 850
  },
  {
    id: "gov-6",
    mode: "GOVERNANCE",
    prefix: "DRIFT",
    message: "Identifying architectural drift from design specifications...",
    timestamp: "00:04.700",
    delay: 4700,
    typingDuration: 900
  },
  {
    id: "gov-7",
    mode: "ANALYSIS",
    prefix: "FINDINGS",
    message: "Cataloging 6 findings across 5 modules (3 high, 2 medium, 1 low)...",
    timestamp: "00:05.700",
    duration: "0.8s",
    delay: 5700,
    typingDuration: 950
  },
  {
    id: "gov-8",
    mode: "REMEDIATION",
    prefix: "REMEDIATION",
    message: "Generating fix strategies with confidence scoring...",
    timestamp: "00:06.700",
    delay: 6700,
    typingDuration: 850
  },
  {
    id: "gov-9",
    mode: "GOVERNANCE",
    prefix: "VALIDATION",
    message: "Validating remediation impact on system stability...",
    timestamp: "00:07.700",
    duration: "0.7s",
    delay: 7700,
    typingDuration: 800
  },
  {
    id: "gov-10",
    mode: "ORCHESTRATOR",
    prefix: "VISUAL",
    message: "Governance findings mapped to architecture graph...",
    timestamp: "00:08.600",
    delay: 8600,
    typingDuration: 850
  },
  {
    id: "gov-11",
    mode: "ORCHESTRATOR",
    prefix: "BOB",
    message: "Governance review complete. Ready for remediation.",
    timestamp: "00:09.600",
    duration: "9.6s",
    delay: 9600,
    typingDuration: 900
  },
];

interface BobShellStreamProps {
  onComplete: () => void;
  repositoryMetadata?: RepositoryMetadata | null;
  parsingProgress?: ParsingProgress | null;
}

export default function BobShellStream({ onComplete, repositoryMetadata, parsingProgress }: BobShellStreamProps) {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [typingLogs, setTypingLogs] = useState<Set<string>>(new Set());
  const [completedLogs, setCompletedLogs] = useState<Set<string>>(new Set());
  const [currentMode, setCurrentMode] = useState<BobMode>("ORCHESTRATOR");
  const [progress, setProgress] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Generate dynamic logs based on repository metadata
  const generateDynamicLogs = (): BobLog[] => {
    if (!repositoryMetadata) {
      return bobOrchestrationSequence; // Fallback to default
    }

    const repoName = `${repositoryMetadata.owner}/${repositoryMetadata.name}`;
    const repoType = repositoryMetadata.type !== 'unknown' ? repositoryMetadata.type : 'repository';
    const fileCount = repositoryMetadata.fileCount || 'multiple';
    
    return [
      {
        id: "1",
        mode: "ORCHESTRATOR",
        prefix: "BOB",
        message: `Initializing repository intelligence engine for ${repoName}...`,
        timestamp: "00:00.000",
        delay: 0,
        typingDuration: 700
      },
      {
        id: "2",
        mode: "PLAN",
        prefix: "PLAN",
        message: `Analyzing ${repoType} architecture structure...`,
        timestamp: "00:00.800",
        delay: 800,
        typingDuration: 850
      },
      {
        id: "3",
        mode: "PLAN",
        prefix: "PLAN",
        message: `Mapping dependencies across ${fileCount} files...`,
        timestamp: "00:01.750",
        duration: "1.1s",
        delay: 1750,
        typingDuration: 900
      },
      {
        id: "4",
        mode: "REVIEW",
        prefix: "REVIEW",
        message: `Running dependency audit on ${repositoryMetadata.language || 'codebase'}...`,
        timestamp: "00:02.900",
        delay: 2900,
        typingDuration: 850
      },
      {
        id: "5",
        mode: "ANALYSIS",
        prefix: "INTEL",
        message: `Detecting critical paths and entry points...`,
        timestamp: "00:03.900",
        duration: "1.3s",
        delay: 3900,
        typingDuration: 950
      },
      {
        id: "6",
        mode: "ANALYSIS",
        prefix: "INTEL",
        message: `Identifying architectural patterns and bottlenecks...`,
        timestamp: "00:05.400",
        delay: 5400,
        typingDuration: 900
      },
      {
        id: "7",
        mode: "ORCHESTRATOR",
        prefix: "GRAPH",
        message: `Constructing topology map with dependency edges...`,
        timestamp: "00:06.500",
        duration: "1.0s",
        delay: 6500,
        typingDuration: 850
      },
      {
        id: "8",
        mode: "PLAN",
        prefix: "NARRATIVE",
        message: `Generating execution flow walkthroughs...`,
        timestamp: "00:07.700",
        delay: 7700,
        typingDuration: 800
      },
      {
        id: "9",
        mode: "GOVERNANCE",
        prefix: "GOVERNANCE",
        message: `Verifying architectural constraints and best practices...`,
        timestamp: "00:08.700",
        duration: "0.8s",
        delay: 8700,
        typingDuration: 900
      },
      {
        id: "10",
        mode: "ORCHESTRATOR",
        prefix: "VISUAL",
        message: `Intelligence canvas stabilized. Materializing graph layers...`,
        timestamp: "00:09.900",
        delay: 9900,
        typingDuration: 850
      },
      {
        id: "11",
        mode: "ORCHESTRATOR",
        prefix: "BOB",
        message: `Architecture intelligence system online. Ready for exploration.`,
        timestamp: "00:11.000",
        duration: "11.0s",
        delay: 11000,
        typingDuration: 900
      },
    ];
  };

  const orchestrationLogs = generateDynamicLogs();

  useEffect(() => {
    // Show and type logs sequentially
    orchestrationLogs.forEach((log) => {
      // Start showing log
      setTimeout(() => {
        setVisibleLogs((prev) => [...prev, log.id]);
        setTypingLogs((prev) => new Set(prev).add(log.id));
        setCurrentMode(log.mode);
        setProgress(((orchestrationLogs.findIndex(l => l.id === log.id) + 1) / orchestrationLogs.length) * 100);
      }, log.delay);

      // Finish typing
      setTimeout(() => {
        setTypingLogs((prev) => {
          const next = new Set(prev);
          next.delete(log.id);
          return next;
        });
        setCompletedLogs((prev) => new Set(prev).add(log.id));
      }, log.delay + log.typingDuration);
    });

    // Complete after all logs
    const lastLog = orchestrationLogs[orchestrationLogs.length - 1];
    const totalDuration = lastLog.delay + lastLog.typingDuration + 800;
    
    const completeTimer = setTimeout(() => {
      onComplete();
    }, totalDuration);

    return () => clearTimeout(completeTimer);
  }, [onComplete, repositoryMetadata]);

  // Smooth auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current && visibleLogs.length > 0) {
      const scrollHeight = terminalRef.current.scrollHeight;
      const clientHeight = terminalRef.current.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      
      // Smooth scroll animation
      terminalRef.current.scrollTo({
        top: maxScroll,
        behavior: 'smooth'
      });
    }
  }, [visibleLogs]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base"
    >
      {/* Ambient intelligence glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-cyan/10 blur-[140px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.15, 1, 1.15],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/8 blur-[120px] rounded-full"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-surface-charcoal border border-accent-cyan/20 mb-5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="w-5 h-5 text-accent-cyan" />
            </motion.div>
            <span className="text-sm font-medium text-accent-cyan tracking-wider uppercase">IBM Bob Intelligence Stream</span>
          </div>
          <h2 className="text-3xl font-medium text-white mb-3">Repository Analysis in Progress</h2>
          <p className="text-sm text-text-secondary">Bob is constructing architecture intelligence...</p>
        </motion.div>

        {/* Bob Shell Terminal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-surface-graphite/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.12)]"
        >
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-charcoal/60">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="h-4 w-px bg-white/10" />
              <Terminal className="w-4 h-4 text-text-secondary" />
              <span className="text-xs text-text-secondary font-mono">bob-shell-v2.1.0</span>
            </div>
            
            {/* Current Mode Indicator */}
            <motion.div
              key={currentMode}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${modeColors[currentMode].bg} border ${modeColors[currentMode].border}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${modeColors[currentMode].text.replace('text-', 'bg-')}`}>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-full h-full rounded-full"
                />
              </div>
              <span className={`text-[10px] font-mono font-medium ${modeColors[currentMode].text} uppercase tracking-wider`}>
                {currentMode} MODE
              </span>
            </motion.div>
          </div>

          {/* Terminal Content */}
          <div 
            ref={terminalRef}
            className="p-6 font-mono text-sm min-h-[480px] max-h-[520px] overflow-y-auto custom-scrollbar scroll-smooth"
          >
            <AnimatePresence mode="popLayout">
              {orchestrationLogs.map((log) => {
                const isVisible = visibleLogs.includes(log.id);
                if (!isVisible) return null;

                const isTyping = typingLogs.has(log.id);
                const isComplete = completedLogs.has(log.id);
                const modeColor = modeColors[log.mode];

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10, filter: "blur(2px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-4 flex items-start gap-3"
                  >
                    {/* Timestamp */}
                    <span className="text-[10px] text-white/20 font-mono mt-0.5 w-16 shrink-0">
                      {log.timestamp}
                    </span>

                    {/* Mode Badge */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className={`px-2 py-0.5 rounded ${modeColor.bg} border ${modeColor.border} shrink-0`}
                    >
                      <span className={`text-[9px] font-bold tracking-wider ${modeColor.text}`}>
                        [{log.prefix}]
                      </span>
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Message with typing effect */}
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isComplete ? 0.6 : 1 }}
                        transition={{ duration: 0.3 }}
                        className={`text-sm leading-relaxed ${isComplete ? "text-white/50" : "text-white/95"}`}
                      >
                        {log.message}
                        {isTyping && (
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-1.5 h-3.5 bg-accent-cyan ml-1 align-middle"
                          />
                        )}
                      </motion.p>

                      {/* Duration badge */}
                      {log.duration && isComplete && (
                        <motion.span
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                          className="inline-block mt-1 text-[10px] text-emerald-400/60 font-mono"
                        >
                          ✓ {log.duration}
                        </motion.span>
                      )}
                    </div>

                    {/* Completion indicator */}
                    {isComplete && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                        className="text-emerald-400/70 shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">
                Analysis Progress
              </span>
              <span className="text-xs text-accent-cyan font-mono font-medium">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-violet rounded-full relative overflow-hidden"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center mt-6"
        >
          <p className="text-[11px] text-text-secondary">
            Powered by <span className="text-accent-cyan font-medium">IBM Bob</span> · Enterprise AI Architecture Intelligence
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Made with Bob
