/**
 * Services Index
 * 
 * Central export point for all repository intelligence services.
 * Provides easy access to service instances and types.
 */

// Export service classes
export { RepositoryService } from './repositoryService';
export { ParserService } from './parserService';
export { TransformService } from './transformService';
export { BobService } from './bobService';

// Export service instances (singletons)
export { repositoryService } from './repositoryService';
export { parserService } from './parserService';
export { transformService } from './transformService';
export { bobService } from './bobService';

// Re-export types for convenience
export type {
  RepositoryMetadata,
  ParsedRepository,
  ParsedNode,
  ParsedDependency,
  ParsedStoryStep,
  LayerDefinition,
  ValidationResult,
  ParsingProgress,
  SupportedRepo,
  ParsingConfig,
  RepositoryError,
  RepositoryErrorCode,
} from '../types/repository';

export type { NarrativeStoryGraph, NarrativeLayer } from './transformService';

export type {
  BobRepositorySummary,
  BobGovernanceReport,
  BobOrchestrationLog,
  BobImpactReport,
  BobReviewInsight,
  BobAuditExport,
} from './bobService';

// Made with Bob

