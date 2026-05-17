/**
 * Test Script for Intelligence Package System
 * 
 * This script tests the curated repository system and intelligence packages.
 * Run with: npx ts-node test-intelligence-system.ts
 */

import { parserService } from './services/parserService';
import { RepositoryMetadata } from './types/repository';
import {
  supportedRepositories,
  findSupportedRepo,
  getIntelligencePackageId,
} from './data/supportedRepos';
import {
  getIntelligencePackage,
  getAvailablePackageIds,
  getAllPackageMetadata,
} from './data/intelligencePackages';

console.log('=== Testing Intelligence Package System ===\n');

// Test 1: List all supported repositories
console.log('1. Supported Repository Types:');
supportedRepositories.forEach((repo, index) => {
  console.log(`   ${index + 1}. ${repo.name} (${repo.type})`);
  console.log(`      Description: ${repo.description}`);
  console.log(`      Has Intelligence Package: ${repo.config.customRules?.hasIntelligencePackage || false}`);
});
console.log();

// Test 2: List available intelligence packages
console.log('2. Available Intelligence Packages:');
const packageIds = getAvailablePackageIds();
console.log(`   Found ${packageIds.length} package(s): ${packageIds.join(', ')}`);
console.log();

// Test 3: Get package metadata
console.log('3. Intelligence Package Details:');
const packageMetadata = getAllPackageMetadata();
packageMetadata.forEach(pkg => {
  console.log(`   - ${pkg.id}:`);
  console.log(`     Name: ${pkg.name}`);
  console.log(`     Owner: ${pkg.owner}`);
  console.log(`     Nodes: ${pkg.nodeCount}`);
  console.log(`     Confidence: ${pkg.confidence}`);
});
console.log();

// Test 4: Test BFloat16 repository detection
console.log('4. Testing BFloat16 Repository Detection:');
const bfloat16Metadata: RepositoryMetadata = {
  url: 'https://github.com/BFloat16/verilog-floating-point',
  owner: 'BFloat16',
  name: 'verilog-floating-point',
  branch: 'main',
  clonedAt: new Date(),
  fileCount: 15,
  language: 'Verilog',
  framework: null,
  type: 'library',
};

const detectedRepo = findSupportedRepo(bfloat16Metadata);
if (detectedRepo) {
  console.log(`   ✓ Detected: ${detectedRepo.name}`);
  console.log(`   Type: ${detectedRepo.type}`);
  
  const packageId = getIntelligencePackageId(bfloat16Metadata);
  if (packageId) {
    console.log(`   ✓ Intelligence Package ID: ${packageId}`);
    
    const intelligence = getIntelligencePackage(packageId);
    if (intelligence) {
      console.log(`   ✓ Loaded intelligence package:`);
      console.log(`     - Nodes: ${intelligence.nodes.length}`);
      console.log(`     - Dependencies: ${intelligence.dependencies.length}`);
      console.log(`     - Layers: ${intelligence.layers.length}`);
      console.log(`     - Story Steps: ${intelligence.storySteps.length}`);
      console.log(`     - Confidence: ${intelligence.confidence}`);
    }
  }
} else {
  console.log('   ✗ Repository not detected');
}
console.log();

// Test 5: Test Next.js repository detection
console.log('5. Testing Next.js Repository Detection:');
const nextjsMetadata: RepositoryMetadata = {
  url: 'https://github.com/vercel/next.js',
  owner: 'vercel',
  name: 'next.js',
  branch: 'canary',
  clonedAt: new Date(),
  fileCount: 1000,
  language: 'TypeScript',
  framework: 'next.js',
  type: 'library',
};

const detectedNextjs = findSupportedRepo(nextjsMetadata);
if (detectedNextjs) {
  console.log(`   ✓ Detected: ${detectedNextjs.name}`);
  console.log(`   Type: ${detectedNextjs.type}`);
  
  const packageId = getIntelligencePackageId(nextjsMetadata);
  if (packageId) {
    console.log(`   ✓ Has intelligence package: ${packageId}`);
  } else {
    console.log(`   ℹ No intelligence package (will use dynamic parsing)`);
  }
} else {
  console.log('   ✗ Repository not detected');
}
console.log();

// Test 6: Test parser service detection
console.log('6. Testing Parser Service Detection:');
const detectedByParser = parserService.detectRepositoryType(bfloat16Metadata);
if (detectedByParser) {
  console.log(`   ✓ Parser detected: ${detectedByParser.name}`);
  console.log(`   Parser type: ${detectedByParser.config.customRules?.parserType || 'default'}`);
  console.log(`   Layer strategy: ${detectedByParser.config.customRules?.layerStrategy || 'default'}`);
} else {
  console.log('   ✗ Parser did not detect repository');
}
console.log();

console.log('=== All Tests Complete ===');

// Made with Bob
