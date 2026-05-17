/**
 * Intelligence Packages Index
 * 
 * Central export point for all curated intelligence packages.
 * Provides helper functions to retrieve packages by repository ID.
 */

import { ParsedRepository } from '../../types/repository';
import { bfloat16IntelligencePackage } from './bfloat16';

/**
 * Map of intelligence package IDs to their parsed repository data
 * 
 * Each entry represents a curated, handcrafted intelligence package
 * for a specific repository or repository type.
 */
const intelligencePackageMap: Record<string, ParsedRepository> = {
  'bfloat16': bfloat16IntelligencePackage,
  // Future intelligence packages will be added here:
  // 'nextjs-demo': nextjsDemoIntelligencePackage,
  // 'react-library-demo': reactLibraryDemoIntelligencePackage,
  // 'microservices-demo': microservicesDemoIntelligencePackage,
};

/**
 * Get an intelligence package by its ID
 * 
 * @param repoId - Intelligence package identifier (e.g., 'bfloat16')
 * @returns Parsed repository intelligence package or null if not found
 * 
 * @example
 * ```typescript
 * const intelligence = getIntelligencePackage('bfloat16');
 * if (intelligence) {
 *   console.log(`Loaded ${intelligence.nodes.length} nodes`);
 *   console.log(`Confidence: ${intelligence.confidence}`);
 * }
 * ```
 */
export function getIntelligencePackage(repoId: string): ParsedRepository | null {
  return intelligencePackageMap[repoId] || null;
}

/**
 * Check if an intelligence package exists for a given ID
 * 
 * @param repoId - Intelligence package identifier
 * @returns True if the package exists, false otherwise
 * 
 * @example
 * ```typescript
 * if (hasIntelligencePackage('bfloat16')) {
 *   const pkg = getIntelligencePackage('bfloat16');
 * }
 * ```
 */
export function hasIntelligencePackage(repoId: string): boolean {
  return repoId in intelligencePackageMap;
}

/**
 * Get all available intelligence package IDs
 * 
 * @returns Array of intelligence package identifiers
 * 
 * @example
 * ```typescript
 * const availablePackages = getAvailablePackageIds();
 * console.log(`Available packages: ${availablePackages.join(', ')}`);
 * ```
 */
export function getAvailablePackageIds(): string[] {
  return Object.keys(intelligencePackageMap);
}

/**
 * Get metadata about all available intelligence packages
 * 
 * @returns Array of package metadata objects
 * 
 * @example
 * ```typescript
 * const packages = getAllPackageMetadata();
 * packages.forEach(pkg => {
 *   console.log(`${pkg.id}: ${pkg.name} (${pkg.nodeCount} nodes)`);
 * });
 * ```
 */
export function getAllPackageMetadata(): Array<{
  id: string;
  name: string;
  owner: string;
  url: string;
  nodeCount: number;
  confidence: number;
}> {
  return Object.entries(intelligencePackageMap).map(([id, pkg]) => ({
    id,
    name: pkg.metadata.name,
    owner: pkg.metadata.owner,
    url: pkg.metadata.url,
    nodeCount: pkg.nodes.length,
    confidence: pkg.confidence,
  }));
}

// Export individual packages for direct import
export { bfloat16IntelligencePackage } from './bfloat16';

// Made with Bob