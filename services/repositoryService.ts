/**
 * Repository Service
 * 
 * Handles GitHub repository URL validation, information extraction,
 * and future GitHub API integration for repository operations.
 */

import {
  ValidationResult,
  RepositoryMetadata,
  RepositoryError,
  RepositoryErrorCode,
} from '../types/repository';

/**
 * Service for managing GitHub repository operations
 */
export class RepositoryService {
  private static instance: RepositoryService;

  /**
   * Get singleton instance of RepositoryService
   */
  public static getInstance(): RepositoryService {
    if (!RepositoryService.instance) {
      RepositoryService.instance = new RepositoryService();
    }
    return RepositoryService.instance;
  }

  /**
   * Validates a GitHub repository URL
   * 
   * Supports formats:
   * - https://github.com/owner/repo
   * - https://github.com/owner/repo.git
   * - https://github.com/owner/repo/tree/branch
   * - git@github.com:owner/repo.git
   * 
   * @param url - The GitHub repository URL to validate
   * @returns ValidationResult with validity status and extracted info
   * 
   * @example
   * ```typescript
   * const result = await repositoryService.validateUrl('https://github.com/vercel/next.js');
   * if (result.valid) {
   *   console.log(result.repoInfo); // { owner: 'vercel', name: 'next.js', branch: 'main' }
   * }
   * ```
   */
  public async validateUrl(url: string): Promise<ValidationResult> {
    try {
      // Basic validation
      if (!url || typeof url !== 'string') {
        return {
          valid: false,
          error: 'URL is required and must be a string',
        };
      }

      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        return {
          valid: false,
          error: 'URL cannot be empty',
        };
      }

      // Extract repository information
      const repoInfo = this.extractRepoInfo(trimmedUrl);
      
      if (!repoInfo) {
        return {
          valid: false,
          error: 'Invalid GitHub repository URL format. Expected format: https://github.com/owner/repo',
        };
      }

      // Validate owner and repo name format
      const validNamePattern = /^[a-zA-Z0-9._-]+$/;
      if (!validNamePattern.test(repoInfo.owner)) {
        return {
          valid: false,
          error: 'Invalid repository owner name',
        };
      }

      if (!validNamePattern.test(repoInfo.name)) {
        return {
          valid: false,
          error: 'Invalid repository name',
        };
      }

      return {
        valid: true,
        repoInfo,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error',
      };
    }
  }

  /**
   * Extracts repository information from a GitHub URL
   * 
   * @param url - The GitHub repository URL
   * @returns Extracted repository info or null if invalid
   * 
   * @example
   * ```typescript
   * const info = repositoryService.extractRepoInfo('https://github.com/vercel/next.js/tree/canary');
   * // Returns: { owner: 'vercel', name: 'next.js', branch: 'canary' }
   * ```
   */
  public extractRepoInfo(url: string): { owner: string; name: string; branch: string } | null {
    try {
      const trimmedUrl = url.trim();

      // Pattern 1: HTTPS URLs
      // https://github.com/owner/repo
      // https://github.com/owner/repo.git
      // https://github.com/owner/repo/tree/branch
      const httpsPattern = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/tree\/([^\/]+))?(?:\/.*)?$/;
      const httpsMatch = trimmedUrl.match(httpsPattern);
      
      if (httpsMatch) {
        const [, owner, name, branch] = httpsMatch;
        return {
          owner,
          name: name.replace(/\.git$/, ''),
          branch: branch || 'main', // Default to 'main' if no branch specified
        };
      }

      // Pattern 2: SSH URLs
      // git@github.com:owner/repo.git
      const sshPattern = /^git@github\.com:([^\/]+)\/([^\/]+?)(?:\.git)?$/;
      const sshMatch = trimmedUrl.match(sshPattern);
      
      if (sshMatch) {
        const [, owner, name] = sshMatch;
        return {
          owner,
          name: name.replace(/\.git$/, ''),
          branch: 'main', // SSH URLs don't specify branch
        };
      }

      return null;
    } catch (error) {
      console.error('Error extracting repo info:', error);
      return null;
    }
  }

  /**
   * Checks if a repository exists and is accessible
   * 
   * PLACEHOLDER: Will be implemented with GitHub API integration
   * 
   * @param owner - Repository owner
   * @param name - Repository name
   * @returns Promise resolving to true if repository exists
   */
  public async checkRepositoryExists(owner: string, name: string): Promise<boolean> {
    // TODO: Implement GitHub API call to check repository existence
    // This will require GitHub API token and proper authentication
    console.log(`[PLACEHOLDER] Checking if repository exists: ${owner}/${name}`);
    return true;
  }

  /**
   * Fetches repository metadata from GitHub API
   * 
   * PLACEHOLDER: Will be implemented with GitHub API integration
   * 
   * @param owner - Repository owner
   * @param name - Repository name
   * @returns Promise resolving to partial repository metadata
   */
  public async fetchRepositoryMetadata(
    owner: string,
    name: string
  ): Promise<Partial<RepositoryMetadata>> {
    // TODO: Implement GitHub API call to fetch repository metadata
    // This will include: language, stars, forks, description, etc.
    console.log(`[PLACEHOLDER] Fetching metadata for: ${owner}/${name}`);
    
    return {
      owner,
      name,
      language: null,
      framework: null,
      type: 'unknown',
    };
  }

  /**
   * Clones a repository to a temporary directory
   * 
   * PLACEHOLDER: Will be implemented with git clone functionality
   * 
   * @param url - Repository URL
   * @param branch - Branch to clone
   * @returns Promise resolving to the local path of cloned repository
   */
  public async cloneRepository(url: string, branch: string): Promise<string> {
    // TODO: Implement git clone functionality
    // This will use child_process to execute git commands
    // or use a Node.js git library like simple-git
    console.log(`[PLACEHOLDER] Cloning repository: ${url} (branch: ${branch})`);
    
    throw new RepositoryError(
      RepositoryErrorCode.CLONE_FAILED,
      'Repository cloning not yet implemented',
      { url, branch }
    );
  }

  /**
   * Analyzes a cloned repository to extract basic metadata
   * 
   * PLACEHOLDER: Will be implemented with file system analysis
   * 
   * @param repoPath - Local path to cloned repository
   * @returns Promise resolving to repository metadata
   */
  public async analyzeRepository(repoPath: string): Promise<Partial<RepositoryMetadata>> {
    // TODO: Implement repository analysis
    // This will:
    // - Count files
    // - Detect primary language
    // - Detect framework (package.json, requirements.txt, etc.)
    // - Classify repository type
    console.log(`[PLACEHOLDER] Analyzing repository at: ${repoPath}`);
    
    return {
      fileCount: 0,
      language: null,
      framework: null,
      type: 'unknown',
    };
  }

  /**
   * Cleans up temporary repository files
   * 
   * PLACEHOLDER: Will be implemented with file system cleanup
   * 
   * @param repoPath - Local path to cloned repository
   */
  public async cleanupRepository(repoPath: string): Promise<void> {
    // TODO: Implement cleanup functionality
    // This will remove the temporary cloned repository
    console.log(`[PLACEHOLDER] Cleaning up repository at: ${repoPath}`);
  }

  /**
   * Gets the default branch for a repository
   * 
   * PLACEHOLDER: Will be implemented with GitHub API integration
   * 
   * @param owner - Repository owner
   * @param name - Repository name
   * @returns Promise resolving to the default branch name
   */
  public async getDefaultBranch(owner: string, name: string): Promise<string> {
    // TODO: Implement GitHub API call to get default branch
    // Most repositories use 'main' or 'master'
    console.log(`[PLACEHOLDER] Getting default branch for: ${owner}/${name}`);
    return 'main';
  }
}

// Export singleton instance
export const repositoryService = RepositoryService.getInstance();

// Made with Bob
