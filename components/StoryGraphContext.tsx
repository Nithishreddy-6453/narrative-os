"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface StoryGraphContextType {
  // Story → Graph (StoryMode sets these)
  activeStoryId: string | null;
  setActiveStoryId: (id: string | null) => void;
  activeNodes: string[];
  setActiveNodes: (nodes: string[]) => void;
  activeDependencies: { source: string; target: string }[];
  setActiveDependencies: (deps: { source: string; target: string }[]) => void;

  // Graph → Story (IntelligenceCanvas sets these)
  graphSelectedNodeId: string | null;
  setGraphSelectedNodeId: (id: string | null) => void;
}

const StoryGraphContext = createContext<StoryGraphContextType | undefined>(undefined);

export function StoryGraphProvider({ children }: { children: ReactNode }) {
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [activeNodes, setActiveNodes] = useState<string[]>([]);
  const [activeDependencies, setActiveDependencies] = useState<{ source: string; target: string }[]>([]);

  // Reverse sync: Graph node click → StoryMode navigation
  const [graphSelectedNodeId, setGraphSelectedNodeId] = useState<string | null>(null);

  return (
    <StoryGraphContext.Provider
      value={{
        activeStoryId,
        setActiveStoryId,
        activeNodes,
        setActiveNodes,
        activeDependencies,
        setActiveDependencies,
        graphSelectedNodeId,
        setGraphSelectedNodeId,
      }}
    >
      {children}
    </StoryGraphContext.Provider>
  );
}

export function useStoryGraph() {
  const context = useContext(StoryGraphContext);
  if (context === undefined) {
    throw new Error("useStoryGraph must be used within a StoryGraphProvider");
  }
  return context;
}

// Made with Bob
