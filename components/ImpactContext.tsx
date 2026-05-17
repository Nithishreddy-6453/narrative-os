"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ImpactAnalysis } from "@/data/realRepo";

interface ImpactContextType {
  impactAnalysis: ImpactAnalysis | null;
  setImpactAnalysis: (analysis: ImpactAnalysis | null) => void;
  impactMode: "idle" | "analyzing" | "visualizing" | "complete";
  setImpactMode: (mode: "idle" | "analyzing" | "visualizing" | "complete") => void;
  focusedImpactNode: string | null;
  setFocusedImpactNode: (nodeId: string | null) => void;
}

const ImpactContext = createContext<ImpactContextType | undefined>(undefined);

export function ImpactProvider({ children }: { children: ReactNode }) {
  const [impactAnalysis, setImpactAnalysis] = useState<ImpactAnalysis | null>(null);
  const [impactMode, setImpactMode] = useState<"idle" | "analyzing" | "visualizing" | "complete">("idle");
  const [focusedImpactNode, setFocusedImpactNode] = useState<string | null>(null);

  return (
    <ImpactContext.Provider
      value={{
        impactAnalysis,
        setImpactAnalysis,
        impactMode,
        setImpactMode,
        focusedImpactNode,
        setFocusedImpactNode,
      }}
    >
      {children}
    </ImpactContext.Provider>
  );
}

export function useImpact() {
  const context = useContext(ImpactContext);
  if (context === undefined) {
    throw new Error("useImpact must be used within an ImpactProvider");
  }
  return context;
}

// Made with Bob
