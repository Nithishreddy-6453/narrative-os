"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { 
  BobFinding, 
  GovernanceViolation, 
  ArchitecturalDrift,
  BobRemediation 
} from "@/data/realRepo";

export type GovernanceMode = "idle" | "reviewing" | "findings" | "remediation" | "stabilizing";

interface GovernanceContextType {
  // Mode state
  governanceMode: GovernanceMode;
  setGovernanceMode: (mode: GovernanceMode) => void;
  
  // Findings state
  activeFindings: BobFinding[];
  setActiveFindings: (findings: BobFinding[]) => void;
  focusedFinding: BobFinding | null;
  setFocusedFinding: (finding: BobFinding | null) => void;
  
  // Violations state
  activeViolations: GovernanceViolation[];
  setActiveViolations: (violations: GovernanceViolation[]) => void;
  focusedViolation: GovernanceViolation | null;
  setFocusedViolation: (violation: GovernanceViolation | null) => void;
  
  // Drift state
  activeDrift: ArchitecturalDrift[];
  setActiveDrift: (drift: ArchitecturalDrift[]) => void;
  focusedDrift: ArchitecturalDrift | null;
  setFocusedDrift: (drift: ArchitecturalDrift | null) => void;
  
  // Remediation state
  activeRemediation: BobRemediation | null;
  setActiveRemediation: (remediation: BobRemediation | null) => void;
  remediatedNodes: Set<string>;
  addRemediatedNode: (nodeId: string) => void;
  
  // Node health tracking
  nodeHealthScores: Map<string, number>;
  updateNodeHealth: (nodeId: string, score: number) => void;
  
  // Review session
  reviewSessionActive: boolean;
  setReviewSessionActive: (active: boolean) => void;
  reviewStartTime: Date | null;
  setReviewStartTime: (time: Date | null) => void;
  
  // Export state
  auditLogReady: boolean;
  setAuditLogReady: (ready: boolean) => void;
}

const GovernanceContext = createContext<GovernanceContextType | undefined>(undefined);

export function GovernanceProvider({ children }: { children: ReactNode }) {
  // Mode state
  const [governanceMode, setGovernanceMode] = useState<GovernanceMode>("idle");
  
  // Findings state
  const [activeFindings, setActiveFindings] = useState<BobFinding[]>([]);
  const [focusedFinding, setFocusedFinding] = useState<BobFinding | null>(null);
  
  // Violations state
  const [activeViolations, setActiveViolations] = useState<GovernanceViolation[]>([]);
  const [focusedViolation, setFocusedViolation] = useState<GovernanceViolation | null>(null);
  
  // Drift state
  const [activeDrift, setActiveDrift] = useState<ArchitecturalDrift[]>([]);
  const [focusedDrift, setFocusedDrift] = useState<ArchitecturalDrift | null>(null);
  
  // Remediation state
  const [activeRemediation, setActiveRemediation] = useState<BobRemediation | null>(null);
  const [remediatedNodes, setRemediatedNodes] = useState<Set<string>>(new Set());
  
  const addRemediatedNode = (nodeId: string) => {
    setRemediatedNodes(prev => new Set(prev).add(nodeId));
  };
  
  // Node health tracking
  const [nodeHealthScores, setNodeHealthScores] = useState<Map<string, number>>(new Map());
  
  const updateNodeHealth = (nodeId: string, score: number) => {
    setNodeHealthScores(prev => new Map(prev).set(nodeId, score));
  };
  
  // Review session
  const [reviewSessionActive, setReviewSessionActive] = useState(false);
  const [reviewStartTime, setReviewStartTime] = useState<Date | null>(null);
  
  // Export state
  const [auditLogReady, setAuditLogReady] = useState(false);

  return (
    <GovernanceContext.Provider
      value={{
        governanceMode,
        setGovernanceMode,
        activeFindings,
        setActiveFindings,
        focusedFinding,
        setFocusedFinding,
        activeViolations,
        setActiveViolations,
        focusedViolation,
        setFocusedViolation,
        activeDrift,
        setActiveDrift,
        focusedDrift,
        setFocusedDrift,
        activeRemediation,
        setActiveRemediation,
        remediatedNodes,
        addRemediatedNode,
        nodeHealthScores,
        updateNodeHealth,
        reviewSessionActive,
        setReviewSessionActive,
        reviewStartTime,
        setReviewStartTime,
        auditLogReady,
        setAuditLogReady,
      }}
    >
      {children}
    </GovernanceContext.Provider>
  );
}

export function useGovernance() {
  const context = useContext(GovernanceContext);
  if (context === undefined) {
    throw new Error("useGovernance must be used within a GovernanceProvider");
  }
  return context;
}

// Made with Bob