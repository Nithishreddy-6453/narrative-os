/**
 * Repository Intelligence Pipeline - Type Definitions
 * 
 * Core type definitions for the dynamic GitHub repository analysis system.
 * These types support the parsing, transformation, and integration of GitHub
 * repositories into the NarrativeOS story graph format.
 */

/**
 * Metadata about a cloned GitHub repository
 */
export interface RepositoryMetadata {
  /** Full GitHub repository URL */
  url: string;
  /** Repository owner/organization name */
  owner: string;
  /** Repository name */
  name: string;
  /** Branch being analyzed (default: main/master) */
  branch: string;
  /** Timestamp when repository was cloned */
  clonedAt: Date;
  /** Total number of files in the repository */
  fileCount: number;
  /** Primary programming language detected */
  language: string | null;
  /** Framework detected (e.g., 'next.js', 'express', 'react') */
  framework: string | null;
  /** Repository type classification */
  type: 'frontend' | 'backend' | 'fullstack' | 'library' | 'unknown';
}

/**
 * Layer definition in the NarrativeOS story graph
 */
export interface LayerDefinition {
  /** Layer identifier (e.g., 'ui', 'api', 'data') */
  layer: string;
  /** Human-readable layer label */
  label: string;
  /** Y-coordinate for layer positioning in the graph */
  ny: number;
  /** Description of the layer's purpose */
  description: string;
}

/**
 * Complete parsed repository structure ready for transformation
 */
export interface ParsedRepository {
  /** Repository metadata */
  metadata: RepositoryMetadata;
  /** Parsed nodes representing files, components, functions, etc. */
  nodes: ParsedNode[];
  /** Dependencies between nodes */
  dependencies: ParsedDependency[];
  /** Layer definitions for organizing nodes */
  layers: LayerDefinition[];
  /** Story steps for narrative flow */
  storySteps: ParsedStoryStep[];
  /** Confidence score (0-1) indicating parsing quality */
  confidence: number;
}

/**
 * A parsed node representing a code entity (file, component, function, etc.)
 */
export interface ParsedNode {
  /** Unique identifier for the node */
  id: string;
  /** Display label for the node */
  label: string;
  /** Node type (e.g., 'file', 'component', 'function', 'class') */
  type: string;
  /** Layer this node belongs to */
  layer: string;
  /** File path relative to repository root */
  filePath: string;
  /** Additional metadata about the node */
  metadata?: {
    /** Lines of code */
    loc?: number;
    /** Complexity score */
    complexity?: number;
    /** Whether this is an entry point */
    isEntryPoint?: boolean;
    /** Framework-specific metadata */
    [key: string]: any;
  };
}

/**
 * A dependency relationship between two nodes
 */
export interface ParsedDependency {
  /** Source node ID */
  from: string;
  /** Target node ID */
  to: string;
  /** Dependency type (e.g., 'import', 'call', 'extends') */
  type: string;
  /** Dependency strength/weight (0-1) */
  weight?: number;
}

/**
 * A story step in the narrative flow
 */
export interface ParsedStoryStep {
  /** Step number in the sequence */
  step: number;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Node IDs highlighted in this step */
  highlightedNodes: string[];
  /** Dependency IDs highlighted in this step */
  highlightedEdges: string[];
}

/**
 * Result of GitHub URL validation
 */
export interface ValidationResult {
  /** Whether the URL is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Extracted repository information if valid */
  repoInfo?: {
    owner: string;
    name: string;
    branch: string;
  };
}

/**
 * Real-time progress tracking for repository parsing
 */
export interface ParsingProgress {
  /** Current phase of parsing */
  phase: 'cloning' | 'analyzing' | 'parsing' | 'transforming' | 'complete' | 'error';
  /** Progress percentage (0-100) */
  progress: number;
  /** Current status message */
  message: string;
  /** Detailed information about current operation */
  details?: {
    /** Current file being processed */
    currentFile?: string;
    /** Files processed so far */
    filesProcessed?: number;
    /** Total files to process */
    totalFiles?: number;
  };
  /** Error information if phase is 'error' */
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
}

/**
 * Supported repository pattern for curated parsing
 */
export interface SupportedRepo {
  /** Pattern to match repository URL */
  pattern: RegExp;
  /** Repository type identifier */
  type: string;
  /** Human-readable name */
  name: string;
  /** Description of the repository pattern */
  description: string;
  /** Custom parsing configuration */
  config: {
    /** Entry point files to start parsing from */
    entryPoints: string[];
    /** File patterns to include */
    includePatterns: string[];
    /** File patterns to exclude */
    excludePatterns: string[];
    /** Layer definitions specific to this repo type */
    layers?: LayerDefinition[];
    /** Custom parsing rules */
    customRules?: {
      [key: string]: any;
    };
  };
}

/**
 * Configuration for repository parsing
 */
export interface ParsingConfig {
  /** Maximum number of files to parse */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to include test files */
  includeTests?: boolean;
  /** Whether to include documentation files */
  includeDocs?: boolean;
  /** Custom file patterns to include */
  customIncludePatterns?: string[];
  /** Custom file patterns to exclude */
  customExcludePatterns?: string[];
}

/**
 * Error types for repository operations
 */
export enum RepositoryErrorCode {
  INVALID_URL = 'INVALID_URL',
  REPO_NOT_FOUND = 'REPO_NOT_FOUND',
  CLONE_FAILED = 'CLONE_FAILED',
  PARSE_FAILED = 'PARSE_FAILED',
  TRANSFORM_FAILED = 'TRANSFORM_FAILED',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class for repository operations
 */
export class RepositoryError extends Error {
  constructor(
    public code: RepositoryErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

// Made with Bob
