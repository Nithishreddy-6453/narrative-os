"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap, Shield, TrendingUp, X } from "lucide-react";
import { useImpact } from "@/components/ImpactContext";
import type { ArchitectureNode } from "@/data/realRepo";

interface ImpactInsightPanelProps {
  nodes?: ArchitectureNode[];
}

export default function ImpactInsightPanel({ nodes = [] }: ImpactInsightPanelProps) {
  const { impactAnalysis, focusedImpactNode, setFocusedImpactNode } = useImpact();

  if (!impactAnalysis || !focusedImpactNode) return null;

  const node = nodes.find(n => n.id === focusedImpactNode);
  if (!node) return null;

  // Determine impact status
  const isEpicenter = impactAnalysis.directlyAffected.includes(focusedImpactNode);
  const isDownstream = impactAnalysis.downstreamImpacted.includes(focusedImpactNode);
  const riskZone = impactAnalysis.riskZones.find(r => r.nodeId === focusedImpactNode);
  
  // Find propagation paths involving this node
  const relevantPaths = impactAnalysis.propagationPaths.filter(p => 
    p.nodes.includes(focusedImpactNode)
  );

  // Severity color mapping
  const severityColors = {
    low: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", icon: "text-cyan-500" },
    medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", icon: "text-amber-500" },
    high: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", icon: "text-orange-500" },
    critical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", icon: "text-red-500" },
  };

  const severityColor = severityColors[impactAnalysis.severity];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed right-6 top-1/2 -translate-y-1/2 w-[420px] bg-surface-graphite/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col z-50 max-h-[85vh]"
      >
        {/* Close button */}
        <button
          onClick={() => setFocusedImpactNode(null)}
          className="absolute top-5 right-5 text-text-secondary hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6 pr-8">
          <div className={`w-14 h-14 rounded-2xl ${severityColor.bg} border ${severityColor.border} flex items-center justify-center ${severityColor.icon}`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg leading-tight mb-1">{node.label}</h3>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Impact Analysis</p>
          </div>
        </div>

        {/* Impact Status Badge */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${severityColor.bg} border ${severityColor.border}`}>
            {isEpicenter && (
              <>
                <Zap className={`w-3.5 h-3.5 ${severityColor.icon}`} />
                <span className={`text-xs font-medium ${severityColor.text}`}>Directly Affected</span>
              </>
            )}
            {isDownstream && !isEpicenter && (
              <>
                <TrendingUp className={`w-3.5 h-3.5 ${severityColor.icon}`} />
                <span className={`text-xs font-medium ${severityColor.text}`}>Downstream Impact</span>
              </>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {/* Change Prompt */}
          <div>
            <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">Proposed Change</h5>
            <p className="text-sm text-white/80 leading-relaxed font-light bg-white/[0.03] border border-white/5 rounded-xl p-3">
              {impactAnalysis.prompt}
            </p>
          </div>

          {/* Bob's Reasoning */}
          <div>
            <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Bob's Analysis
            </h5>
            <p className="text-sm text-white/75 leading-relaxed font-light">
              {impactAnalysis.reasoning}
            </p>
          </div>

          {/* Propagation Paths */}
          {relevantPaths.length > 0 && (
            <div>
              <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-3">Propagation Paths</h5>
              <div className="space-y-2">
                {relevantPaths.map((path, idx) => {
                  const pathSeverityColor = severityColors[path.severity];
                  return (
                    <div key={idx} className={`bg-white/[0.03] border ${pathSeverityColor.border} rounded-xl p-3`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${pathSeverityColor.icon.replace('text-', 'bg-')}`} />
                        <span className={`text-xs font-medium ${pathSeverityColor.text} uppercase tracking-wider`}>
                          {path.severity} Severity
                        </span>
                      </div>
                      <p className="text-xs text-white/70 leading-relaxed mb-2">{path.reasoning}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {path.nodes.map((nodeId, nodeIdx) => {
                          const pathNode = nodes.find(n => n.id === nodeId);
                          const isCurrent = nodeId === focusedImpactNode;
                          return (
                            <div key={nodeId} className="flex items-center gap-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded ${isCurrent ? 'bg-violet-500/20 text-violet-300 font-medium' : 'bg-white/5 text-white/50'}`}>
                                {pathNode?.label || nodeId}
                              </span>
                              {nodeIdx < path.nodes.length - 1 && (
                                <span className="text-white/20 text-xs">→</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Risk Zone Details */}
          {riskZone && (
            <div className={`${severityColor.bg} border ${severityColor.border} rounded-xl p-4`}>
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className={`w-4 h-4 ${severityColor.icon} shrink-0 mt-0.5`} />
                <div>
                  <h5 className={`text-xs font-semibold ${severityColor.text} uppercase tracking-wider mb-1`}>
                    Risk Identified
                  </h5>
                  <p className="text-sm text-white/80 leading-relaxed">{riskZone.risk}</p>
                </div>
              </div>
              <div className="pl-7">
                <h6 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Mitigation</h6>
                <p className="text-xs text-white/70 leading-relaxed">{riskZone.mitigation}</p>
              </div>
            </div>
          )}

          {/* Overall Severity Assessment */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Overall Impact</h5>
              <span className={`text-xs font-semibold ${severityColor.text} uppercase tracking-wider`}>
                {impactAnalysis.severity}
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${severityColor.icon.replace('text-', 'bg-')}`}
                initial={{ width: 0 }}
                animate={{ 
                  width: impactAnalysis.severity === 'critical' ? '100%' :
                         impactAnalysis.severity === 'high' ? '75%' :
                         impactAnalysis.severity === 'medium' ? '50%' : '25%'
                }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Affected Nodes Count */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
              <div className="text-2xl font-semibold text-white mb-1">
                {impactAnalysis.directlyAffected.length}
              </div>
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">Direct</div>
            </div>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
              <div className="text-2xl font-semibold text-white mb-1">
                {impactAnalysis.downstreamImpacted.length}
              </div>
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">Downstream</div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Made with Bob