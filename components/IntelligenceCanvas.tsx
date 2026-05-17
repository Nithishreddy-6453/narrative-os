"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Layers, Database, Globe, Box, Zap, X, Cpu, HardDrive, Upload, Code, Wrench, AlertTriangle, Shield } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import type { ArchitectureNode, FindingSeverity } from "@/data/realRepo";
import { useStoryGraph } from "@/components/StoryGraphContext";
import { useImpact } from "@/components/ImpactContext";
import { useGovernance } from "@/components/GovernanceContext";
import ImpactInsightPanel from "@/components/ImpactInsightPanel";
import PatchPreviewPanel from "@/components/PatchPreviewPanel";
import type { RepositoryMetadata } from "@/types/repository";

/* ─── Visual Config ─────────────────────────────────── */

const iconMap: Record<string, React.ReactNode> = {
  input: <Upload className="w-5 h-5" />,
  unpacker: <Code className="w-5 h-5" />,
  arithmetic: <Cpu className="w-5 h-5" />,
  support: <Wrench className="w-5 h-5" />,
  output: <Database className="w-5 h-5" />,
  control: <Box className="w-5 h-5" />,
};

const colorMap: Record<string, { border: string; glow: string; text: string; bg: string; hex: string }> = {
  input:      { border: "border-cyan-400/60",    glow: "shadow-cyan-400/30",    text: "text-cyan-400",    bg: "bg-cyan-400/10",    hex: "#22d3ee" },
  unpacker:   { border: "border-violet-400/70",  glow: "shadow-violet-400/40",  text: "text-violet-400",  bg: "bg-violet-400/15",  hex: "#818cf8" },
  arithmetic: { border: "border-red-400/60",     glow: "shadow-red-400/30",     text: "text-red-400",     bg: "bg-red-400/10",     hex: "#f87171" },
  support:    { border: "border-blue-400/50",    glow: "shadow-blue-400/20",    text: "text-blue-400",    bg: "bg-blue-400/10",    hex: "#60a5fa" },
  output:     { border: "border-emerald-400/50", glow: "shadow-emerald-400/20", text: "text-emerald-400", bg: "bg-emerald-400/10", hex: "#34d399" },
  control:    { border: "border-amber-400/50",   glow: "shadow-amber-400/20",   text: "text-amber-400",   bg: "bg-amber-400/10",   hex: "#fbbf24" },
};

// Governance severity visual encoding
const severityColorMap: Record<FindingSeverity, { border: string; glow: string; pulse: string; hex: string }> = {
  low:      { border: "border-cyan-400/60",    glow: "shadow-cyan-400/40",    pulse: "shadow-[0_0_20px_rgba(34,211,238,0.4)]",    hex: "#22d3ee" },
  medium:   { border: "border-amber-400/70",   glow: "shadow-amber-400/50",   pulse: "shadow-[0_0_25px_rgba(251,191,36,0.5)]",    hex: "#fbbf24" },
  high:     { border: "border-orange-400/80",  glow: "shadow-orange-400/60",  pulse: "shadow-[0_0_30px_rgba(251,146,60,0.6)]",    hex: "#fb923c" },
  critical: { border: "border-red-500/90",     glow: "shadow-red-500/70",     pulse: "shadow-[0_0_40px_rgba(239,68,68,0.7)]",     hex: "#ef4444" },
};

const NODE_RADIUS = 28;
const CANVAS_W = 900;
const CANVAS_H = 700;

function pos(node: ArchitectureNode) {
  return { x: node.nx * CANVAS_W, y: node.ny * CANVAS_H };
}

/* ─── Bezier path between two nodes ───────────────────── */
function edgePath(src: ArchitectureNode, tgt: ArchitectureNode): string {
  const s = pos(src);
  const t = pos(tgt);
  const dy = t.y - s.y;
  const dx = t.x - s.x;

  // Vertical-dominant: use vertical Bezier handles
  if (Math.abs(dy) > Math.abs(dx) * 0.4) {
    const cp1y = s.y + dy * 0.4;
    const cp2y = s.y + dy * 0.6;
    return `M ${s.x} ${s.y} C ${s.x} ${cp1y}, ${t.x} ${cp2y}, ${t.x} ${t.y}`;
  }
  // Horizontal-dominant: horizontal handles
  const cp1x = s.x + dx * 0.5;
  return `M ${s.x} ${s.y} C ${cp1x} ${s.y}, ${cp1x} ${t.y}, ${t.x} ${t.y}`;
}

/* ─── Main Component ──────────────────────────────────── */

interface IntelligenceCanvasProps {
  nodes?: any[];
  dependencies?: any[];
  layers?: any[];
  confidence?: number;
  repositoryMetadata?: RepositoryMetadata | null;
}

export default function IntelligenceCanvas({
  nodes: propNodes,
  dependencies: propDependencies,
  layers: propLayers,
  confidence = 1,
  repositoryMetadata
}: IntelligenceCanvasProps = {}) {
  const [mounted, setMounted] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<ArchitectureNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use provided data (no hardcoded fallback - data always flows from page.tsx)
  const nodes: ArchitectureNode[] = propNodes && propNodes.length > 0 ? propNodes : [];
  const dependencies = propDependencies && propDependencies.length > 0 ? propDependencies : [];
  const layers = propLayers && propLayers.length > 0 ? propLayers : [];
  
  // Cinematic reveal states
  const [revealedLayers, setRevealedLayers] = useState<number[]>([]);
  const [revealedNodes, setRevealedNodes] = useState<string[]>([]);
  const [revealedEdges, setRevealedEdges] = useState<string[]>([]);

  // Story-graph synchronization (bidirectional)
  const { activeStoryId, activeNodes: storyActiveNodes, activeDependencies: storyActiveDeps, setGraphSelectedNodeId } = useStoryGraph();
  const hasStoryFocus = storyActiveNodes.length > 0;

  // Impact analysis integration
  const { impactAnalysis, impactMode, setFocusedImpactNode } = useImpact();
  const hasImpactFocus = impactAnalysis !== null;
  
  // Governance integration
  const {
    governanceMode,
    activeFindings,
    setFocusedFinding,
    activeViolations,
    activeDrift,
    remediatedNodes,
    nodeHealthScores
  } = useGovernance();
  const hasGovernanceFocus = governanceMode === "findings" || governanceMode === "remediation" || governanceMode === "stabilizing";
  
  // Cascading propagation state
  const [propagationWave, setPropagationWave] = useState<string[]>([]);

  useEffect(() => { setMounted(true); }, []);

  // Cascading propagation animation when impact analysis completes
  useEffect(() => {
    if (!impactAnalysis || !mounted) return;

    // Reset propagation wave
    setPropagationWave([]);

    // Start with directly affected nodes
    const directlyAffected = impactAnalysis.directlyAffected;
    setPropagationWave(directlyAffected);

    // Cascade through propagation paths with delays
    impactAnalysis.propagationPaths.forEach((path) => {
      path.nodes.forEach((nodeId: string, nodeIndex: number) => {
        if (nodeIndex === 0) return; // Skip first node (already in directlyAffected)
        
        const delay = path.delay + nodeIndex * 100;
        setTimeout(() => {
          setPropagationWave(prev => [...prev, nodeId]);
        }, delay);
      });
    });

    // Add downstream nodes after propagation paths
    const allPropagatedNodes = new Set([
      ...directlyAffected,
      ...impactAnalysis.propagationPaths.flatMap(p => p.nodes)
    ]);
    
    impactAnalysis.downstreamImpacted.forEach((nodeId: string, index: number) => {
      if (!allPropagatedNodes.has(nodeId)) {
        setTimeout(() => {
          setPropagationWave(prev => [...prev, nodeId]);
        }, 800 + index * 150);
      }
    });

  }, [impactAnalysis, mounted]);

  // Progressive reveal choreography
  useEffect(() => {
    if (!mounted) return;

    // Layer-by-layer reveal sequence
    const layerTimings = [
      { layer: 3, delay: 200 },   // Core arithmetic layer first
      { layer: 2, delay: 600 },   // Unpacking layer
      { layer: 4, delay: 1000 },  // Post-processing
      { layer: 1, delay: 1400 },  // Input layer
      { layer: 5, delay: 1800 },  // Output layer
    ];

    const layerTimers = layerTimings.map(({ layer, delay }) =>
      setTimeout(() => {
        setRevealedLayers(prev => [...prev, layer]);
        
        // Reveal nodes in this layer
        const layerNodes = nodes.filter(n => n.layer === layer);
        layerNodes.forEach((node, idx) => {
          setTimeout(() => {
            setRevealedNodes(prev => [...prev, node.id]);
          }, idx * 100);
        });
      }, delay)
    );

    // Reveal edges after nodes are visible
    const edgeTimer = setTimeout(() => {
      dependencies.forEach((dep, idx) => {
        setTimeout(() => {
          setRevealedEdges(prev => [...prev, `${dep.source}-${dep.target}`]);
        }, idx * 50);
      });
    }, 2400);

    return () => {
      layerTimers.forEach(clearTimeout);
      clearTimeout(edgeTimer);
    };
  }, [mounted]);

  // Build connected-node set for highlighting (includes story mode and impact)
  const connectedNodes = useMemo(() => {
    const set = new Set<string>();
    
    // Impact analysis takes highest priority
    if (hasImpactFocus && impactAnalysis) {
      impactAnalysis.directlyAffected.forEach((nodeId: string) => set.add(nodeId));
      impactAnalysis.downstreamImpacted.forEach((nodeId: string) => set.add(nodeId));
      return set;
    }
    
    // Story mode focus takes second priority
    if (hasStoryFocus) {
      storyActiveNodes.forEach(nodeId => set.add(nodeId));
      return set;
    }
    
    // Otherwise use hover/click focus
    const focusId = hoveredNode ?? activeNode?.id;
    if (!focusId) return set;
    set.add(focusId);
    dependencies.forEach(dep => {
      if (dep.source === focusId) set.add(dep.target);
      if (dep.target === focusId) set.add(dep.source);
    });
    return set;
  }, [hoveredNode, activeNode, hasStoryFocus, storyActiveNodes, hasImpactFocus, impactAnalysis, dependencies]);

  // Secondary neighbors: 2nd-degree connections for soft illumination
  const secondaryNodes = useMemo(() => {
    const set = new Set<string>();
    if (connectedNodes.size === 0) return set;
    connectedNodes.forEach(nodeId => {
      dependencies.forEach(dep => {
        if (dep.source === nodeId && !connectedNodes.has(dep.target)) set.add(dep.target);
        if (dep.target === nodeId && !connectedNodes.has(dep.source)) set.add(dep.source);
      });
    });
    return set;
  }, [connectedNodes, dependencies]);

  // Determine node impact status
  const getNodeImpactStatus = (nodeId: string): 'epicenter' | 'propagating' | 'downstream' | 'risk' | null => {
    if (!impactAnalysis) return null;
    
    if (impactAnalysis.directlyAffected.includes(nodeId)) return 'epicenter';
    
    const inPropagationPath = impactAnalysis.propagationPaths.some(p =>
      p.nodes.includes(nodeId) && !impactAnalysis.directlyAffected.includes(nodeId)
    );
    if (inPropagationPath) return 'propagating';
    
    const hasRisk = impactAnalysis.riskZones.some(r => r.nodeId === nodeId);
    if (hasRisk) return 'risk';
    
    if (impactAnalysis.downstreamImpacted.includes(nodeId)) return 'downstream';
    
    return null;
  };

  // Get node findings for governance mode
  const getNodeFindings = (nodeId: string) => {
    if (!hasGovernanceFocus) return [];
    return activeFindings.filter(f => f.nodeId === nodeId);
  };

  // Get highest severity finding for a node
  const getNodeSeverity = (nodeId: string): FindingSeverity | null => {
    const findings = getNodeFindings(nodeId);
    if (findings.length === 0) return null;
    
    const severityOrder: FindingSeverity[] = ['critical', 'high', 'medium', 'low'];
    for (const severity of severityOrder) {
      if (findings.some(f => f.severity === severity)) return severity;
    }
    return null;
  };

  // Check if node is remediated
  const isNodeRemediated = (nodeId: string) => {
    return remediatedNodes.has(nodeId);
  };

  // Get node health score
  const getNodeHealth = (nodeId: string): number => {
    return nodeHealthScores.get(nodeId) || 100;
  };

  const hasFocus = hoveredNode !== null || activeNode !== null || hasStoryFocus || hasImpactFocus || hasGovernanceFocus;
  const isNodeSecondary = (id: string) => secondaryNodes.has(id);

  if (!mounted) return null;

  return (
    <section className="relative w-full min-h-[100vh] bg-surface-base overflow-hidden flex flex-col items-center justify-center py-16">
      {/* Immersive Grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_85%)] pointer-events-none z-[1]" />


      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-charcoal border border-white/5 mb-5">
          <Layers className="w-4 h-4 text-accent-cyan" />
          <span className="text-xs font-medium text-text-secondary tracking-wider uppercase">System Topology</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
          {repositoryMetadata ? `${repositoryMetadata.owner}/${repositoryMetadata.name}` : 'System Topology'}
        </h2>
        <p className="text-text-secondary mt-2 text-sm font-light">
          {repositoryMetadata?.type ? `${repositoryMetadata.type} · ` : 'Architecture · '}
          Hover to trace data flow · Click to inspect
          {confidence < 1 && (
            <span className="ml-2 text-xs text-amber-400">
              · {Math.round(confidence * 100)}% Confidence
            </span>
          )}
        </p>
      </motion.div>

      {/* Canvas Container */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full px-4"
        style={{ maxWidth: CANVAS_W + 80 }}
      >
        <div className="relative bg-surface-graphite/30 border border-white/[0.06] rounded-[32px] backdrop-blur-sm shadow-[0_0_120px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* SVG Canvas */}
          <svg
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            className="w-full h-auto"
            style={{ display: "block" }}
          >
            {/* Layer separator lines + labels */}
            {layers.map((ll, i) => {
              const y = ll.ny * CANVAS_H;
              return (
                <g key={ll.layer || ll.id}>
                  <line x1={40} y1={y - 20} x2={CANVAS_W - 40} y2={y - 20} stroke="white" strokeOpacity={0.06} strokeWidth={1} />
                  <text x={46} y={y - 26} fill="white" fillOpacity={0.28} fontSize={9} fontFamily="monospace" letterSpacing={2}>
                    {(ll.label || ll.id).toUpperCase()}
                  </text>
                </g>
              );
            })}

            {/* ── Dependency Edges ────────── */}
            {dependencies.map((dep, i) => {
              const src = nodes.find(n => n.id === dep.source);
              const tgt = nodes.find(n => n.id === dep.target);
              if (!src || !tgt) return null;

              const edgeId = `${dep.source}-${dep.target}`;
              const isRevealed = revealedEdges.includes(edgeId);
              
              // Check if this edge is part of story mode active path
              const isStoryActive = hasStoryFocus && storyActiveDeps.some(
                d => d.source === dep.source && d.target === dep.target
              );
              const isSecondaryEdge = secondaryNodes.has(dep.source) || secondaryNodes.has(dep.target);
              const isHighlighted = isStoryActive || (connectedNodes.has(dep.source) && connectedNodes.has(dep.target));
              const isFaded = hasFocus && !isHighlighted;
              const d = edgePath(src, tgt);
              const srcColor = colorMap[src.type]?.hex ?? "#fff";

              if (!isRevealed) return null;

              return (
                <g key={edgeId}>
                  {/* Base path with cinematic reveal */}
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={isHighlighted ? srcColor : "#ffffff"}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: isFaded ? (isSecondaryEdge ? 0.18 : 0.1) : isStoryActive ? 0.7 : isHighlighted ? 0.55 : 0.3,
                      strokeWidth: isStoryActive ? 2.5 : isHighlighted ? 1.8 : 1,
                    }}
                    transition={{
                      pathLength: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.5 },
                      strokeWidth: { duration: 0.4 }
                    }}
                    strokeDasharray={dep.type === "async" ? "5 5" : dep.type === "stream" ? "8 4" : "0"}
                  />
                  {/* Animated flow pulse - enhanced for story mode */}
                  {(!isFaded) && (
                    <>
                      {/* Primary signal */}
                      <motion.circle
                        r={isStoryActive ? 3 : isHighlighted ? 2.5 : 1.5}
                        fill={srcColor}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isStoryActive ? 0.8 : isHighlighted ? 0.6 : 0.25 }}
                        transition={{ duration: 0.5 }}
                      >
                        <animateMotion
                          dur={isStoryActive ? "2s" : `${2.5 + i * 0.3}s`}
                          repeatCount="indefinite"
                          path={d}
                        />
                      </motion.circle>
                      
                      {/* Ambient trailing signal — always present for computational life */}
                      <circle
                        r={1}
                        fill={srcColor}
                        opacity={isStoryActive ? 0.3 : isHighlighted ? 0.25 : 0.12}
                      >
                        <animateMotion
                          dur={`${4 + i * 0.5}s`}
                          repeatCount="indefinite"
                          path={d}
                          begin={`${i * 0.3}s`}
                        />
                      </circle>
                      {/* Second trailing dot offset for depth */}
                      <circle
                        r={0.7}
                        fill={srcColor}
                        opacity={0.08}
                      >
                        <animateMotion
                          dur={`${5 + i * 0.6}s`}
                          repeatCount="indefinite"
                          path={d}
                          begin={`${1.5 + i * 0.25}s`}
                        />
                      </circle>
                    </>
                  )}
                </g>
              );
            })}

            {/* ── Arithmetic Core Glow ─────────────── */}
            {(() => {
              const arithmeticNodes = nodes.filter(n => n.type === "arithmetic");
              if (arithmeticNodes.length === 0) return null;
              // Center glow around the middle arithmetic node (safe index)
              const centerNode = arithmeticNodes[Math.min(1, arithmeticNodes.length - 1)];
              if (!centerNode) return null;
              const p = pos(centerNode);
              return (
                <>
                  <circle cx={p.x} cy={p.y} r={50} fill="url(#arithmeticGlow)" opacity={hasFocus && !connectedNodes.has(centerNode.id) ? 0.04 : 0.1}>
                    <animate attributeName="r" values="46;54;46" dur="5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.08;0.14;0.08" dur="5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={p.x} cy={p.y} r={34} fill="none" stroke="#f87171" strokeWidth={1} strokeOpacity={0.15}>
                    <animate attributeName="r" values="34;40;34" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.15;0.05;0.15" dur="3s" repeatCount="indefinite" />
                  </circle>
                </>
              );
            })()}

            {/* Gradient defs */}
            <defs>
              <radialGradient id="arithmeticGlow">
                <stop offset="0%" stopColor="#f87171" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
              </radialGradient>
            </defs>

            {/* ── Nodes ───────────────────── */}
            {nodes.map((node, nodeIndex) => {
              const p = pos(node);
              const c = colorMap[node.type] || colorMap.support;
              const isRevealed = revealedNodes.includes(node.id);
              
              // Impact analysis status
              const impactStatus = getNodeImpactStatus(node.id);
              const isInPropagationWave = propagationWave.includes(node.id);
              
              // Story mode highlighting
              const isStoryActive = hasStoryFocus && storyActiveNodes.includes(node.id);
              const isFaded = hasFocus && !connectedNodes.has(node.id);
              const isHovered = hoveredNode === node.id;
              const isActive = activeNode?.id === node.id;
              const isArithmetic = node.type === "arithmetic";

              // Governance visual encoding
              const nodeSeverity = getNodeSeverity(node.id);
              const nodeFindings = getNodeFindings(node.id);
              const isRemediated = isNodeRemediated(node.id);
              const nodeHealth = getNodeHealth(node.id);
              const severityColor = nodeSeverity ? severityColorMap[nodeSeverity] : null;

              // Impact visual encoding
              const impactColor = impactStatus === 'epicenter' ? '#a855f7' : // Purple
                                  impactStatus === 'propagating' ? '#f97316' : // Orange
                                  impactStatus === 'downstream' ? '#fb923c' : // Light orange
                                  impactStatus === 'risk' ? '#ef4444' : // Red
                                  null;

              // Priority: Governance > Impact > Story
              const hasGovernanceIssue = nodeSeverity !== null && !isRemediated;
              const visualPriority = hasGovernanceIssue ? 'governance' : impactStatus ? 'impact' : isStoryActive ? 'story' : 'normal';

              if (!isRevealed) return null;

              return (
                <motion.g
                  key={node.id}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => {
                    // Priority: Governance > Impact > Normal
                    if (hasGovernanceIssue && nodeFindings.length > 0) {
                      const findingWithRemediation = nodeFindings.find(f => f.remediation);
                      if (findingWithRemediation) {
                        setFocusedFinding(findingWithRemediation);
                      } else {
                        setActiveNode(isActive ? null : node);
                      }
                    } else if (impactStatus && hasImpactFocus) {
                      setFocusedImpactNode(node.id);
                    } else {
                      setActiveNode(isActive ? null : node);
                      // Bidirectional sync: signal StoryMode to navigate to matching step
                      if (!isActive) {
                        setGraphSelectedNodeId(node.id);
                      }
                    }
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: isFaded ? (isNodeSecondary(node.id) ? 0.6 : 0.5) : 1,
                    scale: 1
                  }}
                  transition={{
                    opacity: { duration: 0.5 },
                    scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1], type: "spring", bounce: 0.3 }
                  }}
                >
                  {/* Governance severity glow - HIGHEST priority */}
                  {hasGovernanceIssue && severityColor && (
                    <>
                      {/* Outer warning pulse */}
                      <motion.circle
                        cx={p.x}
                        cy={p.y}
                        r={NODE_RADIUS + 18}
                        fill={severityColor.hex}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0.15, 0, 0.15],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: nodeSeverity === 'critical' ? 1.5 : nodeSeverity === 'high' ? 2 : 2.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      {/* Inner severity glow */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={NODE_RADIUS + 12}
                        fill={severityColor.hex}
                        opacity={nodeSeverity === 'critical' ? 0.25 : nodeSeverity === 'high' ? 0.2 : 0.15}
                      >
                        <animate
                          attributeName="r"
                          values={`${NODE_RADIUS + 12};${NODE_RADIUS + 16};${NODE_RADIUS + 12}`}
                          dur={nodeSeverity === 'critical' ? "1.5s" : nodeSeverity === 'high' ? "2s" : "2.5s"}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values={nodeSeverity === 'critical' ? "0.2;0.35;0.2" : nodeSeverity === 'high' ? "0.15;0.3;0.15" : "0.1;0.2;0.1"}
                          dur={nodeSeverity === 'critical' ? "1.5s" : nodeSeverity === 'high' ? "2s" : "2.5s"}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}

                  {/* Health recovery glow - for remediated nodes */}
                  {isRemediated && (
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={NODE_RADIUS + 10}
                      fill="#10b981"
                      initial={{ opacity: 0.6, scale: 0.8 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  )}

                  {/* Impact blast radius glow */}
                  {impactStatus && isInPropagationWave && !hasGovernanceIssue && (
                    <>
                      {/* Outer blast wave */}
                      <motion.circle
                        cx={p.x}
                        cy={p.y}
                        r={NODE_RADIUS + 20}
                        fill={impactColor || undefined}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0.4, 0, 0], scale: [0.5, 2, 2] }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                      {/* Inner intense glow */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={NODE_RADIUS + 15}
                        fill={impactColor || undefined}
                        opacity={impactStatus === 'epicenter' ? 0.4 : impactStatus === 'risk' ? 0.35 : 0.25}
                      >
                        <animate
                          attributeName="r"
                          values={`${NODE_RADIUS + 15};${NODE_RADIUS + 22};${NODE_RADIUS + 15}`}
                          dur={impactStatus === 'epicenter' ? "1.5s" : "2s"}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values={impactStatus === 'epicenter' ? "0.3;0.5;0.3" : impactStatus === 'risk' ? "0.25;0.45;0.25" : "0.15;0.3;0.15"}
                          dur={impactStatus === 'epicenter' ? "1.5s" : "2s"}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}

                  {/* Enhanced breathing glow for story mode */}
                  {!isFaded && !impactStatus && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isStoryActive ? NODE_RADIUS + 12 : NODE_RADIUS + 8}
                      fill={c.hex}
                      opacity={isStoryActive ? 0.12 : 0.06}
                    >
                      <animate
                        attributeName="r"
                        values={isStoryActive
                          ? `${NODE_RADIUS + 10};${NODE_RADIUS + 14};${NODE_RADIUS + 10}`
                          : `${NODE_RADIUS + 8};${NODE_RADIUS + 11};${NODE_RADIUS + 8}`
                        }
                        dur={isStoryActive ? "2.5s" : "3.5s"}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values={isStoryActive ? "0.1;0.2;0.1" : "0.05;0.1;0.05"}
                        dur={isStoryActive ? "2s" : "3s"}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  
                  {/* Governance severity ring - HIGHEST priority */}
                  {hasGovernanceIssue && severityColor && (
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={NODE_RADIUS + 10}
                      fill="none"
                      stroke={severityColor.hex}
                      strokeWidth={nodeSeverity === 'critical' ? 3.5 : nodeSeverity === 'high' ? 3 : 2.5}
                      initial={{ strokeOpacity: 0, scale: 0.8 }}
                      animate={{ strokeOpacity: 0.9, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <animate
                        attributeName="r"
                        values={`${NODE_RADIUS + 10};${NODE_RADIUS + 14};${NODE_RADIUS + 10}`}
                        dur={nodeSeverity === 'critical' ? "1.2s" : nodeSeverity === 'high' ? "1.5s" : "2s"}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-opacity"
                        values={nodeSeverity === 'critical' ? "0.9;0.6;0.9" : "0.8;0.5;0.8"}
                        dur={nodeSeverity === 'critical' ? "1.2s" : nodeSeverity === 'high' ? "1.5s" : "2s"}
                        repeatCount="indefinite"
                      />
                    </motion.circle>
                  )}
                  
                  {/* Impact status ring */}
                  {impactStatus && isInPropagationWave && !hasGovernanceIssue && (
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={NODE_RADIUS + 10}
                      fill="none"
                      stroke={impactColor || undefined}
                      strokeWidth={impactStatus === 'epicenter' ? 3 : impactStatus === 'risk' ? 2.5 : 2}
                      initial={{ strokeOpacity: 0, scale: 0.8 }}
                      animate={{ strokeOpacity: 0.8, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <animate
                        attributeName="r"
                        values={`${NODE_RADIUS + 10};${NODE_RADIUS + 14};${NODE_RADIUS + 10}`}
                        dur={impactStatus === 'epicenter' ? "1.5s" : "2s"}
                        repeatCount="indefinite"
                      />
                    </motion.circle>
                  )}
                  
                  {/* Story mode active ring */}
                  {isStoryActive && !impactStatus && (
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={NODE_RADIUS + 8}
                      fill="none"
                      stroke={c.hex}
                      strokeWidth={2}
                      initial={{ strokeOpacity: 0, scale: 0.8 }}
                      animate={{ strokeOpacity: 0.6, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <animate
                        attributeName="r"
                        values={`${NODE_RADIUS + 8};${NODE_RADIUS + 12};${NODE_RADIUS + 8}`}
                        dur="2s"
                        repeatCount="indefinite"
                      />
                    </motion.circle>
                  )}
                  
                  {/* Hover ring */}
                  {(isHovered || isActive) && !isStoryActive && (
                    <circle cx={p.x} cy={p.y} r={NODE_RADIUS + 6} fill="none" stroke={c.hex} strokeWidth={1.5} strokeOpacity={0.4}>
                      {isActive && <animate attributeName="r" values={`${NODE_RADIUS + 6};${NODE_RADIUS + 10};${NODE_RADIUS + 6}`} dur="2s" repeatCount="indefinite" />}
                    </circle>
                  )}
                  
                  {/* Node body with governance, impact, and story mode styling */}
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r={isArithmetic ? NODE_RADIUS + 4 : NODE_RADIUS}
                    fill={isRemediated ? "#0a1a0a" : "#111111"}
                    stroke={
                      hasGovernanceIssue && severityColor ? severityColor.hex :
                      isRemediated ? "#10b981" :
                      impactStatus && isInPropagationWave ? (impactColor || c.hex) :
                      c.hex
                    }
                    strokeWidth={
                      hasGovernanceIssue ? (nodeSeverity === 'critical' ? 3.5 : nodeSeverity === 'high' ? 3 : 2.5) :
                      isRemediated ? 2.5 :
                      impactStatus ? 3 :
                      isStoryActive ? 2.5 :
                      isActive ? 2 : 1
                    }
                    initial={{ strokeOpacity: 0 }}
                    animate={{
                      strokeOpacity:
                        hasGovernanceIssue ? 0.9 :
                        isRemediated ? 0.8 :
                        impactStatus && isInPropagationWave ? 0.9 :
                        isStoryActive ? 0.7 :
                        isActive || isHovered ? 0.6 : 0.35,
                      scale:
                        hasGovernanceIssue ? 1.04 :
                        isRemediated ? 1.02 :
                        impactStatus && isInPropagationWave ? 1.05 :
                        isStoryActive ? 1.03 : 1
                    }}
                    transition={{ duration: 0.4 }}
                  />
                  {/* Icon placeholder — rendered via foreignObject */}
                  <foreignObject x={p.x - 12} y={p.y - 12} width={24} height={24} style={{ pointerEvents: "none" }}>
                    <motion.div
                      className={`w-6 h-6 flex items-center justify-center ${c.text}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {iconMap[node.type] || <Box className="w-5 h-5" />}
                    </motion.div>
                  </foreignObject>
                  
                  {/* Label with fade-in — projector-safe drop shadow */}
                  <motion.text
                    x={p.x}
                    y={p.y + NODE_RADIUS + 16}
                    textAnchor="middle"
                    fill="white"
                    initial={{ opacity: 0, y: p.y + NODE_RADIUS + 10 }}
                    animate={{
                      opacity: isFaded ? (isNodeSecondary(node.id) ? 0.55 : 0.45) : isHovered || isActive ? 1 : 0.85,
                      y: p.y + NODE_RADIUS + 16
                    }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    fontSize={11}
                    fontWeight={isArithmetic ? 600 : 500}
                    letterSpacing={0.5}
                    fontFamily="inherit"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))' }}
                  >
                    {node.label}
                  </motion.text>
                  
                  {/* Criticality dot with pulse */}
                  {node.criticality === "critical" && !isFaded && (
                    <motion.circle
                      cx={p.x + NODE_RADIUS - 4}
                      cy={p.y - NODE_RADIUS + 4}
                      r={4}
                      fill="#ef4444"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
                    </motion.circle>
                  )}
                  
                  {/* Governance findings badge - HIGHEST priority */}
                  {hasGovernanceIssue && nodeFindings.length > 0 && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <circle
                        cx={p.x + NODE_RADIUS - 2}
                        cy={p.y - NODE_RADIUS + 2}
                        r={8}
                        fill={severityColor?.hex}
                        opacity={0.95}
                      >
                        <animate attributeName="opacity" values="0.95;0.7;0.95" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <foreignObject
                        x={p.x + NODE_RADIUS - 10}
                        y={p.y - NODE_RADIUS - 6}
                        width={16}
                        height={16}
                        style={{ pointerEvents: "none" }}
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      </foreignObject>
                      {/* Finding count */}
                      {nodeFindings.length > 1 && (
                        <text
                          x={p.x + NODE_RADIUS + 6}
                          y={p.y - NODE_RADIUS + 5}
                          fill="white"
                          fontSize={9}
                          fontWeight={600}
                          textAnchor="middle"
                        >
                          {nodeFindings.length}
                        </text>
                      )}
                    </motion.g>
                  )}

                  {/* Remediation success badge */}
                  {isRemediated && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                    >
                      <circle
                        cx={p.x + NODE_RADIUS - 2}
                        cy={p.y - NODE_RADIUS + 2}
                        r={7}
                        fill="#10b981"
                        opacity={0.9}
                      />
                      <foreignObject
                        x={p.x + NODE_RADIUS - 9}
                        y={p.y - NODE_RADIUS - 5}
                        width={14}
                        height={14}
                        style={{ pointerEvents: "none" }}
                      >
                        <div className="w-3.5 h-3.5 flex items-center justify-center text-white">
                          ✓
                        </div>
                      </foreignObject>
                    </motion.g>
                  )}
                  
                  {/* Impact severity indicator */}
                  {impactStatus && isInPropagationWave && !hasGovernanceIssue && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <circle
                        cx={p.x + NODE_RADIUS - 2}
                        cy={p.y - NODE_RADIUS + 2}
                        r={6}
                        fill={impactColor || undefined}
                        opacity={0.9}
                      >
                        <animate attributeName="opacity" values="0.9;0.5;0.9" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <foreignObject
                        x={p.x + NODE_RADIUS - 8}
                        y={p.y - NODE_RADIUS - 4}
                        width={12}
                        height={12}
                        style={{ pointerEvents: "none" }}
                      >
                        <div className="w-3 h-3 flex items-center justify-center text-white">
                          <AlertTriangle className="w-2.5 h-2.5" />
                        </div>
                      </foreignObject>
                    </motion.g>
                  )}
                </motion.g>
              );
            })}
          </svg>
        </div>
      </motion.div>

      {/* ── Contextual Insight Panel ─────────────── */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-6 top-1/2 -translate-y-1/2 w-[380px] bg-surface-graphite/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)] flex flex-col z-50 max-h-[80vh]"
          >
            <button
              onClick={() => setActiveNode(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl ${colorMap[activeNode.type].bg} border ${colorMap[activeNode.type].border} flex items-center justify-center ${colorMap[activeNode.type].text}`}>
                {iconMap[activeNode.type] || <Box />}
              </div>
              <div>
                <h4 className="text-white font-medium text-lg leading-tight">{activeNode.label}</h4>
                <p className="text-[11px] text-text-secondary uppercase tracking-wider mt-0.5">Layer {activeNode.layer} · {activeNode.type}</p>
              </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">Description</h5>
                <p className="text-sm text-white/75 leading-relaxed font-light">{activeNode.description}</p>
              </div>

              <div className="space-y-2">
                <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest">System Properties</h5>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Criticality</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${activeNode.criticality === "critical" ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : activeNode.criticality === "high" ? "bg-orange-400" : "bg-emerald-400"}`} />
                    <span className="text-sm text-white capitalize">{activeNode.criticality}</span>
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Connections</span>
                  <span className="text-sm text-white font-mono">
                    {dependencies.filter(d => d.source === activeNode.id || d.target === activeNode.id).length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Tech Stack</h5>
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.technologies.map(tech => (
                    <span key={tech} className="px-2.5 py-1 bg-surface-charcoal border border-white/[0.06] rounded-lg text-xs text-white/80">{tech}</span>
                  ))}
                </div>
              </div>

              {/* Dependency list */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Dependencies</h5>
                {dependencies
                  .filter(d => d.source === activeNode.id || d.target === activeNode.id)
                  .map(dep => {
                    const isOutgoing = dep.source === activeNode.id;
                    const otherId = isOutgoing ? dep.target : dep.source;
                    const other = nodes.find(n => n.id === otherId);
                    return (
                      <div key={`${dep.source}-${dep.target}`} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                        <span className="text-[10px] font-mono text-white/30 w-6">{isOutgoing ? "→" : "←"}</span>
                        <div className="flex-1">
                          <span className="text-sm text-white/80">{other?.label ?? otherId}</span>
                          <span className="text-xs text-text-secondary ml-2">({dep.type})</span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {activeNode.criticality === "critical" && (
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <h5 className="text-[10px] font-mono text-accent-cyan/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    IBM Bob Intelligence
                  </h5>
                  <div className="bg-accent-cyan/[0.04] border border-accent-cyan/15 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                      <p className="text-xs text-accent-cyan/80 leading-relaxed">
                        <span className="font-medium text-accent-cyan">Bob Analysis:</span>{" "}
                        This is a critical module with {dependencies.filter(d => d.source === activeNode.id || d.target === activeNode.id).length} connections. {
                          activeNode.type === "arithmetic"
                            ? "Operations execute in parallel for maximum throughput. Bob recommends pipelining for higher clock frequencies."
                            : activeNode.type === "unpacker"
                            ? "Unpacking extracts logical components. Bob notes processing precision is doubled without extra storage."
                            : "Heavy coupling detected. Bob recommends facade patterns to decouple downstream dependencies."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bob insight for non-critical nodes too */}
              {activeNode.criticality !== "critical" && (
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <h5 className="text-[10px] font-mono text-accent-cyan/50 uppercase tracking-widest flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    IBM Bob Intelligence
                  </h5>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-text-secondary shrink-0 mt-0.5" />
                      <p className="text-xs text-text-secondary leading-relaxed">
                        <span className="font-medium text-white/60">Bob Status:</span>{" "}
                        Module is operating within normal parameters. {
                          dependencies.filter(d => d.source === activeNode.id || d.target === activeNode.id).length > 3
                            ? "Bob notes elevated connection count — monitor for coupling drift."
                            : "Coupling levels are acceptable. No governance issues detected."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Impact Insight Panel - Shows when impact node is clicked */}
      <ImpactInsightPanel nodes={nodes} />

      {/* Patch Preview Panel - Shows when governance finding is clicked */}
      <PatchPreviewPanel />
    </section>
  );
}

/* ─── Helper Components ───────────────────────────────── */

function NetworkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </svg>
  );
}
