/**
 * BFloat16 Verilog Hardware Intelligence Package
 * 
 * Curated intelligence package for the BFloat16 floating-point arithmetic
 * hardware implementation. This package provides optimized node layout,
 * handcrafted dependencies, and premium story walkthrough.
 * 
 * Repository: https://github.com/BFloat16/verilog-floating-point
 */

import {
  ParsedRepository,
  ParsedNode,
  ParsedDependency,
  ParsedStoryStep,
  LayerDefinition,
  RepositoryMetadata,
} from '../../types/repository';

/**
 * Repository metadata for BFloat16 hardware project
 */
const bfloat16Metadata: Partial<RepositoryMetadata> = {
  url: 'https://github.com/BFloat16/verilog-floating-point',
  owner: 'BFloat16',
  name: 'verilog-floating-point',
  branch: 'main',
  language: 'Verilog',
  framework: null,
  type: 'library',
};

/**
 * Layer definitions for hardware dataflow architecture
 * 
 * L1  Input Layer           y ≈ 0.08
 * L2  Unpacking Layer       y ≈ 0.27
 * L3  Arithmetic Core       y ≈ 0.50  (center of gravity)
 * L4  Post-Processing       y ≈ 0.72
 * L5  Output Layer          y ≈ 0.90
 */
const bfloat16Layers: LayerDefinition[] = [
  { layer: 'input', label: 'Input Layer', ny: 0.08, description: 'Input registers and data loading' },
  { layer: 'unpacking', label: 'Unpacking Layer', ny: 0.27, description: 'BFloat16 format unpacking' },
  { layer: 'arithmetic', label: 'Arithmetic Core', ny: 0.50, description: 'Core arithmetic operations' },
  { layer: 'postprocess', label: 'Post-Processing', ny: 0.72, description: 'Result normalization and selection' },
  { layer: 'output', label: 'Output Layer', ny: 0.90, description: 'Display and status outputs' },
];

/**
 * Optimized node layout for BFloat16 hardware architecture
 * 
 * Each node represents a hardware module with precise positioning
 * for optimal visualization in the intelligence canvas.
 */
const bfloat16Nodes: ParsedNode[] = [
  // ── Layer 1: Input ──
  {
    id: 'pipo-a',
    label: 'Register A',
    type: 'input',
    layer: 'input',
    filePath: 'pipo.v',
    metadata: {
      nx: 0.35,
      ny: 0.08,
      description: 'PIPO register storing operand A. Latches 16-bit BFloat16 data on button press.',
      criticality: 'high',
      technologies: ['Verilog', 'PIPO', '16-bit'],
    },
  },
  {
    id: 'pipo-b',
    label: 'Register B',
    type: 'input',
    layer: 'input',
    filePath: 'pipo.v',
    metadata: {
      nx: 0.65,
      ny: 0.08,
      description: 'PIPO register storing operand B. Latches 16-bit BFloat16 data on button press.',
      criticality: 'high',
      technologies: ['Verilog', 'PIPO', '16-bit'],
    },
  },

  // ── Layer 2: Unpacking ──
  {
    id: 'unpacker-a',
    label: 'Unpacker A',
    type: 'unpacker',
    layer: 'unpacking',
    filePath: 'unpacker.v',
    metadata: {
      nx: 0.35,
      ny: 0.27,
      description: 'Extracts sign (1-bit), exponent (8-bit), and mantissa (8-bit) from BFloat16 format. Adds implicit leading 1 for normalized numbers.',
      criticality: 'critical',
      technologies: ['BFloat16', 'IEEE 754'],
    },
  },
  {
    id: 'unpacker-b',
    label: 'Unpacker B',
    type: 'unpacker',
    layer: 'unpacking',
    filePath: 'unpacker.v',
    metadata: {
      nx: 0.65,
      ny: 0.27,
      description: 'Extracts sign (1-bit), exponent (8-bit), and mantissa (8-bit) from BFloat16 format. Handles denormalized numbers (exp=0).',
      criticality: 'critical',
      technologies: ['BFloat16', 'IEEE 754'],
    },
  },

  // ── Layer 3: Arithmetic Core ──
  {
    id: 'addition',
    label: 'Addition Unit',
    type: 'arithmetic',
    layer: 'arithmetic',
    filePath: 'addition.v',
    metadata: {
      nx: 0.25,
      ny: 0.50,
      description: 'Performs BFloat16 addition with sign handling. Same signs: adds mantissas. Different signs: subtracts mantissas.',
      criticality: 'critical',
      technologies: ['Floating Point', 'Adder'],
    },
  },
  {
    id: 'subtraction',
    label: 'Subtraction Unit',
    type: 'arithmetic',
    layer: 'arithmetic',
    filePath: 'subtraction.v',
    metadata: {
      nx: 0.50,
      ny: 0.50,
      description: 'Performs BFloat16 subtraction with sign handling. Same signs: subtracts mantissas. Different signs: adds mantissas.',
      criticality: 'critical',
      technologies: ['Floating Point', 'Subtractor'],
    },
  },
  {
    id: 'multiplication',
    label: 'Multiplication Unit',
    type: 'arithmetic',
    layer: 'arithmetic',
    filePath: 'multiplication.v',
    metadata: {
      nx: 0.75,
      ny: 0.50,
      description: 'Performs BFloat16 multiplication. XORs signs, multiplies mantissas (8×8=16-bit), adds exponents with bias adjustment.',
      criticality: 'critical',
      technologies: ['Floating Point', 'Multiplier'],
    },
  },

  // ── Layer 3: Support Modules (parallel to arithmetic) ──
  {
    id: 'aligner',
    label: 'Exponent Aligner',
    type: 'support',
    layer: 'arithmetic',
    filePath: 'largenumberalongwithexpadjuster.v',
    metadata: {
      nx: 0.15,
      ny: 0.42,
      description: 'Aligns operands by finding larger exponent and shifting smaller mantissa right. Critical for addition/subtraction accuracy.',
      criticality: 'critical',
      technologies: ['Barrel Shifter', 'Comparator'],
    },
  },
  {
    id: 'grs',
    label: 'GRS Rounding',
    type: 'support',
    layer: 'arithmetic',
    filePath: 'grs.v',
    metadata: {
      nx: 0.15,
      ny: 0.58,
      description: 'Guard, Round, Sticky bit implementation for IEEE 754 round-to-nearest-even (banker\'s rounding).',
      criticality: 'high',
      technologies: ['IEEE 754', 'Rounding'],
    },
  },
  {
    id: 'exception',
    label: 'Exception Handler',
    type: 'support',
    layer: 'arithmetic',
    filePath: 'exception.v',
    metadata: {
      nx: 0.85,
      ny: 0.50,
      description: 'Detects special values: NaN (Not a Number), Infinity, and Zero. Ensures IEEE 754 compliance.',
      criticality: 'high',
      technologies: ['IEEE 754', 'Exception'],
    },
  },

  // ── Layer 4: Post-Processing ──
  {
    id: 'mux',
    label: 'Operation Selector',
    type: 'control',
    layer: 'postprocess',
    filePath: 'mainmodule.v',
    metadata: {
      nx: 0.50,
      ny: 0.72,
      description: 'Multiplexer selecting result based on opcode (2-bit): 01=SUB, 10=ADD, 11=MUL. Exception cases override normal results.',
      criticality: 'critical',
      technologies: ['Multiplexer', 'Control'],
    },
  },
  {
    id: 'normalizer',
    label: 'Normalizer',
    type: 'support',
    layer: 'postprocess',
    filePath: 'normalizer.v',
    metadata: {
      nx: 0.50,
      ny: 0.82,
      description: 'Post-operation normalization: shifts mantissa to ensure leading 1, adjusts exponent. Handles zero results and overflow.',
      criticality: 'critical',
      technologies: ['Barrel Shifter', 'Normalization'],
    },
  },

  // ── Layer 5: Output ──
  {
    id: 'display',
    label: '7-Segment Display',
    type: 'output',
    layer: 'output',
    filePath: 'display.v',
    metadata: {
      nx: 0.40,
      ny: 0.90,
      description: 'Converts BFloat16 result to 4-digit hexadecimal display. Multiplexed at 1kHz for visual persistence.',
      criticality: 'medium',
      technologies: ['7-Segment', 'Hex Decoder'],
    },
  },
  {
    id: 'led',
    label: 'LED Indicators',
    type: 'output',
    layer: 'output',
    filePath: 'led.v',
    metadata: {
      nx: 0.60,
      ny: 0.90,
      description: 'Status LEDs indicating: Sign bit, Zero flag, Infinity/NaN flag. Provides quick visual feedback.',
      criticality: 'low',
      technologies: ['LED', 'Status'],
    },
  },
  {
    id: 'clkdiv',
    label: 'Clock Divider',
    type: 'control',
    layer: 'output',
    filePath: 'clkdiv.v',
    metadata: {
      nx: 0.50,
      ny: 0.95,
      description: 'Generates 1kHz clock from input clock for display refresh. Ensures flicker-free multiplexed display.',
      criticality: 'medium',
      technologies: ['Clock', 'Divider'],
    },
  },
];

/**
 * Handcrafted dependencies between hardware modules
 * 
 * Represents the dataflow through the BFloat16 arithmetic pipeline.
 */
const bfloat16Dependencies: ParsedDependency[] = [
  // L1 → L2: Input to Unpacking
  { from: 'pipo-a', to: 'unpacker-a', type: 'sync', weight: 1.0 },
  { from: 'pipo-b', to: 'unpacker-b', type: 'sync', weight: 1.0 },

  // L2 → L3: Unpacking to Arithmetic
  { from: 'unpacker-a', to: 'addition', type: 'sync', weight: 0.9 },
  { from: 'unpacker-b', to: 'addition', type: 'sync', weight: 0.9 },
  { from: 'unpacker-a', to: 'subtraction', type: 'sync', weight: 0.9 },
  { from: 'unpacker-b', to: 'subtraction', type: 'sync', weight: 0.9 },
  { from: 'unpacker-a', to: 'multiplication', type: 'sync', weight: 0.9 },
  { from: 'unpacker-b', to: 'multiplication', type: 'sync', weight: 0.9 },

  // L2 → L3: Unpacking to Support
  { from: 'unpacker-a', to: 'aligner', type: 'sync', weight: 0.8 },
  { from: 'unpacker-b', to: 'aligner', type: 'sync', weight: 0.8 },
  { from: 'unpacker-a', to: 'exception', type: 'sync', weight: 0.7 },
  { from: 'unpacker-b', to: 'exception', type: 'sync', weight: 0.7 },

  // L3: Support to Arithmetic
  { from: 'aligner', to: 'addition', type: 'sync', weight: 0.95 },
  { from: 'aligner', to: 'subtraction', type: 'sync', weight: 0.95 },
  { from: 'aligner', to: 'grs', type: 'sync', weight: 0.8 },
  { from: 'grs', to: 'addition', type: 'sync', weight: 0.85 },
  { from: 'grs', to: 'subtraction', type: 'sync', weight: 0.85 },

  // L3 → L4: Arithmetic to Selector
  { from: 'addition', to: 'mux', type: 'sync', weight: 0.9 },
  { from: 'subtraction', to: 'mux', type: 'sync', weight: 0.9 },
  { from: 'multiplication', to: 'mux', type: 'sync', weight: 0.9 },
  { from: 'exception', to: 'mux', type: 'sync', weight: 0.85 },

  // L4 → L4: Selector to Normalizer
  { from: 'mux', to: 'normalizer', type: 'sync', weight: 1.0 },

  // L4 → L5: Normalizer to Output
  { from: 'normalizer', to: 'display', type: 'sync', weight: 0.9 },
  { from: 'normalizer', to: 'led', type: 'sync', weight: 0.8 },

  // L5: Clock to Display
  { from: 'clkdiv', to: 'display', type: 'stream', weight: 0.7 },
];

/**
 * Premium story walkthrough for BFloat16 hardware
 * 
 * Handcrafted narrative flow explaining the hardware pipeline
 * with code snippets and architectural insights.
 */
const bfloat16StorySteps: ParsedStoryStep[] = [
  {
    step: 1,
    title: 'Input Loading & Storage',
    description: 'User loads two BFloat16 operands into parallel registers via button presses. Each register stores 16 bits: 1 sign + 8 exponent + 7 mantissa bits.',
    highlightedNodes: ['pipo-a', 'pipo-b'],
    highlightedEdges: [],
  },
  {
    step: 2,
    title: 'BFloat16 Unpacking',
    description: 'Both operands are unpacked into sign, exponent, and mantissa components. The unpacker adds an implicit leading 1 for normalized numbers (exp ≠ 0).',
    highlightedNodes: ['pipo-a', 'pipo-b', 'unpacker-a', 'unpacker-b'],
    highlightedEdges: ['pipo-a->unpacker-a', 'pipo-b->unpacker-b'],
  },
  {
    step: 3,
    title: 'Exponent Alignment',
    description: 'For addition/subtraction, operands must have the same exponent. The aligner finds the larger exponent and shifts the smaller mantissa right by the difference.',
    highlightedNodes: ['unpacker-a', 'unpacker-b', 'aligner', 'grs', 'addition', 'subtraction'],
    highlightedEdges: [
      'unpacker-a->aligner',
      'unpacker-b->aligner',
      'aligner->grs',
      'aligner->addition',
      'aligner->subtraction',
      'grs->addition',
    ],
  },
  {
    step: 4,
    title: 'Parallel Arithmetic Execution',
    description: 'All three operations (ADD, SUB, MUL) compute simultaneously in parallel. This dataflow architecture maximizes throughput at the cost of area.',
    highlightedNodes: ['addition', 'subtraction', 'multiplication', 'exception'],
    highlightedEdges: [
      'aligner->addition',
      'aligner->subtraction',
      'unpacker-a->multiplication',
      'unpacker-b->multiplication',
    ],
  },
  {
    step: 5,
    title: 'Operation Selection & Exception Handling',
    description: 'A multiplexer selects the final result based on the 2-bit opcode. Exception cases (NaN, Infinity, Zero) override normal arithmetic results.',
    highlightedNodes: ['addition', 'subtraction', 'multiplication', 'exception', 'mux'],
    highlightedEdges: [
      'addition->mux',
      'subtraction->mux',
      'multiplication->mux',
      'exception->mux',
    ],
  },
  {
    step: 6,
    title: 'Normalization & Display Output',
    description: 'The normalizer shifts the mantissa to ensure a leading 1 and adjusts the exponent. The result is then converted to hexadecimal and displayed on 7-segment LEDs.',
    highlightedNodes: ['mux', 'normalizer', 'display', 'led', 'clkdiv'],
    highlightedEdges: [
      'mux->normalizer',
      'normalizer->display',
      'normalizer->led',
      'clkdiv->display',
    ],
  },
];

/**
 * Complete BFloat16 intelligence package
 * 
 * This is a curated, handcrafted intelligence package that provides
 * optimal visualization and understanding of the BFloat16 hardware.
 */
export const bfloat16IntelligencePackage: ParsedRepository = {
  metadata: {
    url: bfloat16Metadata.url!,
    owner: bfloat16Metadata.owner!,
    name: bfloat16Metadata.name!,
    branch: bfloat16Metadata.branch!,
    clonedAt: new Date(),
    fileCount: 15,
    language: bfloat16Metadata.language!,
    framework: bfloat16Metadata.framework || null,
    type: bfloat16Metadata.type!,
  },
  nodes: bfloat16Nodes,
  dependencies: bfloat16Dependencies,
  layers: bfloat16Layers,
  storySteps: bfloat16StorySteps,
  confidence: 0.95, // High confidence for curated intelligence
};

// Made with Bob