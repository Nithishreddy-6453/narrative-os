"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import RepoInputSection from "@/components/RepoInputSection";
import IntelligenceCanvas from "@/components/IntelligenceCanvas";
import StoryMode from "@/components/StoryMode";
import BobShellStream from "@/components/BobShellStream";
import ImpactSimulatorInput from "@/components/ImpactSimulatorInput";
import { StoryGraphProvider } from "@/components/StoryGraphContext";
import { ImpactProvider } from "@/components/ImpactContext";
import { GovernanceProvider } from "@/components/GovernanceContext";
import GovernanceModeToggle from "@/components/GovernanceModeToggle";
import { repositoryService, parserService, transformService, bobService } from "@/services";
import { FileText, Shield, Zap, Activity } from "lucide-react";
import type {       
  RepositoryMetadata,
  ParsedRepository,
  ValidationResult,
  ParsingProgress
} from "@/types/repository";
import type { NarrativeStoryGraph } from "@/services/transformService";
import type { BobAuditExport } from "@/services/bobService";
import { bobFindings, governanceViolations, architecturalDrift } from "@/data/realRepo";

type AppState = "idle" | "validating" | "parsing" | "orchestrating" | "revealing" | "analyzed";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [showCanvas, setShowCanvas] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [isAnalyzingImpact, setIsAnalyzingImpact] = useState(false);
  
  // Repository analysis state
  const [repositoryUrl, setRepositoryUrl] = useState<string>("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [repositoryMetadata, setRepositoryMetadata] = useState<RepositoryMetadata | null>(null);
  const [parsedRepository, setParsedRepository] = useState<ParsedRepository | null>(null);
  const [storyGraph, setStoryGraph] = useState<NarrativeStoryGraph | null>(null);
  const [parsingProgress, setParsingProgress] = useState<ParsingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Bob integration state
  const [bobConnectionStatus, setBobConnectionStatus] = useState<'connected' | 'fallback'>('fallback');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  // Check Bob connection on mount
  useEffect(() => {
    setBobConnectionStatus(bobService.getConnectionStatus());
  }, []);

  // Handle repository scan start
  const handleScanStart = async (url: string) => {
    try {
      setError(null);
      setRepositoryUrl(url);
      setAppState("validating");

      // Step 1: Validate GitHub URL
      const validation = await repositoryService.validateUrl(url);
      setValidationResult(validation);

      if (!validation.valid || !validation.repoInfo) {
        setError(validation.error || "Invalid repository URL");
        setAppState("idle");
        return;
      }

      // Step 2: Extract repository info and create metadata
      const { owner, name, branch } = validation.repoInfo;
      const metadata: RepositoryMetadata = {
        url,
        owner,
        name,
        branch,
        clonedAt: new Date(),
        fileCount: 0,
        language: null,
        framework: null,
        type: 'unknown',
      };
      setRepositoryMetadata(metadata);

      // Step 3: Detect repository type
      setAppState("parsing");
      const repoType = parserService.detectRepositoryType(metadata);

      // Set up progress callback
      parserService.setProgressCallback((progress) => {
        setParsingProgress(progress);
      });

      // Step 4: Parse repository
      const parsed = await parserService.parse(metadata, repoType);
      setParsedRepository(parsed);

      // Step 5: Transform to story graph format
      const transformed = transformService.transform(parsed);
      setStoryGraph(transformed);

      // Step 6: Transition to orchestration
      setAppState("orchestrating");
    } catch (err) {
      console.error("Error during repository analysis:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze repository");
      setAppState("idle");
    }
  };

  // Cinematic staged reveal after Bob orchestration
  useEffect(() => {
    if (appState === "revealing") {
      const transitionTimer = setTimeout(() => {
        setShowCanvas(true);
      }, 600);

      const storyTimer = setTimeout(() => {
        setShowStory(true);
      }, 2200);

      const completeTimer = setTimeout(() => {
        setAppState("analyzed");
      }, 2800);

      return () => {
        clearTimeout(transitionTimer);
        clearTimeout(storyTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [appState]);

  // Reset state when returning to idle
  const handleReset = () => {
    setAppState("idle");
    setShowCanvas(false);
    setShowStory(false);
    setRepositoryUrl("");
    setValidationResult(null);
    setRepositoryMetadata(null);
    setParsedRepository(null);
    setStoryGraph(null);
    setParsingProgress(null);
    setError(null);
    setExportComplete(false);
    bobService.clearOrchestrationHistory();
  };

  // Handle audit export
  const handleExportAudit = useCallback(async () => {
    if (isExporting || !repositoryMetadata || !storyGraph) return;

    setIsExporting(true);
    setExportComplete(false);

    try {
      const auditExport = await bobService.generateAuditExport(
        repositoryMetadata.name,
        repositoryMetadata.owner,
        storyGraph.nodes,
        bobFindings,
        governanceViolations,
        architecturalDrift,
        new Set<string>()
      );

      // Generate downloadable report
      const reportContent = generateAuditReport(auditExport);
      const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ibm-bob-audit-${repositoryMetadata.owner}-${repositoryMetadata.name}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 4000);
    } catch (err) {
      console.error('[IBM Bob] Audit export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, repositoryMetadata, storyGraph]);

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-surface-base selection:bg-accent-cyan/20 selection:text-accent-cyan relative">
      {/* Ambient Top Glow */}
      <div className="fixed top-0 inset-x-0 h-[500px] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none z-0"></div>
      
      <AnimatePresence mode="wait">
        {appState === "idle" && (
          <motion.div 
            key="idle"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex-1 flex flex-col z-10"
          >
            <HeroSection />
            <div className="relative bg-surface-base z-20">
              <RepoInputSection
                onScanStart={handleScanStart}
                validationResult={validationResult}
                error={error}
              />
            </div>
          </motion.div>
        )}

        {appState === "orchestrating" && (
          <BobShellStream
            key="bob-orchestration"
            onComplete={() => setAppState("revealing")}
            repositoryMetadata={repositoryMetadata}
            parsingProgress={parsingProgress}
          />
        )}

        {(appState === "revealing" || appState === "analyzed") && (
          <GovernanceProvider>
            <motion.div
              key="analyzed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full relative z-10 bg-surface-base flex-1"
            >
              {/* Intelligence Mode Top Bar */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="sticky top-0 z-50 bg-surface-base/80 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                  <span className="text-sm font-medium text-white tracking-wide">NarrativeOS</span>
                  <span className="text-xs text-text-secondary">· Intelligence Active</span>
                  {/* Bob Connection Status */}
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                    bobConnectionStatus === 'connected' 
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan'
                  }`}>
                    <Activity className="w-3 h-3" />
                    <span>IBM Bob {bobConnectionStatus === 'connected' ? 'API' : 'Engine'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GovernanceModeToggle />
                  
                  {/* Export Enterprise Audit Log */}
                  <motion.button
                    onClick={handleExportAudit}
                    disabled={isExporting}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      exportComplete
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : isExporting
                        ? 'bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan'
                        : 'bg-surface-charcoal border border-white/10 hover:border-accent-cyan/30 text-white/80 hover:text-white hover:bg-accent-cyan/5'
                    }`}
                  >
                    {exportComplete ? (
                      <>
                        <Shield className="w-4 h-4" />
                        Audit Exported
                      </>
                    ) : isExporting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-4 h-4" />
                        </motion.div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Export Audit Log
                      </>
                    )}
                  </motion.button>

                  <button
                    onClick={handleReset}
                    className="text-xs text-text-secondary hover:text-white transition-colors px-3 py-1 rounded-full border border-white/10 hover:border-white/20"
                  >
                    New Analysis
                  </button>
                </div>
              </motion.div>

              {/* Synchronized Story-Graph-Impact System */}
              <ImpactProvider>
                <StoryGraphProvider>
                  {/* Impact Simulator Input - Appears after canvas */}
                  <AnimatePresence>
                    {showCanvas && (
                      <ImpactSimulatorInput
                        onAnalyze={(prompt) => {
                          setIsAnalyzingImpact(true);
                          setTimeout(() => {
                            setIsAnalyzingImpact(false);
                            console.log("Impact analysis complete for:", prompt);
                          }, 3000);
                        }}
                        isAnalyzing={isAnalyzingImpact}
                        repositoryMetadata={repositoryMetadata}
                        nodes={storyGraph?.nodes}
                      />
                    )}
                  </AnimatePresence>

                  {/* Staged Canvas Reveal */}
                  <AnimatePresence>
                    {showCanvas && storyGraph && (
                      <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <IntelligenceCanvas
                          nodes={storyGraph.nodes}
                          dependencies={storyGraph.edges}
                          layers={storyGraph.layers}
                          confidence={storyGraph.metadata.confidence}
                          repositoryMetadata={repositoryMetadata}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Staged Story Mode Reveal */}
                  <AnimatePresence>
                    {showStory && storyGraph && (
                      <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <StoryMode
                          storySteps={storyGraph.storySteps}
                          confidence={storyGraph.metadata.confidence}
                          repositoryMetadata={repositoryMetadata}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </StoryGraphProvider>
              </ImpactProvider>

              {/* Bob Intelligence Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 3 }}
                className="py-12 text-center border-t border-white/5 bg-gradient-to-t from-surface-graphite/30 to-transparent"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                  <span className="text-xs text-accent-cyan font-medium uppercase tracking-wider">IBM Bob Intelligence Engine</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                </div>
                <p className="text-xs text-text-secondary">
                  Repository intelligence powered by IBM Bob · Governance · Impact Analysis · Architecture Audit
                </p>
              </motion.div>
            </motion.div>
          </GovernanceProvider>
        )}
      </AnimatePresence>

      {/* Minimal Footer */}
      <footer className="relative z-20 py-8 text-center text-sm text-text-secondary border-t border-white/5 mt-auto">
        <p>NarrativeOS &copy; {new Date().getFullYear()}. Powered by <span className="text-accent-cyan font-medium">IBM Bob</span> · The future of developer cognition.</p>
      </footer>
    </main>
  );
}

// ─── Audit Report Generator ─────────────────────────────

function generateAuditReport(audit: BobAuditExport): string {
  const divider = '═'.repeat(72);
  const thinDivider = '─'.repeat(72);
  
  return `${divider}
  IBM BOB — ENTERPRISE ARCHITECTURE AUDIT REPORT
${divider}

Title:      ${audit.title}
Generated:  ${new Date(audit.generatedAt).toLocaleString()}
Engine:     ${audit.generatedBy === 'ibm-bob-api' ? 'IBM Bob API v2.1' : 'IBM Bob Intelligence Engine (Local)'}
Status:     ${audit.complianceStatus}

${divider}
  EXECUTIVE SUMMARY
${thinDivider}

${audit.executiveSummary}

${divider}
  FINDINGS SUMMARY
${thinDivider}

  Total Findings:    ${audit.findingsSummary.total}
  ├── Critical:      ${audit.findingsSummary.critical}
  ├── High:          ${audit.findingsSummary.high}
  ├── Medium:        ${audit.findingsSummary.medium}
  └── Low:           ${audit.findingsSummary.low}

${divider}
  GOVERNANCE ANALYSIS
${thinDivider}

${audit.governanceAnalysis.map((item, i) => `  ${i + 1}. ${item}`).join('\n')}

${divider}
  IMPACTED SYSTEMS
${thinDivider}

${audit.impactedSystems.map(sys => `  • ${sys}`).join('\n')}

${divider}
  REMEDIATION RECOMMENDATIONS
${thinDivider}

${audit.remediationRecommendations.map((rec, i) => `  ${i + 1}. ${rec}`).join('\n')}

${divider}
  ARCHITECTURE AUDIT SUMMARY
${thinDivider}

${audit.architectureAuditSummary}

${divider}
  ORCHESTRATION HISTORY
${thinDivider}

${audit.orchestrationHistory.length > 0 
  ? audit.orchestrationHistory.map(log => 
      `  [${log.timestamp}] [${log.phase}] ${log.message}`
    ).join('\n')
  : '  No orchestration history recorded for this session.'
}

${divider}
  COMPLIANCE STATUS: ${audit.complianceStatus}
${divider}

  Report generated by IBM Bob Intelligence Engine
  NarrativeOS — Enterprise AI Architecture Intelligence
  © ${new Date().getFullYear()} IBM Corporation

${divider}
`;
}

function ScanSequence({ onComplete }: { onComplete: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    { label: "Scanning Repository", detail: "Cloning file tree..." },
    { label: "Mapping Architecture", detail: "Identifying service boundaries..." },
    { label: "Analyzing Dependencies", detail: "Tracing import graphs..." },
    { label: "Detecting Critical Paths", detail: "Evaluating system hotspots..." },
    { label: "Generating Narrative", detail: "Constructing architecture story..." },
    { label: "Building Intelligence Canvas", detail: "Rendering topology..." },
  ];

  useEffect(() => {
    if (currentStepIndex < steps.length - 1) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStepIndex]);
        setCurrentStepIndex(prev => prev + 1);
      }, 1000 + Math.random() * 600);
      return () => clearTimeout(timer);
    } else {
      const finishTimer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStepIndex]);
        setTimeout(onComplete, 800);
      }, 1200);
      return () => clearTimeout(finishTimer);
    }
  }, [currentStepIndex, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-violet/10 blur-[100px] rounded-full" />
      </div>

      <div className="flex flex-col items-center max-w-lg w-full px-8 relative z-10">
        {/* Orbital Scanner */}
        <div className="w-20 h-20 relative mb-14">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-accent-cyan/40"
            style={{ borderTopColor: "rgba(34,211,238,0.8)" }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full border border-accent-violet/30"
            style={{ borderBottomColor: "rgba(129,140,248,0.7)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.9)] animate-pulse" />
          </div>
        </div>

        {/* Step list */}
        <div className="w-full space-y-3 mb-10">
          {steps.map((step, i) => {
            const isComplete = completedSteps.includes(i);
            const isCurrent = i === currentStepIndex && !isComplete;
            const isPending = i > currentStepIndex;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] transition-all duration-300 ${
                  isComplete ? "border-accent-cyan/60 bg-accent-cyan/10 text-accent-cyan" :
                  isCurrent ? "border-white/40 bg-white/5 text-white" :
                  "border-white/10 text-white/20"
                }`}>
                  {isComplete ? "✓" : isCurrent ? <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> : ""}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    isComplete ? "text-white/60" : isCurrent ? "text-white" : "text-white/25"
                  }`}>{step.label}</span>
                  {isCurrent && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-text-secondary ml-2"
                    >
                      {step.detail}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-violet rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
