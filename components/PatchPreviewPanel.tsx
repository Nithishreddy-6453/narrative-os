"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Code, Zap, Shield, TrendingUp, Sparkles, Activity } from "lucide-react";
import { useState } from "react";
import { useGovernance } from "@/components/GovernanceContext";
import { BobFinding } from "@/data/realRepo";

const severityColors = {
  low: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", icon: "text-cyan-500" },
  medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", icon: "text-amber-500" },
  high: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", icon: "text-orange-500" },
  critical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", icon: "text-red-500" },
};

export default function PatchPreviewPanel() {
  const { 
    focusedFinding, 
    setFocusedFinding, 
    activeRemediation,
    setActiveRemediation,
    addRemediatedNode,
    updateNodeHealth,
    setGovernanceMode
  } = useGovernance();

  const [patchState, setPatchState] = useState<'idle' | 'analyzing' | 'applying' | 'recovering' | 'complete'>('idle');

  if (!focusedFinding || !focusedFinding.remediation) return null;

  const remediation = focusedFinding.remediation;
  const patch = remediation.patch;
  const severityColor = severityColors[focusedFinding.severity];

  const handleApplyPatch = () => {
    setPatchState('analyzing');
    
    // Phase 1: Bob analyzing patch impact
    setTimeout(() => {
      setPatchState('applying');
      setActiveRemediation(remediation);
    }, 1200);

    // Phase 2: Patch application
    setTimeout(() => {
      setPatchState('recovering');
      addRemediatedNode(focusedFinding.nodeId);
      updateNodeHealth(focusedFinding.nodeId, 95);
      setGovernanceMode("stabilizing");
    }, 2500);

    // Phase 3: Recovery complete
    setTimeout(() => {
      setPatchState('complete');
    }, 4000);

    // Phase 4: Close panel
    setTimeout(() => {
      setPatchState('idle');
      setActiveRemediation(null);
      setFocusedFinding(null);
      setGovernanceMode("findings");
    }, 5500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed right-6 top-1/2 -translate-y-1/2 w-[520px] bg-surface-graphite/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.7)] flex flex-col z-50 max-h-[90vh]"
      >
        {/* Close button */}
        <button
          onClick={() => { setPatchState('idle'); setFocusedFinding(null); }}
          className="absolute top-5 right-5 text-text-secondary hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 rounded-2xl ${severityColor.bg} border ${severityColor.border} flex items-center justify-center ${severityColor.icon}`}>
              <Code className="w-7 h-7" />
            </div>
            <div className="flex-1 pr-8">
              <h3 className="text-white font-semibold text-lg leading-tight mb-1">
                {focusedFinding.title}
              </h3>
              <p className="text-xs text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-accent-cyan" />
                IBM Bob Remediation Strategy
              </p>
            </div>
          </div>

          {/* Severity & Confidence */}
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${severityColor.bg} border ${severityColor.border}`}>
              <AlertTriangle className={`w-3.5 h-3.5 ${severityColor.icon}`} />
              <span className={`text-xs font-medium ${severityColor.text} uppercase tracking-wider`}>
                {focusedFinding.severity}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-medium text-violet-400">
                {remediation.confidence}% Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Bob Reasoning */}
          <div>
            <h5 className="text-[10px] font-mono text-accent-cyan/50 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Bob Intelligence Reasoning
            </h5>
            <div className="bg-accent-cyan/[0.04] border border-accent-cyan/15 rounded-xl p-4">
              <p className="text-xs text-accent-cyan/80 leading-relaxed">
                {focusedFinding.reasoning}
              </p>
            </div>
          </div>

          {/* Strategy */}
          <div>
            <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Remediation Strategy
            </h5>
            <p className="text-sm text-white/80 leading-relaxed">
              {remediation.strategy}
            </p>
          </div>

          {/* Code Patch */}
          {patch && (
            <div>
              <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
                Code Diff Preview
              </h5>
              
              {/* File header */}
              <div className="bg-surface-charcoal/60 border border-white/5 rounded-t-xl px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-3.5 h-3.5 text-text-secondary" />
                  <span className="text-xs text-white/70 font-mono">{patch.filePath}</span>
                </div>
                <span className="text-[10px] text-text-secondary font-mono">
                  Lines {patch.lineStart}-{patch.lineEnd}
                </span>
              </div>

              {/* Diff content */}
              <div className="bg-surface-charcoal/30 border-x border-white/5 font-mono text-xs">
                {/* Before (removed) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-red-500/5 border-l-2 border-red-500/50"
                >
                  {patch.before.split('\n').map((line, idx) => (
                    <div key={`before-${idx}`} className="flex items-start gap-3 px-4 py-1.5 hover:bg-red-500/10 transition-colors">
                      <span className="text-red-400/40 select-none w-4">-</span>
                      <span className="text-red-300/70 flex-1">{line}</span>
                    </div>
                  ))}
                </motion.div>

                {/* After (added) */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="bg-emerald-500/5 border-l-2 border-emerald-500/50"
                >
                  {patch.after.split('\n').map((line, idx) => (
                    <div key={`after-${idx}`} className="flex items-start gap-3 px-4 py-1.5 hover:bg-emerald-500/10 transition-colors">
                      <span className="text-emerald-400/40 select-none w-4">+</span>
                      <span className="text-emerald-300/80 flex-1">{line}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Explanation */}
              <div className="bg-surface-charcoal/60 border border-white/5 rounded-b-xl px-4 py-3">
                <p className="text-xs text-white/70 leading-relaxed">
                  <span className="text-accent-cyan font-medium">Bob Explanation:</span> {patch.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Architectural Changes */}
          {remediation.architecturalChanges.length > 0 && (
            <div>
              <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
                Architectural Changes
              </h5>
              <div className="space-y-2">
                {remediation.architecturalChanges.map((change, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + idx * 0.1 }}
                    className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3"
                  >
                    <TrendingUp className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
                    <span className="text-sm text-white/75 leading-relaxed">{change}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Risks */}
          {remediation.risks.length > 0 && (
            <div>
              <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">
                Potential Risks
              </h5>
              <div className="space-y-2">
                {remediation.risks.map((risk, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + idx * 0.1 }}
                    className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-amber-200/80 leading-relaxed">{risk}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Effort Estimate */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Estimated Effort</span>
              <span className={`text-sm font-medium capitalize ${
                remediation.estimatedEffort === 'low' ? 'text-emerald-400' :
                remediation.estimatedEffort === 'medium' ? 'text-amber-400' :
                'text-orange-400'
              }`}>
                {remediation.estimatedEffort}
              </span>
            </div>
          </div>
        </div>

        {/* Action Footer with States */}
        <div className="p-6 border-t border-white/5 bg-surface-charcoal/40">
          {/* Recovery Animation */}
          <AnimatePresence>
            {(patchState === 'analyzing' || patchState === 'applying' || patchState === 'recovering') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  patchState === 'analyzing' ? 'bg-accent-cyan/5 border-accent-cyan/20' :
                  patchState === 'applying' ? 'bg-violet-500/5 border-violet-500/20' :
                  'bg-emerald-500/5 border-emerald-500/20'
                }`}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    {patchState === 'analyzing' ? <Activity className="w-4 h-4 text-accent-cyan" /> :
                     patchState === 'applying' ? <Zap className="w-4 h-4 text-violet-400" /> :
                     <Shield className="w-4 h-4 text-emerald-400" />}
                  </motion.div>
                  <span className={`text-xs font-medium ${
                    patchState === 'analyzing' ? 'text-accent-cyan' :
                    patchState === 'applying' ? 'text-violet-400' :
                    'text-emerald-400'
                  }`}>
                    {patchState === 'analyzing' ? 'IBM Bob analyzing patch impact...' :
                     patchState === 'applying' ? 'Applying remediation patch...' :
                     'Stabilizing system — recovering node health...'}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      patchState === 'analyzing' ? 'bg-accent-cyan' :
                      patchState === 'applying' ? 'bg-violet-500' :
                      'bg-emerald-500'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ width: patchState === 'analyzing' ? '33%' : patchState === 'applying' ? '66%' : '100%' }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success State */}
          <AnimatePresence>
            {patchState === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-emerald-400">Remediation Complete</p>
                  <p className="text-xs text-emerald-400/60">IBM Bob has successfully applied the fix and verified system stability</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleApplyPatch}
              disabled={patchState !== 'idle'}
              whileHover={{ scale: patchState === 'idle' ? 1.02 : 1 }}
              whileTap={{ scale: patchState === 'idle' ? 0.98 : 1 }}
              className={`flex-1 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                patchState !== 'idle'
                  ? 'bg-white/5 text-white/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]'
              }`}
            >
              <Zap className="w-4 h-4" />
              Fix with Bob
            </motion.button>
            <motion.button
              onClick={() => { setPatchState('idle'); setFocusedFinding(null); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl font-medium text-sm border border-white/10 transition-all duration-300"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Made with Bob