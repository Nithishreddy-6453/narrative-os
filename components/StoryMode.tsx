"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Code, Zap, Shield, Network, Cpu, Database, Sparkles } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import type { StoryStep } from "@/data/realRepo";
import { useStoryGraph } from "@/components/StoryGraphContext";
import type { RepositoryMetadata } from "@/types/repository";

const iconMap: Record<string, React.ReactNode> = {
  zap: <Zap className="w-5 h-5 text-accent-cyan" />,
  database: <Database className="w-5 h-5 text-accent-blue" />,
  code: <Code className="w-5 h-5 text-accent-violet" />,
  shield: <Shield className="w-5 h-5 text-green-400" />,
  network: <Network className="w-5 h-5 text-yellow-400" />,
  cpu: <Cpu className="w-5 h-5 text-red-400" />
};

interface StoryModeProps {
  storySteps?: StoryStep[];
  confidence?: number;
  repositoryMetadata?: RepositoryMetadata | null;
}

export default function StoryMode({ storySteps, confidence = 1, repositoryMetadata }: StoryModeProps) {
  // Use dynamic story steps from props
  const steps = storySteps && storySteps.length > 0 ? storySteps : [];

  const [activeStepId, setActiveStepId] = useState<string>(steps[0]?.id ?? "");
  const { 
    setActiveStoryId, 
    setActiveNodes, 
    setActiveDependencies,
    graphSelectedNodeId,
    setGraphSelectedNodeId 
  } = useStoryGraph();

  // Reset active step when steps change
  useEffect(() => {
    if (steps.length > 0 && !steps.find(s => s.id === activeStepId)) {
      setActiveStepId(steps[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps.length]);

  const activeStep = steps.find(s => s.id === activeStepId) || steps[0];

  // Sync story step with graph (Story → Graph)
  useEffect(() => {
    if (!activeStep) return;
    setActiveStoryId(activeStepId);
    setActiveNodes(activeStep.activeNodes);
    setActiveDependencies(activeStep.activeDependencies);
  }, [activeStepId, activeStep, setActiveStoryId, setActiveNodes, setActiveDependencies]);

  // Bidirectional sync: Graph → Story
  // When a node is clicked on the graph, find the matching story step and navigate
  useEffect(() => {
    if (!graphSelectedNodeId || steps.length === 0) return;

    // Find a story step that includes this node in its activeNodes
    const matchingStep = steps.find(step => 
      step.activeNodes.includes(graphSelectedNodeId)
    );

    if (matchingStep && matchingStep.id !== activeStepId) {
      setActiveStepId(matchingStep.id);
    }

    // Clear the signal after processing
    setGraphSelectedNodeId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphSelectedNodeId]);

  const outputPanelRef = useRef<HTMLDivElement>(null);
  const storyCardsRef = useRef<HTMLDivElement>(null);

  // Smart scroll output panel into view
  useEffect(() => {
    if (!activeStepId || !outputPanelRef.current) return;
    
    const timeoutId = setTimeout(() => {
      if (!outputPanelRef.current) return;
      
      const rect = outputPanelRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the panel is visible
      const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const isMostlyHidden = visibleHeight < 250;
      
      if (isMostlyHidden || rect.top > viewportHeight || rect.bottom < 0) {
        const scrollTarget = window.scrollY + rect.top - 120;
        
        window.scrollTo({
          top: scrollTarget,
          behavior: 'smooth'
        });
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [activeStepId]);

  // Don't render if no steps available
  if (steps.length === 0 || !activeStep) return null;

  // Dynamic heading text
  const repoName = repositoryMetadata
    ? `${repositoryMetadata.owner}/${repositoryMetadata.name}`
    : 'the system';
  const repoType = repositoryMetadata?.type !== 'unknown'
    ? repositoryMetadata?.type ?? 'architecture'
    : 'architecture';

  return (
    <section className="relative py-32 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
        
        {/* Left Content */}
        <div className="flex-1 space-y-10 sticky top-32 w-full lg:max-w-md">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-violet/10 border border-accent-violet/20 mb-6 text-accent-violet">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Narrative Story Mode</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight mb-6 text-white leading-tight">
              Trace the execution flow <br/>
              <span className="text-text-secondary">through {repoType} layers.</span>
            </h2>
            <p className="text-lg text-text-secondary font-light max-w-md leading-relaxed">
              Step through the {repoName} {repoType} pipeline with AI-guided walkthroughs. Follow data through each layer of the system.
              {confidence < 1 && (
                <span className="block mt-2 text-sm text-amber-400">
                  · Analysis confidence: {Math.round(confidence * 100)}%
                </span>
              )}
            </p>
          </motion.div>

          <motion.div 
            ref={storyCardsRef}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3"
          >
            {steps.map((step, index) => {
              const isActive = step.id === activeStepId;
              const activeIndex = steps.findIndex(s => s.id === activeStepId);
              const isCompleted = index < activeIndex;
              const isUpcoming = index > activeIndex;
              
              return (
                <div 
                  key={step.id} 
                  onClick={() => setActiveStepId(step.id)}
                  className={`group relative p-5 rounded-2xl border transition-all duration-400 cursor-pointer ${
                    isActive 
                      ? 'bg-surface-charcoal border-white/15 shadow-lg' 
                      : isCompleted
                      ? 'bg-surface-graphite/90 border-white/8 opacity-85 hover:opacity-100'
                      : 'bg-surface-graphite/60 border-white/[0.04] opacity-60 hover:opacity-85'
                  }`}
                >
                  {/* Progression bar */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] transition-all duration-400 rounded-r-full ${
                    isActive ? 'h-2/3 bg-accent-violet' 
                    : isCompleted ? 'h-1/2 bg-accent-cyan/40' 
                    : 'h-0 group-hover:h-1/3 bg-white/20'
                  }`}></div>
                  <div className="flex items-start gap-4">
                    <div className="relative mt-1">
                      {iconMap[step.iconType]}
                      {/* Completed indicator */}
                      {isCompleted && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-white/80' : 'text-white/60'}`}>{step.title}</h4>
                        <span className={`text-[10px] font-mono transition-colors ${isActive ? 'text-accent-violet' : 'text-white/20'}`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${isActive ? 'text-text-secondary' : isCompleted ? 'text-white/40' : 'text-white/30'}`}>{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Right Visual */}
        <div ref={outputPanelRef} className="flex-[1.3] w-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-[600px] rounded-3xl bg-surface-graphite border border-white/10 overflow-hidden flex items-center justify-center p-8 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/5 via-transparent to-transparent pointer-events-none"></div>
              
              {/* Code Story Interface */}
              <div className="w-full h-full flex flex-col relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary font-mono">{activeStep.codeSnippet.filename}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 font-mono text-sm overflow-y-auto custom-scrollbar pr-2">
                  {activeStep.codeSnippet.code.map((line, idx) => (
                    <div key={idx} className="relative group/line">
                      {line.highlight && (
                        <motion.div 
                          initial={{ opacity: 0, width: "0%" }}
                          animate={{ opacity: 1, width: "100%" }}
                          transition={{ duration: 0.8, delay: 0.3 + (idx * 0.1) }}
                          className="absolute -inset-x-2 -inset-y-1 bg-white/5 rounded-md -z-10"
                        />
                      )}
                      
                      <div className={`
                        ${line.type === 'comment' ? 'text-text-secondary opacity-60' : ''}
                        ${line.highlight ? 'text-white' : 'text-white/80'}
                      `}>
                        {line.text}
                      </div>
                      
                      {/* Connection indication bar for sequence */}
                      {idx < activeStep.codeSnippet.code.length - 1 && line.type === 'comment' && (
                        <div className="h-4 border-l border-white/10 ml-2 my-1"></div>
                      )}
                    </div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mt-auto pt-6 border-t border-white/10"
                >
                  <div className="bg-white/[0.03] rounded-2xl p-5 flex items-start gap-4 border border-white/5 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center shrink-0 border border-accent-cyan/20">
                      {iconMap[activeStep.iconType] || <Zap className="w-5 h-5 text-accent-cyan" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium mb-1.5 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-accent-violet" /> Bob Intelligence Insight
                      </p>
                      {/* Staged insight reveal — brief analysis shimmer before content */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 1.0 }}
                      >
                        <motion.p 
                          className="text-[13px] text-white/70 leading-relaxed font-light"
                          initial={{ opacity: 0, filter: "blur(4px)" }}
                          animate={{ opacity: 1, filter: "blur(0px)" }}
                          transition={{ duration: 0.8, delay: 1.2 }}
                        >
                          {activeStep.insight}
                        </motion.p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
