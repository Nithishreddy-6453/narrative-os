/**
 * IBM Bob Intelligence Service
 * 
 * Lightweight, API-ready integration layer for IBM Bob.
 * Provides repository intelligence, governance findings,
 * orchestration reasoning, impact analysis, and audit exports.
 * 
 * Architecture:
 *   IF IBM_BOB_API_KEY exists → use real API responses
 *   ELSE → use mock/fallback responses
 * 
 * The system NEVER crashes. All failures gracefully degrade.
 */

import type { ArchitectureNode, BobFinding, GovernanceViolation, ArchitecturalDrift, ImpactAnalysis } from '@/data/realRepo';

// ─── Types ──────────────────────────────────────────────

export interface BobRepositorySummary {
  name: string;
  owner: string;
  type: string;
  language: string;
  framework: string;
  nodeCount: number;
  edgeCount: number;
  layerCount: number;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  keyInsights: string[];
  generatedBy: 'ibm-bob-api' | 'ibm-bob-fallback';
  timestamp: string;
}

export interface BobGovernanceReport {
  findings: BobFinding[];
  violations: GovernanceViolation[];
  drift: ArchitecturalDrift[];
  overallScore: number;
  complianceLevel: 'compliant' | 'warning' | 'non-compliant' | 'critical';
  recommendations: string[];
  generatedBy: 'ibm-bob-api' | 'ibm-bob-fallback';
  timestamp: string;
}

export interface BobOrchestrationLog {
  id: string;
  phase: string;
  message: string;
  reasoning: string;
  timestamp: string;
  duration?: number;
  status: 'pending' | 'running' | 'complete' | 'warning' | 'error';
}

export interface BobImpactReport {
  analysis: ImpactAnalysis;
  bobReasoning: string;
  confidenceScore: number;
  alternativeStrategies: string[];
  generatedBy: 'ibm-bob-api' | 'ibm-bob-fallback';
  timestamp: string;
}

export interface BobReviewInsight {
  nodeId: string;
  category: string;
  insight: string;
  recommendation: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  generatedBy: 'ibm-bob-api' | 'ibm-bob-fallback';
}

export interface BobAuditExport {
  title: string;
  generatedAt: string;
  repositoryName: string;
  repositoryOwner: string;
  executiveSummary: string;
  findingsSummary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  governanceAnalysis: string[];
  orchestrationHistory: BobOrchestrationLog[];
  impactedSystems: string[];
  remediationRecommendations: string[];
  architectureAuditSummary: string;
  complianceStatus: string;
  generatedBy: 'ibm-bob-api' | 'ibm-bob-fallback';
}

// ─── Configuration ──────────────────────────────────────

interface BobServiceConfig {
  apiKey: string | null;
  apiEndpoint: string;
  timeout: number;
}

function getConfig(): BobServiceConfig {
  return {
    apiKey: typeof window !== 'undefined' 
      ? null  // Client-side: never expose API keys
      : (process.env.IBM_BOB_API_KEY || null),
    apiEndpoint: process.env.NEXT_PUBLIC_BOB_API_ENDPOINT || 'https://api.ibm.com/bob/v1',
    timeout: 10000,
  };
}

function isApiAvailable(): boolean {
  const config = getConfig();
  return !!config.apiKey && config.apiKey.length > 0;
}

// ─── Safe API call wrapper ──────────────────────────────

async function safeFetch<T>(
  url: string,
  options: RequestInit,
  fallback: T
): Promise<{ data: T; source: 'ibm-bob-api' | 'ibm-bob-fallback' }> {
  if (!isApiAvailable()) {
    return { data: fallback, source: 'ibm-bob-fallback' };
  }

  try {
    const config = getConfig();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-IBM-Bob-Version': '2.1.0',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[IBM Bob] API returned ${response.status}, falling back to mock data`);
      return { data: fallback, source: 'ibm-bob-fallback' };
    }

    const data = await response.json();
    return { data: data as T, source: 'ibm-bob-api' };
  } catch (error) {
    console.warn('[IBM Bob] API unavailable, using fallback intelligence:', error instanceof Error ? error.message : 'Unknown error');
    return { data: fallback, source: 'ibm-bob-fallback' };
  }
}

// ─── IBM Bob Service ────────────────────────────────────

export class BobService {
  private static instance: BobService;
  private orchestrationLogs: BobOrchestrationLog[] = [];

  public static getInstance(): BobService {
    if (!BobService.instance) {
      BobService.instance = new BobService();
    }
    return BobService.instance;
  }

  /**
   * Check if IBM Bob API is connected
   */
  public isConnected(): boolean {
    return isApiAvailable();
  }

  /**
   * Get connection status string
   */
  public getConnectionStatus(): 'connected' | 'fallback' {
    return isApiAvailable() ? 'connected' : 'fallback';
  }

  /**
   * Generate repository intelligence summary
   */
  public async getRepositorySummary(
    repoName: string,
    repoOwner: string,
    nodes: ArchitectureNode[],
    edgeCount: number,
    layerCount: number,
    repoType: string,
    language: string | null,
    framework: string | null
  ): Promise<BobRepositorySummary> {
    const fallback = this.generateMockRepositorySummary(
      repoName, repoOwner, nodes, edgeCount, layerCount, repoType, language, framework
    );

    const config = getConfig();
    const { data, source } = await safeFetch<BobRepositorySummary>(
      `${config.apiEndpoint}/repository/summary`,
      {
        method: 'POST',
        body: JSON.stringify({ repoName, repoOwner, nodeCount: nodes.length, edgeCount, layerCount, repoType }),
      },
      fallback
    );

    data.generatedBy = source;
    this.addOrchestrationLog('SUMMARY', `Repository summary generated for ${repoOwner}/${repoName}`, source);
    return data;
  }

  /**
   * Generate governance findings report
   */
  public async getGovernanceReport(
    nodes: ArchitectureNode[],
    findings: BobFinding[],
    violations: GovernanceViolation[],
    drift: ArchitecturalDrift[]
  ): Promise<BobGovernanceReport> {
    const fallback = this.generateMockGovernanceReport(nodes, findings, violations, drift);

    const config = getConfig();
    const { data, source } = await safeFetch<BobGovernanceReport>(
      `${config.apiEndpoint}/governance/analyze`,
      {
        method: 'POST',
        body: JSON.stringify({ nodeIds: nodes.map(n => n.id), findingCount: findings.length }),
      },
      fallback
    );

    data.generatedBy = source;
    this.addOrchestrationLog('GOVERNANCE', `Governance analysis complete: ${data.complianceLevel}`, source);
    return data;
  }

  /**
   * Get Bob-powered reasoning for orchestration decisions
   */
  public async getOrchestrationReasoning(
    phase: string,
    context: Record<string, any>
  ): Promise<{ reasoning: string; confidence: number; source: 'ibm-bob-api' | 'ibm-bob-fallback' }> {
    const fallbackReasoning = this.generateMockOrchestrationReasoning(phase, context);

    const config = getConfig();
    const { data, source } = await safeFetch(
      `${config.apiEndpoint}/orchestration/reason`,
      {
        method: 'POST',
        body: JSON.stringify({ phase, context }),
      },
      fallbackReasoning
    );

    return { ...data, source };
  }

  /**
   * Generate impact analysis with Bob reasoning
   */
  public async getImpactAnalysis(
    prompt: string,
    nodes: ArchitectureNode[],
    existingAnalysis: ImpactAnalysis
  ): Promise<BobImpactReport> {
    const fallback: BobImpactReport = {
      analysis: existingAnalysis,
      bobReasoning: `IBM Bob analysis indicates that "${prompt}" affects ${existingAnalysis.directlyAffected.length} modules directly, with cascading impact across ${existingAnalysis.downstreamImpacted.length} downstream dependencies. Risk assessment: ${existingAnalysis.severity}. Bob recommends staged rollout with automated regression testing.`,
      confidenceScore: 0.82,
      alternativeStrategies: [
        'Implement behind feature flag for gradual rollout',
        'Add circuit breaker pattern for affected services',
        'Deploy canary version to staging environment first',
      ],
      generatedBy: 'ibm-bob-fallback',
      timestamp: new Date().toISOString(),
    };

    const config = getConfig();
    const { data, source } = await safeFetch<BobImpactReport>(
      `${config.apiEndpoint}/impact/analyze`,
      {
        method: 'POST',
        body: JSON.stringify({ prompt, nodeIds: nodes.map(n => n.id) }),
      },
      fallback
    );

    data.generatedBy = source;
    this.addOrchestrationLog('IMPACT', `Impact analysis for: "${prompt}"`, source);
    return data;
  }

  /**
   * Generate review insights for a specific node
   */
  public async getReviewInsights(
    node: ArchitectureNode,
    connectedNodes: string[]
  ): Promise<BobReviewInsight[]> {
    const fallback = this.generateMockReviewInsights(node, connectedNodes);

    const config = getConfig();
    const { data, source } = await safeFetch<BobReviewInsight[]>(
      `${config.apiEndpoint}/review/insights`,
      {
        method: 'POST',
        body: JSON.stringify({ nodeId: node.id, connectedNodes }),
      },
      fallback
    );

    return data.map(d => ({ ...d, generatedBy: source }));
  }

  /**
   * Generate enterprise audit export
   */
  public async generateAuditExport(
    repoName: string,
    repoOwner: string,
    nodes: ArchitectureNode[],
    findings: BobFinding[],
    violations: GovernanceViolation[],
    drift: ArchitecturalDrift[],
    remediatedNodes: Set<string>
  ): Promise<BobAuditExport> {
    const fallback = this.generateMockAuditExport(
      repoName, repoOwner, nodes, findings, violations, drift, remediatedNodes
    );

    const config = getConfig();
    const { data, source } = await safeFetch<BobAuditExport>(
      `${config.apiEndpoint}/audit/export`,
      {
        method: 'POST',
        body: JSON.stringify({
          repoName,
          repoOwner,
          nodeCount: nodes.length,
          findingCount: findings.length,
          remediatedCount: remediatedNodes.size,
        }),
      },
      fallback
    );

    data.generatedBy = source;
    this.addOrchestrationLog('AUDIT', `Enterprise audit export generated`, source);
    return data;
  }

  /**
   * Get orchestration log history
   */
  public getOrchestrationHistory(): BobOrchestrationLog[] {
    return [...this.orchestrationLogs];
  }

  /**
   * Clear orchestration history
   */
  public clearOrchestrationHistory(): void {
    this.orchestrationLogs = [];
  }

  // ─── Private: Orchestration Logging ─────────────────

  private addOrchestrationLog(
    phase: string,
    message: string,
    source: 'ibm-bob-api' | 'ibm-bob-fallback'
  ): void {
    this.orchestrationLogs.push({
      id: `bob-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      phase,
      message,
      reasoning: source === 'ibm-bob-api'
        ? 'Processed via IBM Bob API intelligence pipeline'
        : 'Generated via IBM Bob local intelligence engine',
      timestamp: new Date().toISOString(),
      status: 'complete',
    });
  }

  // ─── Private: Mock Data Generators ──────────────────

  private generateMockRepositorySummary(
    repoName: string,
    repoOwner: string,
    nodes: ArchitectureNode[],
    edgeCount: number,
    layerCount: number,
    repoType: string,
    language: string | null,
    framework: string | null
  ): BobRepositorySummary {
    const criticalNodes = nodes.filter(n => n.criticality === 'critical').length;
    const highNodes = nodes.filter(n => n.criticality === 'high').length;
    const healthScore = Math.max(40, 100 - (criticalNodes * 12) - (highNodes * 5));
    const riskLevel: BobRepositorySummary['riskLevel'] =
      criticalNodes > 2 ? 'critical' :
      criticalNodes > 0 ? 'high' :
      highNodes > 2 ? 'medium' : 'low';

    return {
      name: repoName,
      owner: repoOwner,
      type: repoType,
      language: language || 'Unknown',
      framework: framework || 'None detected',
      nodeCount: nodes.length,
      edgeCount,
      layerCount,
      healthScore,
      riskLevel,
      summary: `IBM Bob has analyzed ${repoOwner}/${repoName} and identified ${nodes.length} architectural components across ${layerCount} layers with ${edgeCount} dependency connections. The system exhibits ${riskLevel} risk with a health score of ${healthScore}/100.`,
      keyInsights: [
        `${criticalNodes} critical-path modules detected requiring continuous monitoring`,
        `Dependency graph density: ${(edgeCount / Math.max(nodes.length, 1)).toFixed(1)} edges per node`,
        `Architecture type: ${repoType} with ${layerCount}-layer topology`,
        criticalNodes > 0
          ? `⚠ Critical path concentration: ${Math.round((criticalNodes / nodes.length) * 100)}% of modules are critical`
          : `✓ No excessive critical-path concentration detected`,
      ],
      generatedBy: 'ibm-bob-fallback',
      timestamp: new Date().toISOString(),
    };
  }

  private generateMockGovernanceReport(
    nodes: ArchitectureNode[],
    findings: BobFinding[],
    violations: GovernanceViolation[],
    drift: ArchitecturalDrift[]
  ): BobGovernanceReport {
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    const overallScore = Math.max(20, 100 - (criticalCount * 20) - (highCount * 10) - (violations.length * 5));
    const complianceLevel: BobGovernanceReport['complianceLevel'] =
      overallScore >= 80 ? 'compliant' :
      overallScore >= 60 ? 'warning' :
      overallScore >= 40 ? 'non-compliant' : 'critical';

    return {
      findings,
      violations,
      drift,
      overallScore,
      complianceLevel,
      recommendations: [
        'Address critical findings before next deployment cycle',
        'Implement automated governance checks in CI/CD pipeline',
        'Schedule architectural review for flagged drift patterns',
        'Enable Bob continuous monitoring for real-time compliance tracking',
      ],
      generatedBy: 'ibm-bob-fallback',
      timestamp: new Date().toISOString(),
    };
  }

  private generateMockOrchestrationReasoning(
    phase: string,
    context: Record<string, any>
  ): { reasoning: string; confidence: number } {
    const reasoningMap: Record<string, string> = {
      'parsing': 'Bob is analyzing repository structure and building a comprehensive dependency graph. Architectural patterns are being identified and classified.',
      'transforming': 'IBM Bob is transforming the parsed data into a spatial topology. Layer assignments are based on dependency depth analysis and module coupling metrics.',
      'governance': 'Bob governance engine is evaluating architectural constraints, security patterns, and compliance requirements against best practices.',
      'impact': 'IBM Bob is computing blast radius and propagation paths using topological analysis. Risk zones are identified based on coupling strength and criticality.',
      'remediation': 'Bob is generating targeted fix strategies with confidence scoring. Patch previews are synthesized based on pattern matching and architectural best practices.',
    };

    return {
      reasoning: reasoningMap[phase] || `IBM Bob is processing ${phase} phase with contextual intelligence analysis.`,
      confidence: 0.75 + Math.random() * 0.2,
    };
  }

  private generateMockReviewInsights(
    node: ArchitectureNode,
    connectedNodes: string[]
  ): BobReviewInsight[] {
    const insights: BobReviewInsight[] = [];

    // Connection density insight
    if (connectedNodes.length > 4) {
      insights.push({
        nodeId: node.id,
        category: 'coupling',
        insight: `High coupling detected: ${node.label} has ${connectedNodes.length} direct dependencies`,
        recommendation: 'Consider introducing a facade or mediator pattern to reduce direct coupling',
        severity: 'medium',
        reasoning: 'IBM Bob detected that this module exceeds the recommended coupling threshold of 4 direct dependencies',
        generatedBy: 'ibm-bob-fallback',
      });
    }

    // Criticality insight
    if (node.criticality === 'critical') {
      insights.push({
        nodeId: node.id,
        category: 'architecture',
        insight: `${node.label} is on the critical path with ${connectedNodes.length} downstream dependencies`,
        recommendation: 'Add redundancy or fallback mechanisms to minimize single points of failure',
        severity: 'high',
        reasoning: 'IBM Bob identifies critical-path modules as high-priority for resilience engineering',
        generatedBy: 'ibm-bob-fallback',
      });
    }

    // Type-specific insight
    insights.push({
      nodeId: node.id,
      category: 'performance',
      insight: `${node.label} (${node.type}) operates at layer ${node.layer} in the architecture topology`,
      recommendation: `Monitor ${node.type} module performance metrics and set alerting thresholds`,
      severity: 'info',
      reasoning: `IBM Bob recommends proactive monitoring for all ${node.type}-type modules`,
      generatedBy: 'ibm-bob-fallback',
    });

    return insights;
  }

  private generateMockAuditExport(
    repoName: string,
    repoOwner: string,
    nodes: ArchitectureNode[],
    findings: BobFinding[],
    violations: GovernanceViolation[],
    drift: ArchitecturalDrift[],
    remediatedNodes: Set<string>
  ): BobAuditExport {
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const highFindings = findings.filter(f => f.severity === 'high');
    const mediumFindings = findings.filter(f => f.severity === 'medium');
    const lowFindings = findings.filter(f => f.severity === 'low');

    return {
      title: `IBM Bob Enterprise Audit Report — ${repoOwner}/${repoName}`,
      generatedAt: new Date().toISOString(),
      repositoryName: repoName,
      repositoryOwner: repoOwner,
      executiveSummary: `IBM Bob has completed a comprehensive architectural audit of ${repoOwner}/${repoName}. The analysis covered ${nodes.length} architectural components, identifying ${findings.length} findings across ${violations.length} governance violations and ${drift.length} architectural drift patterns. ${remediatedNodes.size} modules have been successfully remediated during this session. The system demonstrates ${criticalFindings.length === 0 ? 'acceptable' : 'concerning'} risk posture with ${criticalFindings.length > 0 ? 'critical issues requiring immediate attention' : 'no critical blockers identified'}.`,
      findingsSummary: {
        total: findings.length,
        critical: criticalFindings.length,
        high: highFindings.length,
        medium: mediumFindings.length,
        low: lowFindings.length,
      },
      governanceAnalysis: [
        `${violations.length} governance violations detected across ${new Set(violations.flatMap(v => v.affectedNodes)).size} modules`,
        `${drift.length} architectural drift patterns identified`,
        `Compliance coverage: ${Math.round(((nodes.length - findings.length) / Math.max(nodes.length, 1)) * 100)}%`,
        `Remediation progress: ${remediatedNodes.size}/${findings.filter(f => f.remediation).length} actionable findings addressed`,
        `Security posture: ${findings.filter(f => f.category === 'security').length} security-related findings`,
      ],
      orchestrationHistory: this.getOrchestrationHistory(),
      impactedSystems: [
        ...new Set(findings.map(f => f.nodeId)),
        ...new Set(violations.flatMap(v => v.affectedNodes)),
      ],
      remediationRecommendations: [
        ...criticalFindings.map(f => `[CRITICAL] ${f.title}: ${f.remediation?.strategy || 'Manual review required'}`),
        ...highFindings.map(f => `[HIGH] ${f.title}: ${f.remediation?.strategy || 'Schedule for next sprint'}`),
        'Implement continuous governance monitoring via IBM Bob integration',
        'Schedule quarterly architectural review with Bob-generated baselines',
        'Enable automated drift detection in CI/CD pipeline',
      ],
      architectureAuditSummary: `The ${repoOwner}/${repoName} architecture consists of ${nodes.length} components organized across a layered topology. IBM Bob identified ${criticalFindings.length} critical issues, ${highFindings.length} high-severity findings, and ${drift.length} drift patterns. The architecture shows ${violations.length > 3 ? 'significant' : 'moderate'} governance gaps requiring attention. Overall architectural health: ${Math.max(20, 100 - (criticalFindings.length * 20) - (highFindings.length * 10))}/100.`,
      complianceStatus: criticalFindings.length === 0 ? 'CONDITIONAL PASS' : 'REQUIRES REMEDIATION',
      generatedBy: 'ibm-bob-fallback',
    };
  }
}

// Export singleton instance
export const bobService = BobService.getInstance();

// Made with Bob
