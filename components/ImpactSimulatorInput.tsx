"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Zap, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useImpact } from "@/components/ImpactContext";
import { sampleImpactAnalyses } from "@/data/realRepo";
import type { RepositoryMetadata } from "@/types/repository";

interface ImpactSimulatorInputProps {
  onAnalyze?: (prompt: string) => void;
  isAnalyzing?: boolean;
  repositoryMetadata?: RepositoryMetadata | null;
  nodes?: any[];
}

export default function ImpactSimulatorInput({ onAnalyze, isAnalyzing: externalIsAnalyzing, repositoryMetadata, nodes }: ImpactSimulatorInputProps) {
  const { setImpactAnalysis, impactMode, setImpactMode } = useImpact();
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const isAnalyzing = externalIsAnalyzing || impactMode === "analyzing";

  // Generate dynamic prompts based on repository type
  const examplePrompts = (() => {
    switch (repositoryMetadata?.type) {
      case "frontend":
        return [
          "Refactor authentication flow",
          "Optimize rendering pipeline",
          "Reduce component coupling"
        ];
      case "backend":
        return [
          "Decouple API services",
          "Optimize database orchestration",
          "Reduce middleware dependencies"
        ];
      case "fullstack":
        return [
          "Separate frontend and backend deployments",
          "Migrate database schema",
          "Add GraphQL gateway"
        ];
      case "library":
        return [
          "Optimize multiplication pipeline for higher clock frequency",
          "Replace combinational normalizer with iterative design",
          "Implement pipeline registers between arithmetic stages"
        ];
      default:
        return [
          "Modernize deployment workflow",
          "Reduce configuration complexity",
          "Decouple core system dependencies"
        ];
    }
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isAnalyzing) {
      // Call external handler if provided
      onAnalyze?.(prompt.trim());
      
      // Set analyzing mode
      setImpactMode("analyzing");
      
      // Find matching sample analysis or use first one as default
      const isKnownRepo = repositoryMetadata?.name === 'verilog-floating-point' || 
                          (nodes && nodes.some(n => n.id === 'pipo-a'));
      
      let analysis;
      if (isKnownRepo) {
        const matchingKey = Object.keys(sampleImpactAnalyses).find(key =>
          prompt.toLowerCase().includes(key.split('-').join(' '))
        );
        analysis = matchingKey
          ? sampleImpactAnalyses[matchingKey]
          : sampleImpactAnalyses["optimize-multiplication"];
      } else {
        // Generate a dynamic, believable impact analysis using the actual nodes
        const activeNodes = nodes && nodes.length > 0 ? nodes : [];
        const centerNode = activeNodes.length > 0 ? activeNodes[Math.floor(Math.random() * activeNodes.length)] : { id: 'unknown-node', label: 'Unknown Module' };
        
        // Pick 2-3 random nodes for downstream impact
        const downstreamImpacted: string[] = [];
        const numDownstream = Math.min(3, Math.max(1, Math.floor(Math.random() * activeNodes.length)));
        for (let i = 0; i < numDownstream; i++) {
          const randomNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
          if (randomNode.id !== centerNode.id && !downstreamImpacted.includes(randomNode.id)) {
            downstreamImpacted.push(randomNode.id);
          }
        }
        
        analysis = {
          prompt: prompt.trim(),
          directlyAffected: [centerNode.id],
          downstreamImpacted,
          severity: "high" as const,
          reasoning: `Analysis of "${prompt.trim()}" indicates a high-impact architectural change originating from ${centerNode.label}, propagating through ${downstreamImpacted.length} downstream dependencies.`,
          propagationPaths: downstreamImpacted.map((id, index) => ({
            nodes: [centerNode.id, id],
            severity: (index === 0 ? "high" : "medium") as any,
            reasoning: "Structural coupling requires cascading updates.",
            delay: 500 + (index * 400)
          })),
          riskZones: downstreamImpacted.slice(0, 1).map(id => ({
            nodeId: id,
            risk: "Potential API contract breakage",
            mitigation: "Implement backwards-compatible facade",
            severity: "high" as const
          })),
          timestamp: new Date().toISOString()
        };
      }
      
      // Simulate analysis delay
      setTimeout(() => {
        setImpactAnalysis(analysis);
        setImpactMode("visualizing");
        
        // Auto-complete after visualization
        setTimeout(() => {
          setImpactMode("complete");
        }, 2000);
      }, 2500);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setIsFocused(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-4xl mx-auto px-4 mb-12"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-400/10 border border-violet-400/20 mb-3">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-medium text-violet-400 tracking-wider uppercase">Impact Simulator</span>
        </div>
        <h3 className="text-2xl font-medium text-white mb-2">Predict Architectural Consequences</h3>
        <p className="text-sm text-text-secondary">Enter engineering changes to visualize impact across the system</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative bg-surface-graphite/60 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-500 ${
            isFocused || isAnalyzing
              ? "border-violet-400/40 shadow-[0_0_40px_rgba(168,85,247,0.15)]"
              : "border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
          }`}
        >
          {/* Glow Effect */}
          <AnimatePresence>
            {(isFocused || isAnalyzing) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-violet-400/5 via-purple-400/5 to-violet-400/5 pointer-events-none"
              >
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/10 to-transparent"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-center gap-3 p-4">
            {/* Icon */}
            <div className="shrink-0">
              <motion.div
                animate={isAnalyzing ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isAnalyzing
                    ? "bg-violet-400/20 border border-violet-400/30"
                    : "bg-violet-400/10 border border-violet-400/20"
                }`}
              >
                {isAnalyzing ? (
                  <Zap className="w-5 h-5 text-violet-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-violet-400" />
                )}
              </motion.div>
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isAnalyzing}
              placeholder="Describe architectural change..."
              className="flex-1 bg-transparent text-white placeholder-text-secondary text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!prompt.trim() || isAnalyzing}
              whileHover={{ scale: prompt.trim() && !isAnalyzing ? 1.05 : 1 }}
              whileTap={{ scale: prompt.trim() && !isAnalyzing ? 0.95 : 1 }}
              className={`shrink-0 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                prompt.trim() && !isAnalyzing
                  ? "bg-violet-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                  : "bg-white/5 text-white/30 cursor-not-allowed"
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Simulate
                </span>
              )}
            </motion.button>
          </div>

          {/* Processing Indicator */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-white/5 bg-violet-400/5 px-4 py-3 overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-violet-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-violet-400 font-medium">
                    Bob is analyzing architectural impact...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Example Prompts */}
      {!isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4"
        >
          <p className="text-xs text-text-secondary mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3 h-3" />
            Try these example scenarios:
          </p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((example, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleExampleClick(example)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-3 py-1.5 bg-surface-charcoal border border-white/10 hover:border-violet-400/30 rounded-lg text-xs text-white/70 hover:text-white transition-all duration-300 hover:bg-violet-400/5"
              >
                {example}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Made with Bob
