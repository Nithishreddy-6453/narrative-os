/**
 * Transform Service
 * 
 * Transforms parsed repository data into NarrativeOS story graph format.
 * Handles conversion of nodes, edges, layers, and story steps to match
 * the existing data structure used by the application.
 */

import {
  ParsedRepository,
  ParsedNode,
  ParsedDependency,
  ParsedStoryStep,
  LayerDefinition,
} from '../types/repository';

import type {
  ArchitectureNode,
  Dependency,
  StoryStep
} from '../data/realRepo';

/**
 * NarrativeOS Layer format
 */
export interface NarrativeLayer {
  id?: string;
  layer?: number;
  label: string;
  ny: number;
  description?: string;
}

/**
 * Complete NarrativeOS story graph structure
 */
export interface NarrativeStoryGraph {
  nodes: ArchitectureNode[];
  edges: Dependency[];
  layers: NarrativeLayer[];
  storySteps: StoryStep[];
  metadata: {
    repositoryUrl: string;
    repositoryName: string;
    confidence: number;
    parsedAt: string;
    [key: string]: any;
  };
}

/**
 * Service for transforming parsed repository data to NarrativeOS format
 */
export class TransformService {
  private static instance: TransformService;

  /**
   * Get singleton instance of TransformService
   */
  public static getInstance(): TransformService {
    if (!TransformService.instance) {
      TransformService.instance = new TransformService();
    }
    return TransformService.instance;
  }

  /**
   * Transform parsed repository data to NarrativeOS story graph format
   * 
   * @param parsed - Parsed repository structure
   * @returns NarrativeOS story graph ready for visualization
   * 
   * @example
   * ```typescript
   * const storyGraph = transformService.transform(parsedRepo);
   * // Use storyGraph with existing NarrativeOS components
   * ```
   */
  public transform(parsed: ParsedRepository): NarrativeStoryGraph {
    try {
      // Transform nodes
      const nodes = this.transformNodes(parsed.nodes, parsed.layers);

      // Transform dependencies to edges
      const edges = this.transformEdges(parsed.dependencies);

      // Transform layers
      const layers = this.transformLayers(parsed.layers);

      // Transform story steps
      const storySteps = this.transformStorySteps(parsed.storySteps);

      // Calculate final confidence score
      const confidence = this.calculateConfidence(parsed);

      return {
        nodes,
        edges,
        layers,
        storySteps,
        metadata: {
          repositoryUrl: parsed.metadata.url,
          repositoryName: `${parsed.metadata.owner}/${parsed.metadata.name}`,
          confidence,
          parsedAt: new Date().toISOString(),
          branch: parsed.metadata.branch,
          fileCount: parsed.metadata.fileCount,
          language: parsed.metadata.language,
          framework: parsed.metadata.framework,
          type: parsed.metadata.type,
        },
      };
    } catch (error) {
      console.error('Error transforming repository data:', error);
      throw new Error(
        `Failed to transform repository data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Transform parsed nodes to NarrativeOS node format
   * 
   * PLACEHOLDER: Will be enhanced with layout algorithms
   * 
   * @param nodes - Parsed nodes
   * @param layers - Layer definitions for positioning
   * @returns Array of NarrativeOS nodes
   */
  private transformNodes(nodes: ParsedNode[], layers: LayerDefinition[]): ArchitectureNode[] {
    const layerMap = new Map(layers.map(l => [l.layer, l.ny]));

    // Map layer names to numeric layers for reveal choreography
    const layerNumericMap = new Map<string, number>();
    layers.forEach((l, i) => layerNumericMap.set(l.layer, i + 1));

    // Node type mapping from parsed types to visual types
    const typeMapping: Record<string, ArchitectureNode['type']> = {
      'input': 'input',
      'unpacker': 'unpacker',
      'arithmetic': 'arithmetic',
      'support': 'support',
      'output': 'output',
      'control': 'control',
      // Common software types mapped to visual equivalents
      'component': 'input',
      'page': 'input',
      'function': 'support',
      'class': 'arithmetic',
      'file': 'support',
      'api': 'control',
      'service': 'arithmetic',
      'model': 'output',
      'config': 'control',
      'utility': 'support',
      'hook': 'support',
      'context': 'control',
      'route': 'input',
      'middleware': 'support',
      'database': 'output',
    };

    // Criticality inference
    const inferCriticality = (node: ParsedNode): ArchitectureNode['criticality'] => {
      if (node.metadata?.criticality) return node.metadata.criticality;
      if (node.metadata?.isEntryPoint) return 'critical';
      const complexity = node.metadata?.complexity ?? 0;
      if (complexity > 10) return 'critical';
      if (complexity > 5) return 'high';
      if (complexity > 2) return 'medium';
      return 'low';
    };

    return nodes.map((node) => {
      const ny = node.metadata?.ny ?? layerMap.get(node.layer) ?? 0.5;
      const numericLayer = layerNumericMap.get(node.layer) ?? 1;

      // Calculate nx and add vertical stagger if auto-distributing
      let nx = node.metadata?.nx;
      let finalNy = ny;
      if (nx === undefined) {
        const nodesInLayer = nodes.filter(n => n.layer === node.layer);
        const indexInLayer = nodesInLayer.indexOf(node);
        const count = nodesInLayer.length;
        
        // Group nodes tighter horizontally to prevent stretching
        const spread = Math.min(0.7, count * 0.15); // max spread 0.7
        const startX = 0.5 - (spread / 2);
        nx = count === 1 ? 0.5 : startX + (indexInLayer / (count - 1)) * spread;
        
        // Add vertical stagger to prevent flat lines
        if (count > 2) {
          const staggerOffset = (indexInLayer % 2 === 0 ? -0.05 : 0.05);
          finalNy = ny + staggerOffset;
        }
      }

      return {
        id: node.id,
        label: node.label,
        type: typeMapping[node.type] ?? 'support',
        layer: numericLayer,
        nx,
        ny: finalNy,
        description: node.metadata?.description ?? `${node.label} (${node.filePath})`,
        criticality: inferCriticality(node),
        technologies: node.metadata?.technologies ?? [node.type],
      };
    });
  }

  /**
   * Transform parsed dependencies to NarrativeOS edge format
   * 
   * @param dependencies - Parsed dependencies
   * @returns Array of NarrativeOS edges
   */
  private transformEdges(dependencies: ParsedDependency[]): Dependency[] {
    const typeMap: Record<string, Dependency['type']> = {
      'sync': 'sync',
      'async': 'async',
      'stream': 'stream',
      'import': 'sync',
      'call': 'sync',
      'extends': 'sync',
      'implements': 'sync',
      'uses': 'async',
      'emits': 'stream',
    };

    return dependencies.map((dep) => ({
      source: dep.from,
      target: dep.to,
      type: typeMap[dep.type] ?? 'sync',
      description: `${dep.type} dependency`,
    }));
  }

  /**
   * Transform layer definitions to NarrativeOS layer format
   * 
   * @param layers - Layer definitions
   * @returns Array of NarrativeOS layers
   */
  private transformLayers(layers: LayerDefinition[]): NarrativeLayer[] {
    return layers.map((layer, i) => ({
      id: layer.layer,
      layer: i + 1,
      label: layer.label,
      ny: layer.ny,
      description: layer.description,
    }));
  }

  /**
   * Transform story steps to NarrativeOS format
   * 
   * @param storySteps - Parsed story steps
   * @returns Array of NarrativeOS story steps
   */
  private transformStorySteps(storySteps: ParsedStoryStep[]): StoryStep[] {
    const iconTypes: Array<StoryStep['iconType']> = ['database', 'code', 'cpu', 'zap', 'network', 'shield'];

    return storySteps.map((step, i) => {
      // Parse highlighted edges into source/target pairs
      const activeDeps = step.highlightedEdges.map(edgeId => {
        const parts = edgeId.split('->');
        return parts.length === 2
          ? { source: parts[0], target: parts[1] }
          : { source: edgeId, target: edgeId };
      });

      return {
        id: `step-${step.step}`,
        title: step.title,
        description: step.description,
        iconType: iconTypes[i % iconTypes.length],
        activeNodes: step.highlightedNodes,
        activeDependencies: activeDeps,
        codeSnippet: {
          filename: `architecture.ts`,
          code: [
            { text: `// ${step.title}`, type: 'comment' as const },
            { text: `// ${step.description}`, type: 'comment' as const },
            ...step.highlightedNodes.map(nodeId => ({
              text: `  → ${nodeId}`,
              highlight: true,
              type: 'code' as const,
            })),
          ],
        },
        insight: step.description,
      };
    });
  }

  /**
   * Calculate overall confidence score for the transformation
   * 
   * Takes into account:
   * - Parsing confidence from the parser
   * - Completeness of the data (nodes, edges, layers)
   * - Quality indicators (metadata richness, story steps)
   * 
   * @param parsed - Parsed repository structure
   * @returns Confidence score between 0 and 1
   */
  public calculateConfidence(parsed: ParsedRepository): number {
    try {
      // Start with parser confidence
      let confidence = parsed.confidence;

      // Adjust based on data completeness
      const hasNodes = parsed.nodes.length > 0;
      const hasDependencies = parsed.dependencies.length > 0;
      const hasLayers = parsed.layers.length > 0;
      const hasStorySteps = parsed.storySteps.length > 0;

      // Penalize missing components
      if (!hasNodes) confidence *= 0.5;
      if (!hasDependencies) confidence *= 0.9;
      if (!hasLayers) confidence *= 0.8;
      if (!hasStorySteps) confidence *= 0.9;

      // Bonus for rich metadata
      const avgMetadataRichness = parsed.nodes.reduce((sum, node) => {
        const metadataKeys = Object.keys(node.metadata || {});
        return sum + metadataKeys.length;
      }, 0) / Math.max(parsed.nodes.length, 1);

      if (avgMetadataRichness > 3) {
        confidence = Math.min(1, confidence * 1.1);
      }

      // Bonus for good node-to-edge ratio (indicates well-connected graph)
      const nodeToEdgeRatio = parsed.dependencies.length / Math.max(parsed.nodes.length, 1);
      if (nodeToEdgeRatio > 0.5 && nodeToEdgeRatio < 3) {
        confidence = Math.min(1, confidence * 1.05);
      }

      // Ensure confidence is between 0 and 1
      return Math.max(0, Math.min(1, confidence));
    } catch (error) {
      console.error('Error calculating confidence:', error);
      return 0.5; // Default to medium confidence on error
    }
  }

  /**
   * Optimize node layout for better visualization
   * 
   * PLACEHOLDER: Will be implemented with advanced layout algorithms
   * 
   * @param nodes - Nodes to optimize
   * @param edges - Edges for layout consideration
   * @returns Optimized nodes with updated positions
   */
  public optimizeLayout(nodes: ArchitectureNode[], edges: Dependency[]): ArchitectureNode[] {
    // TODO: Implement layout optimization
    // This will:
    // - Apply force-directed layout
    // - Minimize edge crossings
    // - Group related nodes
    // - Respect layer constraints
    console.log(`[PLACEHOLDER] Optimizing layout for ${nodes.length} nodes`);
    return nodes;
  }

  /**
   * Validate transformed data structure
   * 
   * Ensures the transformed data is valid and ready for visualization
   * 
   * @param storyGraph - Transformed story graph
   * @returns Validation result with any errors
   */
  public validate(storyGraph: NarrativeStoryGraph): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required fields
    if (!storyGraph.nodes || storyGraph.nodes.length === 0) {
      errors.push('Story graph must contain at least one node');
    }

    if (!storyGraph.layers || storyGraph.layers.length === 0) {
      errors.push('Story graph must contain at least one layer');
    }

    // Validate node references in edges
    const nodeIds = new Set(storyGraph.nodes.map(n => n.id));
    for (const edge of storyGraph.edges) {
      const edgeLabel = `${edge.source}->${edge.target}`;
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge ${edgeLabel} references non-existent source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge ${edgeLabel} references non-existent target node: ${edge.target}`);
      }
    }

    // Validate story step references
    for (const step of storyGraph.storySteps) {
      for (const nodeId of step.activeNodes) {
        if (!nodeIds.has(nodeId)) {
          errors.push(`Story step "${step.title}" references non-existent node: ${nodeId}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge multiple story graphs into one
   * 
   * PLACEHOLDER: Will be implemented for multi-repository analysis
   * 
   * @param graphs - Array of story graphs to merge
   * @returns Merged story graph
   */
  public merge(graphs: NarrativeStoryGraph[]): NarrativeStoryGraph {
    // TODO: Implement graph merging
    // This will be useful for analyzing multiple related repositories
    console.log(`[PLACEHOLDER] Merging ${graphs.length} story graphs`);
    
    if (graphs.length === 0) {
      throw new Error('Cannot merge empty array of graphs');
    }

    return graphs[0]; // Return first graph as placeholder
  }
}

// Export singleton instance
export const transformService = TransformService.getInstance();

// Made with Bob
