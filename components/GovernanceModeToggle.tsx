"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Play, AlertTriangle, X, Activity, Sparkles } from "lucide-react";
import { useState } from "react";
import { useGovernance } from "@/components/GovernanceContext";
import { bobFindings, governanceViolations, architecturalDrift } from "@/data/realRepo";
import { governanceOrchestrationSequence } from "@/components/BobShellStream";

export default function GovernanceModeToggle() {
  const {
    governanceMode,
    setGovernanceMode,
    setActiveFindings,
    setActiveViolations,
    setActiveDrift,
    reviewSessionActive,
    setReviewSessionActive,
    setReviewStartTime
  } = useGovernance();

  const [showOrchestration, setShowOrchestration] = useState(false);

  const handleStartReview = () => {
    setReviewSessionActive(true);
    setReviewStartTime(new Date());
    setGovernanceMode("reviewing");
    setShowOrchestration(true);
    
    // Simulate Bob review process with orchestration timing
    const lastLog = governanceOrchestrationSequence[governanceOrchestrationSequence.length - 1];
    const totalDuration = lastLog.delay + lastLog.typingDuration;
    
    setTimeout(() => {
      setShowOrchestration(false);
      setActiveFindings(bobFindings);
      setActiveViolations(governanceViolations);
      setActiveDrift(architecturalDrift);
      setGovernanceMode("findings");
    }, totalDuration + 500);
  };

  const isActive = reviewSessionActive || governanceMode !== "idle";

  return (
    <div className="flex items-center gap-3">
      {/* Governance Status Indicator */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.6, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-violet-400"
          />
          <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
            {governanceMode === "reviewing" && "Bob Reviewing..."}
            {governanceMode === "findings" && "Findings Active"}
            {governanceMode === "remediation" && "Remediation"}
            {governanceMode === "stabilizing" && "Stabilizing..."}
          </span>
        </motion.div>
      )}

      {/* Start Bob Review Button */}
      {!isActive && (
        <motion.button
          onClick={handleStartReview}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300"
        >
          <Shield className="w-4 h-4" />
          Start Bob Review
        </motion.button>
      )}

      {/* Findings Count Badge */}
      {governanceMode === "findings" && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-medium text-orange-400">
              {bobFindings.length} Findings
            </span>
          </div>
        </motion.div>
      )}

      {/* Governance Orchestration Modal */}
      <AnimatePresence>
        {showOrchestration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl mx-4 bg-surface-graphite/95 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-8 shadow-[0_0_100px_rgba(168,85,247,0.3)]"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 border-2 border-violet-500/40 flex items-center justify-center"
                >
                  <Shield className="w-8 h-8 text-violet-400" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-white mb-2">IBM Bob Governance Review</h3>
                <p className="text-sm text-text-secondary">Bob is analyzing architecture for security, compliance, and stability...</p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {governanceOrchestrationSequence.map((log, idx) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: log.delay / 1000 }}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="text-[10px] text-white/20 font-mono mt-0.5 w-16 shrink-0">
                      {log.timestamp}
                    </span>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider shrink-0 ${
                      log.mode === 'SECURITY' ? 'bg-orange-400/10 border border-orange-400/30 text-orange-400' :
                      log.mode === 'GOVERNANCE' ? 'bg-emerald-400/10 border border-emerald-400/30 text-emerald-400' :
                      log.mode === 'REMEDIATION' ? 'bg-purple-400/10 border border-purple-400/30 text-purple-400' :
                      log.mode === 'REVIEW' ? 'bg-violet-400/10 border border-violet-400/30 text-violet-400' :
                      'bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan'
                    }`}>
                      [{log.prefix}]
                    </div>
                    <p className="text-white/80 flex-1">{log.message}</p>
                  </motion.div>
                ))}
              </div>

              {/* IBM Bob branding footer */}
              <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-accent-cyan" />
                  <span className="text-[10px] text-accent-cyan/60 uppercase tracking-wider font-mono">
                    Powered by IBM Bob Intelligence Engine
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Made with Bob