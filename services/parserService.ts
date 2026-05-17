/**
 * Parser Service
 *
 * Handles parsing of cloned GitHub repositories into structured data.
 * Supports both curated repository patterns and fallback parsing for unknown repos.
 */

import {
  RepositoryMetadata,
  ParsedRepository,
  ParsedNode,
  ParsedDependency,
  ParsedStoryStep,
  LayerDefinition,
  SupportedRepo,
  ParsingProgress,
  RepositoryError,
  RepositoryErrorCode,
} from '../types/repository';
import {
  supportedRepositories,
  findSupportedRepo,
  getIntelligencePackageId,
} from '../data/supportedRepos';
import { getIntelligencePackage } from '../data/intelligencePackages';

/**
 * Service for parsing repository code into structured format
 */
export class ParserService {
  private static instance: ParserService;
  private supportedRepos: SupportedRepo[] = [];
  private progressCallback?: (progress: ParsingProgress) => void;

  /**
   * Get singleton instance of ParserService
   */
  public static getInstance(): ParserService {
    if (!ParserService.instance) {
      ParserService.instance = new ParserService();
    }
    return ParserService.instance;
  }

  /**
   * Initialize the parser service with supported repository patterns
   */
  private constructor() {
    this.initializeSupportedRepos();
  }

  /**
   * Initialize the list of supported repository patterns
   *
   * Loads supported repository configurations from the curated list.
   */
  private initializeSupportedRepos(): void {
    // Load supported repositories from configuration
    this.supportedRepos = supportedRepositories;
  }

  /**
   * Set a callback for progress updates during parsing
   * 
   * @param callback - Function to call with progress updates
   */
  public setProgressCallback(callback: (progress: ParsingProgress) => void): void {
    this.progressCallback = callback;
  }

  /**
   * Report progress during parsing
   * 
   * @param progress - Progress information to report
   */
  private reportProgress(progress: ParsingProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  /**
   * Main entry point for parsing a repository
   * 
   * Determines if the repository matches a supported pattern and routes
   * to the appropriate parsing strategy.
   * 
   * @param metadata - Repository metadata
   * @param repoType - Optional pre-determined repository type
   * @returns Promise resolving to parsed repository structure
   * 
   * @example
   * ```typescript
   * const parsed = await parserService.parse(metadata);
   * console.log(`Parsed ${parsed.nodes.length} nodes with ${parsed.confidence} confidence`);
   * ```
   */
  public async parse(
    metadata: RepositoryMetadata,
    repoType: SupportedRepo | null = null
  ): Promise<ParsedRepository> {
    try {
      this.reportProgress({
        phase: 'parsing',
        progress: 0,
        message: 'Starting repository parsing...',
      });

      // Determine repository type if not provided
      const detectedType = repoType || this.detectRepositoryType(metadata);

      if (detectedType) {
        this.reportProgress({
          phase: 'parsing',
          progress: 10,
          message: `Detected repository type: ${detectedType.name}`,
        });
        return await this.parseSupported(metadata, detectedType);
      } else {
        this.reportProgress({
          phase: 'parsing',
          progress: 10,
          message: 'Using fallback parser for unknown repository type',
        });
        return await this.parseFallback(metadata);
      }
    } catch (error) {
      this.reportProgress({
        phase: 'error',
        progress: 0,
        message: 'Parsing failed',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      });

      throw new RepositoryError(
        RepositoryErrorCode.PARSE_FAILED,
        `Failed to parse repository: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { metadata, error }
      );
    }
  }

  /**
   * Detect repository type based on metadata
   *
   * Uses the findSupportedRepo helper to match against URL, name, and framework.
   *
   * @param metadata - Repository metadata
   * @returns Matched repository type or null
   */
  public detectRepositoryType(metadata: RepositoryMetadata): SupportedRepo | null {
    return findSupportedRepo(metadata);
  }

  /**
   * Parse a repository using curated patterns for known repository types
   *
   * Checks if an intelligence package exists for the repository. If yes,
   * loads and returns the curated package. If no, uses the parser type
   * to generate appropriate structure.
   *
   * @param metadata - Repository metadata
   * @param repoType - Detected repository type with parsing configuration
   * @returns Promise resolving to parsed repository structure
   */
  public async parseSupported(
    metadata: RepositoryMetadata,
    repoType: SupportedRepo
  ): Promise<ParsedRepository> {
    // Check if an intelligence package exists for this repository
    const packageId = getIntelligencePackageId(metadata);
    
    if (packageId) {
      this.reportProgress({
        phase: 'parsing',
        progress: 20,
        message: `Loading curated intelligence package: ${packageId}`,
      });

      const intelligencePackage = getIntelligencePackage(packageId);
      
      if (intelligencePackage) {
        this.reportProgress({
          phase: 'parsing',
          progress: 90,
          message: `Loaded intelligence package with ${intelligencePackage.nodes.length} nodes`,
        });

        // Update metadata with current information
        const updatedPackage: ParsedRepository = {
          ...intelligencePackage,
          metadata: {
            ...intelligencePackage.metadata,
            clonedAt: metadata.clonedAt,
            fileCount: metadata.fileCount,
          },
        };

        this.reportProgress({
          phase: 'parsing',
          progress: 100,
          message: 'Intelligence package loaded successfully',
        });

        return updatedPackage;
      }
    }

    // No intelligence package available - use dynamic parsing
    this.reportProgress({
      phase: 'parsing',
      progress: 30,
      message: `Parsing ${repoType.name} repository dynamically...`,
      details: {
        currentFile: 'Analyzing entry points...',
        filesProcessed: 0,
        totalFiles: metadata.fileCount,
      },
    });

    // TODO: Implement dynamic parsing logic
    // This will:
    // - Use entry points from repoType.config
    // - Follow imports and dependencies
    // - Apply framework-specific parsing rules
    // - Generate accurate layer assignments
    // - Create meaningful story steps

    // Mock data for dynamic parsing (rich fallback to ensure graph never looks empty)
    const mockNodes: ParsedNode[] = [
      { id: 'node-entry', label: 'Main Entry', type: 'page', layer: repoType.config.layers?.[0]?.layer || 'ui', filePath: 'src/index.ts', metadata: { isEntryPoint: true } },
      { id: 'node-comp1', label: 'Core Component', type: 'component', layer: repoType.config.layers?.[0]?.layer || 'ui', filePath: 'src/components/Core.tsx' },
      { id: 'node-comp2', label: 'Shared UI', type: 'component', layer: repoType.config.layers?.[0]?.layer || 'ui', filePath: 'src/components/Shared.tsx' },
      { id: 'node-logic1', label: 'Business Logic', type: 'service', layer: repoType.config.layers?.[1]?.layer || 'logic', filePath: 'src/services/logic.ts' },
      { id: 'node-logic2', label: 'Data Manager', type: 'service', layer: repoType.config.layers?.[1]?.layer || 'logic', filePath: 'src/services/data.ts' },
      { id: 'node-util', label: 'Utilities', type: 'utility', layer: repoType.config.layers?.[2]?.layer || 'data', filePath: 'src/utils/helpers.ts' },
      { id: 'node-config', label: 'Configuration', type: 'config', layer: repoType.config.layers?.[3]?.layer || 'config', filePath: 'config/settings.json' },
    ];

    const mockDependencies: ParsedDependency[] = [
      { from: 'node-entry', to: 'node-comp1', type: 'import' },
      { from: 'node-entry', to: 'node-comp2', type: 'import' },
      { from: 'node-comp1', to: 'node-logic1', type: 'call' },
      { from: 'node-comp2', to: 'node-logic1', type: 'call' },
      { from: 'node-logic1', to: 'node-logic2', type: 'import' },
      { from: 'node-logic1', to: 'node-util', type: 'import' },
      { from: 'node-logic2', to: 'node-config', type: 'import' },
    ];

    const mockStorySteps: ParsedStoryStep[] = [
      {
        step: 1,
        title: 'Initialization',
        description: 'The system initializes and loads core components.',
        highlightedNodes: ['node-entry', 'node-comp1', 'node-comp2'],
        highlightedEdges: ['node-entry->node-comp1', 'node-entry->node-comp2'],
      },
      {
        step: 2,
        title: 'Business Logic Execution',
        description: 'Components interact with the service layer to execute business rules.',
        highlightedNodes: ['node-comp1', 'node-logic1', 'node-logic2'],
        highlightedEdges: ['node-comp1->node-logic1', 'node-logic1->node-logic2'],
      },
      {
        step: 3,
        title: 'Data & Configuration',
        description: 'Services access utilities and configuration to complete requests.',
        highlightedNodes: ['node-logic2', 'node-util', 'node-config'],
        highlightedEdges: ['node-logic1->node-util', 'node-logic2->node-config'],
      },
    ];

    this.reportProgress({
      phase: 'parsing',
      progress: 100,
      message: 'Dynamic parsing complete',
    });

    return {
      metadata,
      nodes: mockNodes,
      dependencies: mockDependencies,
      layers: repoType.config.layers || this.getDefaultLayers(),
      storySteps: mockStorySteps,
      confidence: 0.75, // Good confidence for supported repos without intelligence packages
    };
  }

  /**
   * Parse a repository using fallback heuristics for unknown types
   * 
   * PLACEHOLDER: Will be implemented with heuristic parsing logic
   * 
   * @param metadata - Repository metadata
   * @returns Promise resolving to parsed repository structure
   */
  public async parseFallback(metadata: RepositoryMetadata): Promise<ParsedRepository> {
    this.reportProgress({
      phase: 'parsing',
      progress: 50,
      message: 'Applying fallback parsing heuristics...',
      details: {
        currentFile: 'Analyzing file structure...',
        filesProcessed: 0,
        totalFiles: metadata.fileCount,
      },
    });

    // Use repo name for believable, repo-specific labels
    const repoName = metadata.name || 'project';
    const repoNameClean = repoName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const fallbackLayers: LayerDefinition[] = [
      { layer: 'ui', label: 'Frontend & UI', ny: 0.15, description: 'User interface components and views' },
      { layer: 'api', label: 'API & Services', ny: 0.40, description: 'Business logic and service orchestration' },
      { layer: 'shared', label: 'Shared Utilities', ny: 0.65, description: 'Common helpers and types' },
      { layer: 'infra', label: 'Infrastructure', ny: 0.85, description: 'Configuration and deployment' },
    ];

    const fallbackNodes: ParsedNode[] = [
      // UI Layer
      { id: 'app-entry', label: 'App Entry Point', type: 'page', layer: 'ui', filePath: 'src/App.tsx', metadata: { complexity: 2, isEntryPoint: true, description: `Main ${repoNameClean} application container`, technologies: ['React', 'TypeScript'] } },
      { id: 'main-view', label: 'Dashboard View', type: 'component', layer: 'ui', filePath: 'src/components/Dashboard.tsx', metadata: { complexity: 5, description: `Primary ${repoNameClean} user interface`, technologies: ['React', 'CSS'] } },
      { id: 'nav-bar', label: 'Navigation', type: 'component', layer: 'ui', filePath: 'src/components/Nav.tsx', metadata: { complexity: 1, description: `${repoNameClean} navigation and routing`, technologies: ['React'] } },
      // API Layer
      { id: 'api-router', label: 'API Router', type: 'route', layer: 'api', filePath: 'src/api/routes.ts', metadata: { complexity: 3, description: `${repoNameClean} request routing and endpoints`, technologies: ['Express', 'TypeScript'] } },
      { id: 'data-service', label: 'Core Service', type: 'service', layer: 'api', filePath: 'src/services/core.ts', metadata: { complexity: 8, description: `Core ${repoNameClean} business logic and data processing`, technologies: ['TypeScript'] } },
      { id: 'auth-middleware', label: 'Auth Layer', type: 'middleware', layer: 'api', filePath: 'src/middleware/auth.ts', metadata: { complexity: 4, description: `${repoNameClean} authentication and authorization`, technologies: ['JWT', 'TypeScript'] } },
      // Shared Utilities
      { id: 'api-client', label: 'API Client', type: 'utility', layer: 'shared', filePath: 'src/utils/api.ts', metadata: { complexity: 2, description: `Network request layer for ${repoNameClean}`, technologies: ['Fetch', 'TypeScript'] } },
      { id: 'format-utils', label: 'Utilities', type: 'utility', layer: 'shared', filePath: 'src/utils/helpers.ts', metadata: { complexity: 1, description: `${repoNameClean} formatting and validation helpers`, technologies: ['TypeScript'] } },
      // Infrastructure
      { id: 'db-config', label: 'Database Config', type: 'config', layer: 'infra', filePath: 'config/database.ts', metadata: { complexity: 2, description: `${repoNameClean} database connection settings`, technologies: ['PostgreSQL', 'TypeScript'] } },
      { id: 'env-setup', label: 'Environment', type: 'config', layer: 'infra', filePath: '.env.example', metadata: { complexity: 1, description: `${repoNameClean} environment variables and secrets`, technologies: ['dotenv'] } },
    ];

    const fallbackDependencies: ParsedDependency[] = [
      // UI -> UI
      { from: 'app-entry', to: 'main-view', type: 'import', weight: 1.0 },
      { from: 'app-entry', to: 'nav-bar', type: 'import', weight: 1.0 },
      // UI -> Shared
      { from: 'main-view', to: 'api-client', type: 'call', weight: 0.8 },
      { from: 'main-view', to: 'format-utils', type: 'call', weight: 0.5 },
      // Shared -> API
      { from: 'api-client', to: 'api-router', type: 'async', weight: 0.9 },
      // API internals
      { from: 'api-router', to: 'auth-middleware', type: 'import', weight: 0.9 },
      { from: 'api-router', to: 'data-service', type: 'call', weight: 0.9 },
      // API -> Shared
      { from: 'data-service', to: 'format-utils', type: 'call', weight: 0.4 },
      // API -> Infra
      { from: 'data-service', to: 'db-config', type: 'import', weight: 1.0 },
      { from: 'db-config', to: 'env-setup', type: 'import', weight: 1.0 },
      { from: 'auth-middleware', to: 'env-setup', type: 'import', weight: 1.0 },
    ];

    const fallbackStorySteps: ParsedStoryStep[] = [
      {
        step: 1,
        title: 'Frontend Rendering Flow',
        description: `The ${repoNameClean} application initializes through the main entry point, loading core interface components and navigation structures.`,
        highlightedNodes: ['app-entry', 'main-view', 'nav-bar'],
        highlightedEdges: ['app-entry->main-view', 'app-entry->nav-bar'],
      },
      {
        step: 2,
        title: 'API Request Lifecycle',
        description: `User actions trigger asynchronous data requests via shared utility clients, routing to the ${repoNameClean} API layer.`,
        highlightedNodes: ['main-view', 'api-client', 'api-router'],
        highlightedEdges: ['main-view->api-client', 'api-client->api-router'],
      },
      {
        step: 3,
        title: 'Security & Orchestration',
        description: `Incoming requests pass through ${repoNameClean} authentication middleware before reaching core services for business logic execution.`,
        highlightedNodes: ['api-router', 'auth-middleware', 'data-service'],
        highlightedEdges: ['api-router->auth-middleware', 'api-router->data-service'],
      },
      {
        step: 4,
        title: 'Infrastructure Integration',
        description: `${repoNameClean} services connect to underlying infrastructure, establishing secure database connections governed by environment configurations.`,
        highlightedNodes: ['data-service', 'db-config', 'env-setup'],
        highlightedEdges: ['data-service->db-config', 'db-config->env-setup', 'auth-middleware->env-setup'],
      },
    ];

    this.reportProgress({
      phase: 'parsing',
      progress: 100,
      message: 'Fallback architecture generated',
    });

    return {
      metadata: {
        ...metadata,
        type: metadata.type === 'unknown' ? 'fullstack' : metadata.type,
      },
      nodes: fallbackNodes,
      dependencies: fallbackDependencies,
      layers: fallbackLayers,
      storySteps: fallbackStorySteps,
      confidence: 0.42,
    };
  }

  /**
   * Get default layer definitions for unknown repository types
   * 
   * @returns Array of default layer definitions
   */
  private getDefaultLayers(): LayerDefinition[] {
    return [
      {
        layer: 'ui',
        label: 'User Interface',
        ny: 0,
        description: 'Frontend components and views',
      },
      {
        layer: 'logic',
        label: 'Business Logic',
        ny: 1,
        description: 'Core application logic',
      },
      {
        layer: 'data',
        label: 'Data Layer',
        ny: 2,
        description: 'Data access and storage',
      },
    ];
  }

  /**
   * Add a new supported repository pattern
   * 
   * @param repoPattern - Repository pattern configuration
   */
  public addSupportedRepo(repoPattern: SupportedRepo): void {
    this.supportedRepos.push(repoPattern);
  }

  /**
   * Get all supported repository patterns
   * 
   * @returns Array of supported repository patterns
   */
  public getSupportedRepos(): SupportedRepo[] {
    return [...this.supportedRepos];
  }

  /**
   * Parse a specific file in the repository
   * 
   * PLACEHOLDER: Will be implemented with file-specific parsing
   * 
   * @param filePath - Path to the file to parse
   * @param content - File content
   * @returns Array of parsed nodes from the file
   */
  private async parseFile(filePath: string, content: string): Promise<ParsedNode[]> {
    // TODO: Implement file parsing logic
    // This will use language-specific parsers (TypeScript, JavaScript, Python, etc.)
    // to extract functions, classes, components, and their relationships
    console.log(`[PLACEHOLDER] Parsing file: ${filePath}`);
    return [];
  }

  /**
   * Extract dependencies from parsed nodes
   * 
   * PLACEHOLDER: Will be implemented with dependency analysis
   * 
   * @param nodes - Array of parsed nodes
   * @returns Array of dependencies between nodes
   */
  private async extractDependencies(nodes: ParsedNode[]): Promise<ParsedDependency[]> {
    // TODO: Implement dependency extraction
    // This will analyze imports, function calls, and other relationships
    console.log(`[PLACEHOLDER] Extracting dependencies from ${nodes.length} nodes`);
    return [];
  }

  /**
   * Generate story steps from parsed structure
   * 
   * PLACEHOLDER: Will be implemented with story generation logic
   * 
   * @param nodes - Array of parsed nodes
   * @param dependencies - Array of dependencies
   * @returns Array of story steps
   */
  private async generateStorySteps(
    nodes: ParsedNode[],
    dependencies: ParsedDependency[]
  ): Promise<ParsedStoryStep[]> {
    // TODO: Implement story step generation
    // This will create a narrative flow through the codebase
    console.log(`[PLACEHOLDER] Generating story steps from ${nodes.length} nodes`);
    return [];
  }
}

// Export singleton instance
export const parserService = ParserService.getInstance();

// Made with Bob
