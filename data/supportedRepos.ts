/**
 * Supported Repository Configurations
 * 
 * Defines patterns for recognizing supported repositories and provides
 * optimized intelligence packages for them. Each configuration includes
 * pattern matching, parser type, layer strategy, and story template.
 */

import { SupportedRepo, RepositoryMetadata } from '../types/repository';

/**
 * Supported repository configurations
 * 
 * Each entry defines:
 * - Unique ID for intelligence package lookup
 * - Pattern matching regex for repository detection
 * - Display name and description
 * - Parser type identifier
 * - Layer strategy identifier
 * - Story template identifier
 * - Example URL
 * - Expected confidence score
 */
export const supportedRepositories: SupportedRepo[] = [
  {
    pattern: /github\.com\/BFloat16\/verilog-floating-point/i,
    type: 'bfloat16-hardware',
    name: 'BFloat16 Verilog Hardware',
    description: 'Hardware implementation of BFloat16 floating-point arithmetic in Verilog',
    config: {
      entryPoints: ['mainmodule.v', 'top.v', '*.v'],
      includePatterns: ['**/*.v', '**/*.sv', '**/*.vh'],
      excludePatterns: ['**/testbench/**', '**/tb_*.v', '**/sim/**'],
      layers: [
        { layer: 'input', label: 'Input Layer', ny: 0.08, description: 'Input registers and data loading' },
        { layer: 'unpacking', label: 'Unpacking Layer', ny: 0.27, description: 'BFloat16 format unpacking' },
        { layer: 'arithmetic', label: 'Arithmetic Core', ny: 0.50, description: 'Core arithmetic operations' },
        { layer: 'postprocess', label: 'Post-Processing', ny: 0.72, description: 'Result normalization and selection' },
        { layer: 'output', label: 'Output Layer', ny: 0.90, description: 'Display and status outputs' },
      ],
      customRules: {
        parserType: 'verilog',
        layerStrategy: 'hardware-dataflow',
        storyTemplate: 'hardware-pipeline',
        confidenceScore: 0.95,
        hasIntelligencePackage: true,
        intelligencePackageId: 'bfloat16',
      },
    },
  },
  {
    pattern: /\/next\.js|nextjs|next-app/i,
    type: 'nextjs-app',
    name: 'Next.js Application',
    description: 'React framework with server-side rendering and API routes',
    config: {
      entryPoints: ['pages/', 'app/', 'src/pages/', 'src/app/', 'next.config.js'],
      includePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      excludePatterns: ['node_modules/**', '.next/**', 'out/**', 'dist/**', 'build/**'],
      layers: [
        { layer: 'pages', label: 'Pages & Routes', ny: 0.15, description: 'Page components and routing' },
        { layer: 'components', label: 'UI Components', ny: 0.35, description: 'Reusable React components' },
        { layer: 'api', label: 'API Routes', ny: 0.55, description: 'Server-side API endpoints' },
        { layer: 'data', label: 'Data Layer', ny: 0.75, description: 'Data fetching and state management' },
        { layer: 'config', label: 'Configuration', ny: 0.90, description: 'App configuration and utilities' },
      ],
      customRules: {
        parserType: 'typescript-react',
        layerStrategy: 'web-app-layers',
        storyTemplate: 'user-journey',
        confidenceScore: 0.85,
        hasIntelligencePackage: false,
      },
    },
  },
  {
    pattern: /react-component|ui-library|design-system/i,
    type: 'react-library',
    name: 'React Component Library',
    description: 'Reusable React component library or design system',
    config: {
      entryPoints: ['src/components/', 'src/index.ts', 'lib/', 'components/'],
      includePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      excludePatterns: ['node_modules/**', 'dist/**', 'build/**', 'storybook-static/**', '**/*.test.*', '**/*.spec.*'],
      layers: [
        { layer: 'primitives', label: 'Primitive Components', ny: 0.20, description: 'Basic building blocks' },
        { layer: 'composite', label: 'Composite Components', ny: 0.40, description: 'Complex composed components' },
        { layer: 'patterns', label: 'Pattern Components', ny: 0.60, description: 'Common UI patterns' },
        { layer: 'utilities', label: 'Utilities & Hooks', ny: 0.80, description: 'Helper functions and custom hooks' },
      ],
      customRules: {
        parserType: 'typescript-react',
        layerStrategy: 'component-hierarchy',
        storyTemplate: 'component-showcase',
        confidenceScore: 0.80,
        hasIntelligencePackage: false,
      },
    },
  },
  {
    pattern: /microservice|service-mesh|kubernetes|docker-compose/i,
    type: 'microservices',
    name: 'Microservices Architecture',
    description: 'Containerized microservices with service orchestration',
    config: {
      entryPoints: ['docker-compose.yml', 'kubernetes/', 'services/', 'src/'],
      includePatterns: ['**/*.ts', '**/*.js', '**/*.py', '**/*.go', '**/*.yml', '**/*.yaml', 'Dockerfile*'],
      excludePatterns: ['node_modules/**', 'dist/**', 'build/**', '__pycache__/**', 'vendor/**'],
      layers: [
        { layer: 'gateway', label: 'API Gateway', ny: 0.10, description: 'Entry point and routing' },
        { layer: 'services', label: 'Business Services', ny: 0.35, description: 'Core microservices' },
        { layer: 'data', label: 'Data Services', ny: 0.60, description: 'Database and cache services' },
        { layer: 'messaging', label: 'Message Queue', ny: 0.80, description: 'Event bus and messaging' },
        { layer: 'infrastructure', label: 'Infrastructure', ny: 0.95, description: 'Orchestration and monitoring' },
      ],
      customRules: {
        parserType: 'multi-language',
        layerStrategy: 'service-topology',
        storyTemplate: 'request-flow',
        confidenceScore: 0.75,
        hasIntelligencePackage: false,
      },
    },
  },
];

/**
 * Find a supported repository configuration based on metadata
 * 
 * Attempts to match the repository against known patterns using:
 * 1. Repository URL pattern matching
 * 2. Repository name pattern matching
 * 3. Framework detection from metadata
 * 
 * @param metadata - Repository metadata to analyze
 * @returns Matching SupportedRepo configuration or null if no match
 * 
 * @example
 * ```typescript
 * const metadata = {
 *   url: 'https://github.com/BFloat16/verilog-floating-point',
 *   name: 'verilog-floating-point',
 *   framework: null,
 *   // ... other fields
 * };
 * const supported = findSupportedRepo(metadata);
 * if (supported) {
 *   console.log(`Detected: ${supported.name}`);
 * }
 * ```
 */
export function findSupportedRepo(metadata: RepositoryMetadata): SupportedRepo | null {
  // Try URL pattern matching first (most specific)
  for (const repo of supportedRepositories) {
    if (repo.pattern.test(metadata.url)) {
      return repo;
    }
  }

  // Try repository name pattern matching
  for (const repo of supportedRepositories) {
    if (repo.pattern.test(metadata.name)) {
      return repo;
    }
  }

  // Try framework detection from metadata
  if (metadata.framework) {
    for (const repo of supportedRepositories) {
      if (repo.pattern.test(metadata.framework)) {
        return repo;
      }
    }
  }

  // Try type-based matching
  const typePatterns: Record<string, RegExp> = {
    'nextjs-app': /next\.?js/i,
    'react-library': /react/i,
    'microservices': /microservice|docker|kubernetes/i,
  };

  for (const repo of supportedRepositories) {
    const pattern = typePatterns[repo.type];
    if (pattern) {
      // Check against repository name
      if (pattern.test(metadata.name)) {
        return repo;
      }
      // Check against framework
      if (metadata.framework && pattern.test(metadata.framework)) {
        return repo;
      }
    }
  }

  return null;
}

/**
 * Get a supported repository configuration by type identifier
 * 
 * @param type - Repository type identifier (e.g., 'bfloat16-hardware', 'nextjs-app')
 * @returns Matching SupportedRepo configuration or null if not found
 * 
 * @example
 * ```typescript
 * const config = getSupportedRepoByType('bfloat16-hardware');
 * if (config) {
 *   console.log(`Parser type: ${config.config.customRules?.parserType}`);
 * }
 * ```
 */
export function getSupportedRepoByType(type: string): SupportedRepo | null {
  return supportedRepositories.find(repo => repo.type === type) || null;
}

/**
 * Check if a repository has a curated intelligence package
 * 
 * @param metadata - Repository metadata to check
 * @returns True if an intelligence package exists for this repository
 * 
 * @example
 * ```typescript
 * if (hasIntelligencePackage(metadata)) {
 *   console.log('Using curated intelligence package');
 * } else {
 *   console.log('Using dynamic parser');
 * }
 * ```
 */
export function hasIntelligencePackage(metadata: RepositoryMetadata): boolean {
  const supported = findSupportedRepo(metadata);
  return supported?.config.customRules?.hasIntelligencePackage === true;
}

/**
 * Get the intelligence package ID for a repository
 * 
 * @param metadata - Repository metadata
 * @returns Intelligence package ID or null if none exists
 * 
 * @example
 * ```typescript
 * const packageId = getIntelligencePackageId(metadata);
 * if (packageId) {
 *   const intelligence = getIntelligencePackage(packageId);
 * }
 * ```
 */
export function getIntelligencePackageId(metadata: RepositoryMetadata): string | null {
  const supported = findSupportedRepo(metadata);
  if (supported?.config.customRules?.hasIntelligencePackage) {
    return supported.config.customRules.intelligencePackageId || null;
  }
  return null;
}

// Made with Bob