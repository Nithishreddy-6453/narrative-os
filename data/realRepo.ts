export interface ArchitectureNode {
  id: string;
  label: string;
  type: "input" | "unpacker" | "arithmetic" | "support" | "output" | "control";
  layer: number;
  /** Normalized 0-1 position within the canvas */
  nx: number;
  ny: number;
  description: string;
  criticality: "low" | "medium" | "high" | "critical";
  technologies: string[];
  // Governance & Bob Findings
  findings?: BobFinding[];
  governanceStatus?: "compliant" | "warning" | "violation" | "critical";
  healthScore?: number; // 0-100
}

export type FindingSeverity = "low" | "medium" | "high" | "critical";
export type FindingCategory = "security" | "dependency" | "architecture" | "complexity" | "governance" | "modernization" | "performance";

export interface BobFinding {
  id: string;
  nodeId: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  reasoning: string;
  impact: string;
  remediation?: BobRemediation;
  detectedAt: string;
}

export interface BobRemediation {
  id: string;
  findingId: string;
  strategy: string;
  confidence: number; // 0-100
  estimatedEffort: "low" | "medium" | "high";
  patch?: CodePatch;
  architecturalChanges: string[];
  risks: string[];
}

export interface CodePatch {
  filePath: string;
  language: string;
  before: string;
  after: string;
  explanation: string;
  lineStart: number;
  lineEnd: number;
}

export interface GovernanceViolation {
  id: string;
  type: "dependency" | "architecture" | "security" | "coupling" | "complexity";
  severity: FindingSeverity;
  affectedNodes: string[];
  affectedDependencies: { source: string; target: string }[];
  description: string;
  constraint: string;
  recommendation: string;
}

export interface ArchitecturalDrift {
  id: string;
  driftType: "coupling" | "layering" | "dependency" | "complexity";
  severity: FindingSeverity;
  nodes: string[];
  description: string;
  expectedPattern: string;
  actualPattern: string;
  stabilizationPath: string[];
}

export type ImpactSeverity = "low" | "medium" | "high" | "critical";

export interface ImpactAnalysis {
  prompt: string;
  directlyAffected: string[]; // node IDs
  downstreamImpacted: string[]; // node IDs
  severity: ImpactSeverity;
  reasoning: string;
  propagationPaths: PropagationPath[];
  riskZones: RiskZone[];
  timestamp: string;
}

export interface PropagationPath {
  nodes: string[];
  severity: ImpactSeverity;
  reasoning: string;
  delay: number; // ms delay for animation
}

export interface RiskZone {
  nodeId: string;
  risk: string;
  mitigation: string;
  severity: ImpactSeverity;
}

export interface Dependency {
  source: string;
  target: string;
  type: "sync" | "async" | "stream";
  description: string;
}

export interface StoryStep {
  id: string;
  title: string;
  description: string;
  iconType: "zap" | "database" | "code" | "shield" | "network" | "cpu";
  activeNodes: string[];
  activeDependencies: { source: string; target: string }[];
  codeSnippet: {
    filename: string;
    code: { text: string; highlight?: boolean; type?: "comment" | "code" }[];
  };
  insight: string;
}

// ─── LAYER TOPOLOGY ───────────────────────────────────────
// L1  Input Layer           y ≈ 0.08
// L2  Unpacking Layer       y ≈ 0.27
// L3  Arithmetic Core       y ≈ 0.50  (center of gravity)
// L4  Post-Processing       y ≈ 0.72
// L5  Output Layer          y ≈ 0.90

export const bfloat16Nodes: ArchitectureNode[] = [
  // ── Layer 1: Input ──
  { id: "pipo-a",        label: "Register A",           type: "input",      layer: 1, nx: 0.35, ny: 0.08, description: "PIPO register storing operand A. Latches 16-bit BFloat16 data on button press.", criticality: "high",     technologies: ["Verilog", "PIPO", "16-bit"] },
  { id: "pipo-b",        label: "Register B",           type: "input",      layer: 1, nx: 0.65, ny: 0.08, description: "PIPO register storing operand B. Latches 16-bit BFloat16 data on button press.", criticality: "high",     technologies: ["Verilog", "PIPO", "16-bit"] },

  // ── Layer 2: Unpacking ──
  { id: "unpacker-a",    label: "Unpacker A",           type: "unpacker",   layer: 2, nx: 0.35, ny: 0.27, description: "Extracts sign (1-bit), exponent (8-bit), and mantissa (8-bit) from BFloat16 format. Adds implicit leading 1 for normalized numbers.", criticality: "critical", technologies: ["BFloat16", "IEEE 754"] },
  { id: "unpacker-b",    label: "Unpacker B",           type: "unpacker",   layer: 2, nx: 0.65, ny: 0.27, description: "Extracts sign (1-bit), exponent (8-bit), and mantissa (8-bit) from BFloat16 format. Handles denormalized numbers (exp=0).", criticality: "critical", technologies: ["BFloat16", "IEEE 754"] },

  // ── Layer 3: Arithmetic Core ──
  { id: "addition",      label: "Addition Unit",        type: "arithmetic", layer: 3, nx: 0.25, ny: 0.50, description: "Performs BFloat16 addition with sign handling. Same signs: adds mantissas. Different signs: subtracts mantissas.", criticality: "critical", technologies: ["Floating Point", "Adder"] },
  { id: "subtraction",   label: "Subtraction Unit",     type: "arithmetic", layer: 3, nx: 0.50, ny: 0.50, description: "Performs BFloat16 subtraction with sign handling. Same signs: subtracts mantissas. Different signs: adds mantissas.", criticality: "critical", technologies: ["Floating Point", "Subtractor"] },
  { id: "multiplication",label: "Multiplication Unit",  type: "arithmetic", layer: 3, nx: 0.75, ny: 0.50, description: "Performs BFloat16 multiplication. XORs signs, multiplies mantissas (8×8=16-bit), adds exponents with bias adjustment.", criticality: "critical", technologies: ["Floating Point", "Multiplier"] },
  
  // ── Layer 3: Support Modules (parallel to arithmetic) ──
  { id: "aligner",       label: "Exponent Aligner",     type: "support",    layer: 3, nx: 0.15, ny: 0.42, description: "Aligns operands by finding larger exponent and shifting smaller mantissa right. Critical for addition/subtraction accuracy.", criticality: "critical", technologies: ["Barrel Shifter", "Comparator"] },
  { id: "grs",           label: "GRS Rounding",         type: "support",    layer: 3, nx: 0.15, ny: 0.58, description: "Guard, Round, Sticky bit implementation for IEEE 754 round-to-nearest-even (banker's rounding).", criticality: "high",     technologies: ["IEEE 754", "Rounding"] },
  { id: "exception",     label: "Exception Handler",    type: "support",    layer: 3, nx: 0.85, ny: 0.50, description: "Detects special values: NaN (Not a Number), Infinity, and Zero. Ensures IEEE 754 compliance.", criticality: "high",     technologies: ["IEEE 754", "Exception"] },

  // ── Layer 4: Post-Processing ──
  { id: "mux",           label: "Operation Selector",   type: "control",    layer: 4, nx: 0.50, ny: 0.72, description: "Multiplexer selecting result based on opcode (2-bit): 01=SUB, 10=ADD, 11=MUL. Exception cases override normal results.", criticality: "critical", technologies: ["Multiplexer", "Control"] },
  { id: "normalizer",    label: "Normalizer",           type: "support",    layer: 4, nx: 0.50, ny: 0.82, description: "Post-operation normalization: shifts mantissa to ensure leading 1, adjusts exponent. Handles zero results and overflow.", criticality: "critical", technologies: ["Barrel Shifter", "Normalization"] },

  // ── Layer 5: Output ──
  { id: "display",       label: "7-Segment Display",    type: "output",     layer: 5, nx: 0.40, ny: 0.90, description: "Converts BFloat16 result to 4-digit hexadecimal display. Multiplexed at 1kHz for visual persistence.", criticality: "medium",   technologies: ["7-Segment", "Hex Decoder"] },
  { id: "led",           label: "LED Indicators",       type: "output",     layer: 5, nx: 0.60, ny: 0.90, description: "Status LEDs indicating: Sign bit, Zero flag, Infinity/NaN flag. Provides quick visual feedback.", criticality: "low",      technologies: ["LED", "Status"] },
  { id: "clkdiv",        label: "Clock Divider",        type: "control",    layer: 5, nx: 0.50, ny: 0.95, description: "Generates 1kHz clock from input clock for display refresh. Ensures flicker-free multiplexed display.", criticality: "medium",   technologies: ["Clock", "Divider"] },
];

export const layerLabels = [
  { layer: 1, label: "Input Layer",          ny: 0.08 },
  { layer: 2, label: "Unpacking Layer",      ny: 0.27 },
  { layer: 3, label: "Arithmetic Core",      ny: 0.50 },
  { layer: 4, label: "Post-Processing",      ny: 0.72 },
  { layer: 5, label: "Output Layer",         ny: 0.90 },
];

export const bfloat16Dependencies: Dependency[] = [
  // L1 → L2: Input to Unpacking
  { source: "pipo-a",        target: "unpacker-a",    type: "sync",   description: "16-bit BFloat16 operand A" },
  { source: "pipo-b",        target: "unpacker-b",    type: "sync",   description: "16-bit BFloat16 operand B" },
  
  // L2 → L3: Unpacking to Arithmetic
  { source: "unpacker-a",    target: "addition",      type: "sync",   description: "Sign, 8-bit exponent, 8-bit mantissa" },
  { source: "unpacker-b",    target: "addition",      type: "sync",   description: "Sign, 8-bit exponent, 8-bit mantissa" },
  { source: "unpacker-a",    target: "subtraction",   type: "sync",   description: "Sign, 8-bit exponent, 8-bit mantissa" },
  { source: "unpacker-b",    target: "subtraction",   type: "sync",   description: "Sign, 8-bit exponent, 8-bit mantissa" },
  { source: "unpacker-a",    target: "multiplication",type: "sync",   description: "Sign, 8-bit exponent, 8-bit mantissa" },
  { source: "unpacker-b",    target: "multiplication",type: "sync",   description: "Sign, 8-bit exponent, 8-bit mantissa" },
  
  // L2 → L3: Unpacking to Support
  { source: "unpacker-a",    target: "aligner",       type: "sync",   description: "Exponent and mantissa for alignment" },
  { source: "unpacker-b",    target: "aligner",       type: "sync",   description: "Exponent and mantissa for alignment" },
  { source: "unpacker-a",    target: "exception",     type: "sync",   description: "Check for NaN/Inf/Zero" },
  { source: "unpacker-b",    target: "exception",     type: "sync",   description: "Check for NaN/Inf/Zero" },
  
  // L3: Support to Arithmetic
  { source: "aligner",       target: "addition",      type: "sync",   description: "Aligned mantissas and exponent" },
  { source: "aligner",       target: "subtraction",   type: "sync",   description: "Aligned mantissas and exponent" },
  { source: "aligner",       target: "grs",           type: "sync",   description: "Guard, Round, Sticky bits" },
  { source: "grs",           target: "addition",      type: "sync",   description: "Rounding control" },
  { source: "grs",           target: "subtraction",   type: "sync",   description: "Rounding control" },
  
  // L3 → L4: Arithmetic to Selector
  { source: "addition",      target: "mux",           type: "sync",   description: "Addition result (9-bit mantissa, 8-bit exp)" },
  { source: "subtraction",   target: "mux",           type: "sync",   description: "Subtraction result (9-bit mantissa, 8-bit exp)" },
  { source: "multiplication",target: "mux",           type: "sync",   description: "Multiplication result (9-bit mantissa, 8-bit exp)" },
  { source: "exception",     target: "mux",           type: "sync",   description: "Exception flags (NaN/Inf/Zero)" },
  
  // L4 → L4: Selector to Normalizer
  { source: "mux",           target: "normalizer",    type: "sync",   description: "Selected operation result" },
  
  // L4 → L5: Normalizer to Output
  { source: "normalizer",    target: "display",       type: "sync",   description: "Normalized 16-bit BFloat16 result" },
  { source: "normalizer",    target: "led",           type: "sync",   description: "Status flags (sign, zero, inf/nan)" },
  
  // L5: Clock to Display
  { source: "clkdiv",        target: "display",       type: "stream", description: "1kHz refresh clock for multiplexing" },
];

export const bfloat16StoryWalkthrough: StoryStep[] = [
  {
    id: "input-loading",
    title: "Input Loading & Storage",
    description: "User loads two BFloat16 operands into parallel registers via button presses. Each register stores 16 bits: 1 sign + 8 exponent + 7 mantissa bits.",
    iconType: "database",
    activeNodes: ["pipo-a", "pipo-b"],
    activeDependencies: [],
    codeSnippet: {
      filename: "pipo.v",
      code: [
        { text: "// Parallel-In Parallel-Out Register", type: "comment" },
        { text: "always @(posedge clk or posedge rst) begin", highlight: true },
        { text: "  if (rst) q <= 16'b0;", type: "code" },
        { text: "  else if (load) q <= d;  // Latch on button press", highlight: true },
        { text: "end", type: "code" },
      ],
    },
    insight: "PIPO registers provide stable operand storage. Button debouncing is critical to prevent multiple loads from a single press. Consider adding synchronizers for metastability protection.",
  },
  {
    id: "unpacking-phase",
    title: "BFloat16 Unpacking",
    description: "Both operands are unpacked into sign, exponent, and mantissa components. The unpacker adds an implicit leading 1 for normalized numbers (exp ≠ 0).",
    iconType: "code",
    activeNodes: ["pipo-a", "pipo-b", "unpacker-a", "unpacker-b"],
    activeDependencies: [
      { source: "pipo-a", target: "unpacker-a" },
      { source: "pipo-b", target: "unpacker-b" },
    ],
    codeSnippet: {
      filename: "unpacker.v",
      code: [
        { text: "// Extract BFloat16 components", type: "comment" },
        { text: "assign sign = bfloat16_in[15];", highlight: true },
        { text: "assign exponent = bfloat16_in[14:7];", highlight: true },
        { text: "assign mantissa_raw = bfloat16_in[6:0];", type: "code" },
        { text: "// Add implicit leading 1 for normalized", type: "comment" },
        { text: "assign mantissa = (exponent != 0) ? {1'b1, mantissa_raw} : {1'b0, mantissa_raw};", highlight: true },
      ],
    },
    insight: "BFloat16 uses the same format as FP32's upper 16 bits, making it hardware-efficient. The implicit leading bit doubles mantissa precision without extra storage.",
  },
  {
    id: "alignment-flow",
    title: "Exponent Alignment",
    description: "For addition/subtraction, operands must have the same exponent. The aligner finds the larger exponent and shifts the smaller mantissa right by the difference.",
    iconType: "cpu",
    activeNodes: ["unpacker-a", "unpacker-b", "aligner", "grs", "addition", "subtraction"],
    activeDependencies: [
      { source: "unpacker-a", target: "aligner" },
      { source: "unpacker-b", target: "aligner" },
      { source: "aligner", target: "grs" },
      { source: "aligner", target: "addition" },
      { source: "aligner", target: "subtraction" },
      { source: "grs", target: "addition" },
    ],
    codeSnippet: {
      filename: "largenumberalongwithexpadjuster.v",
      code: [
        { text: "// Find exponent difference", type: "comment" },
        { text: "assign exp_diff = (exp_a > exp_b) ? (exp_a - exp_b) : (exp_b - exp_a);", highlight: true },
        { text: "// Shift smaller mantissa right", type: "comment" },
        { text: "if (exp_a > exp_b) begin", type: "code" },
        { text: "  mantissa_aligned_b = mantissa_b >> exp_diff;", highlight: true },
        { text: "  // Capture shifted-out bits for GRS", type: "comment" },
        { text: "  guard = mantissa_b[exp_diff-1];", highlight: true },
        { text: "end", type: "code" },
      ],
    },
    insight: "Alignment is the most critical step for addition/subtraction accuracy. Bits shifted out become Guard, Round, and Sticky bits for proper rounding. Without GRS, precision loss accumulates rapidly.",
  },
  {
    id: "parallel-arithmetic",
    title: "Parallel Arithmetic Execution",
    description: "All three operations (ADD, SUB, MUL) compute simultaneously in parallel. This dataflow architecture maximizes throughput at the cost of area.",
    iconType: "zap",
    activeNodes: ["addition", "subtraction", "multiplication", "exception"],
    activeDependencies: [
      { source: "aligner", target: "addition" },
      { source: "aligner", target: "subtraction" },
      { source: "unpacker-a", target: "multiplication" },
      { source: "unpacker-b", target: "multiplication" },
    ],
    codeSnippet: {
      filename: "multiplication.v",
      code: [
        { text: "// Multiplication: XOR signs, multiply mantissas", type: "comment" },
        { text: "assign result_sign = sign_a ^ sign_b;", highlight: true },
        { text: "assign mantissa_product = mantissa_a * mantissa_b;  // 8×8=16-bit", highlight: true },
        { text: "// Add exponents and subtract bias (127)", type: "comment" },
        { text: "assign result_exp = exp_a + exp_b - 8'd127;", highlight: true },
        { text: "// Take upper 9 bits of product", type: "comment" },
        { text: "assign result_mantissa = mantissa_product[15:7];", type: "code" },
      ],
    },
    insight: "⚠️ CRITICAL: Multiplication discards lower 7 bits without rounding, causing precision loss. Exponent addition lacks overflow/underflow checking—extreme values may produce incorrect results.",
  },
  {
    id: "operation-selection",
    title: "Operation Selection & Exception Handling",
    description: "A multiplexer selects the final result based on the 2-bit opcode. Exception cases (NaN, Infinity, Zero) override normal arithmetic results.",
    iconType: "network",
    activeNodes: ["addition", "subtraction", "multiplication", "exception", "mux"],
    activeDependencies: [
      { source: "addition", target: "mux" },
      { source: "subtraction", target: "mux" },
      { source: "multiplication", target: "mux" },
      { source: "exception", target: "mux" },
    ],
    codeSnippet: {
      filename: "mainmodule.v",
      code: [
        { text: "// Operation selection via opcode", type: "comment" },
        { text: "case (data_in[15:14])", highlight: true },
        { text: "  2'b01: selected_result = subtraction_result;", type: "code" },
        { text: "  2'b10: selected_result = addition_result;", type: "code" },
        { text: "  2'b11: selected_result = multiplication_result;", type: "code" },
        { text: "endcase", type: "code" },
        { text: "// Exception override", type: "comment" },
        { text: "if (is_nan || is_inf) selected_result = exception_value;", highlight: true },
      ],
    },
    insight: "Exception handling ensures IEEE 754 compliance. NaN propagates through operations, and Infinity follows standard rules (Inf + Inf = Inf, Inf × 0 = NaN).",
  },
  {
    id: "normalization-output",
    title: "Normalization & Display Output",
    description: "The normalizer shifts the mantissa to ensure a leading 1 and adjusts the exponent. The result is then converted to hexadecimal and displayed on 7-segment LEDs.",
    iconType: "shield",
    activeNodes: ["mux", "normalizer", "display", "led", "clkdiv"],
    activeDependencies: [
      { source: "mux", target: "normalizer" },
      { source: "normalizer", target: "display" },
      { source: "normalizer", target: "led" },
      { source: "clkdiv", target: "display" },
    ],
    codeSnippet: {
      filename: "normalizer.v",
      code: [
        { text: "// Normalize mantissa to have leading 1", type: "comment" },
        { text: "while (mantissa[8] == 0 && exponent > 0) begin", highlight: true },
        { text: "  mantissa = mantissa << 1;  // Shift left", type: "code" },
        { text: "  exponent = exponent - 1;   // Decrement exponent", type: "code" },
        { text: "end", type: "code" },
        { text: "// Pack result back to BFloat16", type: "comment" },
        { text: "assign result = {sign, exponent, mantissa[7:1]};", highlight: true },
      ],
    },
    insight: "⚠️ SYNTHESIS RISK: The while loop in combinational logic may not synthesize correctly. Consider replacing with a priority encoder for leading-one detection. Display multiplexing at 1kHz provides flicker-free output.",
  },
];

// Sample Impact Analysis Data
export const sampleImpactAnalyses: Record<string, ImpactAnalysis> = {
  "optimize-multiplication": {
    prompt: "Optimize multiplication pipeline for higher clock frequency",
    directlyAffected: ["multiplication"],
    downstreamImpacted: ["mux", "normalizer", "display"],
    severity: "medium",
    reasoning: "Pipelining the multiplication unit will increase throughput but requires register stages. This affects timing closure and downstream modules that depend on multiplication results.",
    propagationPaths: [
      {
        nodes: ["multiplication", "mux", "normalizer"],
        severity: "medium",
        reasoning: "Result timing changes propagate through selection and normalization",
        delay: 0
      },
      {
        nodes: ["normalizer", "display"],
        severity: "low",
        reasoning: "Display timing may need adjustment for new latency",
        delay: 200
      }
    ],
    riskZones: [
      {
        nodeId: "multiplication",
        risk: "Increased area and power consumption",
        mitigation: "Evaluate trade-offs between frequency and resource usage",
        severity: "medium"
      },
      {
        nodeId: "normalizer",
        risk: "Timing path may become critical",
        mitigation: "Add pipeline stage or optimize combinational logic",
        severity: "medium"
      }
    ],
    timestamp: new Date().toISOString()
  },
  "add-denormal-support": {
    prompt: "Add denormalized number support to normalizer",
    directlyAffected: ["normalizer"],
    downstreamImpacted: ["display", "led"],
    severity: "low",
    reasoning: "Adding denormal support requires additional logic in the normalizer to handle subnormal numbers correctly. Impact is localized to normalization and output stages.",
    propagationPaths: [
      {
        nodes: ["normalizer", "display"],
        severity: "low",
        reasoning: "Output format remains compatible",
        delay: 0
      }
    ],
    riskZones: [
      {
        nodeId: "normalizer",
        risk: "Increased combinational delay",
        mitigation: "Optimize critical path or add pipeline stage",
        severity: "low"
      }
    ],
    timestamp: new Date().toISOString()
  },
  "pipeline-arithmetic": {
    prompt: "Implement pipeline registers between arithmetic stages",
    directlyAffected: ["addition", "subtraction", "multiplication", "mux"],
    downstreamImpacted: ["normalizer", "display", "led", "unpacker-a", "unpacker-b"],
    severity: "high",
    reasoning: "Adding pipeline registers fundamentally changes the architecture from single-cycle to multi-cycle operation. This affects all downstream modules and requires careful timing analysis.",
    propagationPaths: [
      {
        nodes: ["addition", "mux", "normalizer", "display"],
        severity: "high",
        reasoning: "Multi-cycle latency affects entire datapath",
        delay: 0
      },
      {
        nodes: ["subtraction", "mux", "normalizer", "display"],
        severity: "high",
        reasoning: "Synchronization required across all paths",
        delay: 100
      },
      {
        nodes: ["multiplication", "mux", "normalizer", "display"],
        severity: "high",
        reasoning: "Longest path requires most pipeline stages",
        delay: 200
      }
    ],
    riskZones: [
      {
        nodeId: "mux",
        risk: "Operation selection timing becomes complex",
        mitigation: "Implement valid/ready handshaking protocol",
        severity: "high"
      },
      {
        nodeId: "normalizer",
        risk: "Pipeline bubble handling required",
        mitigation: "Add stall logic and flow control",
        severity: "high"
      },
      {
        nodeId: "display",
        risk: "Output timing synchronization needed",
        mitigation: "Add output FIFO or valid signal",
        severity: "medium"
      }
    ],
    timestamp: new Date().toISOString()
  },
  "replace-normalizer": {
    prompt: "Replace combinational normalizer with iterative design",
    directlyAffected: ["normalizer"],
    downstreamImpacted: ["display", "led", "mux"],
    severity: "critical",
    reasoning: "Replacing the combinational normalizer with an iterative (multi-cycle) design is a major architectural change. This breaks the single-cycle assumption and requires state machine control, affecting timing throughout the system.",
    propagationPaths: [
      {
        nodes: ["normalizer", "display"],
        severity: "critical",
        reasoning: "Display must handle variable-latency results",
        delay: 0
      },
      {
        nodes: ["mux", "normalizer"],
        severity: "critical",
        reasoning: "Selection logic needs ready/valid protocol",
        delay: 100
      }
    ],
    riskZones: [
      {
        nodeId: "normalizer",
        risk: "State machine complexity and verification burden",
        mitigation: "Formal verification of FSM, extensive testbench",
        severity: "critical"
      },
      {
        nodeId: "mux",
        risk: "Backpressure handling required",
        mitigation: "Implement full handshaking protocol",
        severity: "high"
      },
      {
        nodeId: "display",
        risk: "Output synchronization becomes complex",
        mitigation: "Add output buffer with valid signal",
        severity: "high"
      }
    ],
    timestamp: new Date().toISOString()
  }
};

// Made with Bob


// ─── BOB FINDINGS DATA ────────────────────────────────────

export const bobFindings: BobFinding[] = [
  {
    id: "finding-001",
    nodeId: "multiplication",
    category: "architecture",
    severity: "high",
    title: "Multiplication lacks rounding logic",
    description: "The multiplication unit discards lower 7 bits without proper rounding, causing precision loss in results.",
    reasoning: "IEEE 754 compliance requires proper rounding. Current implementation truncates instead of rounding, leading to accumulated errors in multi-operation calculations.",
    impact: "Precision loss of up to 0.5 ULP (Unit in Last Place). Critical for scientific computing applications.",
    detectedAt: new Date().toISOString(),
    remediation: {
      id: "rem-001",
      findingId: "finding-001",
      strategy: "Implement GRS (Guard, Round, Sticky) rounding for multiplication results",
      confidence: 85,
      estimatedEffort: "medium",
      patch: {
        filePath: "multiplication.v",
        language: "verilog",
        before: `assign result_mantissa = mantissa_product[15:7];`,
        after: `// Add GRS rounding logic
wire guard = mantissa_product[6];
wire round = mantissa_product[5];
wire sticky = |mantissa_product[4:0];
wire round_up = guard & (round | sticky | result_mantissa[0]);
assign result_mantissa = mantissa_product[15:7] + round_up;`,
        explanation: "Implements IEEE 754 round-to-nearest-even using Guard, Round, and Sticky bits from the discarded lower bits.",
        lineStart: 42,
        lineEnd: 42
      },
      architecturalChanges: [
        "Add 3-bit GRS logic to multiplication unit",
        "Increase mantissa width temporarily for rounding",
        "Handle overflow from rounding operation"
      ],
      risks: [
        "Slight increase in combinational delay (~5%)",
        "Additional logic area (~50 LUTs)"
      ]
    }
  },
  {
    id: "finding-002",
    nodeId: "normalizer",
    category: "complexity",
    severity: "critical",
    title: "Combinational while loop synthesis risk",
    description: "The normalizer uses a while loop in combinational logic, which may not synthesize correctly or could create timing violations.",
    reasoning: "While loops in combinational Verilog are synthesis-dependent and often result in large combinational paths or synthesis failures. Priority encoders are the standard solution.",
    impact: "Synthesis failure or critical timing paths. May not meet timing closure at target frequency.",
    detectedAt: new Date().toISOString(),
    remediation: {
      id: "rem-002",
      findingId: "finding-002",
      strategy: "Replace while loop with priority encoder for leading-one detection",
      confidence: 95,
      estimatedEffort: "medium",
      patch: {
        filePath: "normalizer.v",
        language: "verilog",
        before: `while (mantissa[8] == 0 && exponent > 0) begin
  mantissa = mantissa << 1;
  exponent = exponent - 1;
end`,
        after: `// Priority encoder for leading-one detection
wire [3:0] leading_zeros;
priority_encoder pe (
  .mantissa(mantissa),
  .leading_zeros(leading_zeros)
);
assign normalized_mantissa = mantissa << leading_zeros;
assign normalized_exponent = exponent - leading_zeros;`,
        explanation: "Uses a priority encoder to detect leading zeros in one clock cycle, eliminating the iterative loop and ensuring predictable synthesis.",
        lineStart: 28,
        lineEnd: 31
      },
      architecturalChanges: [
        "Add priority_encoder module",
        "Replace iterative normalization with parallel detection",
        "Add underflow detection logic"
      ],
      risks: [
        "Requires new priority encoder module",
        "Slightly increased area for parallel logic"
      ]
    }
  },
  {
    id: "finding-003",
    nodeId: "aligner",
    category: "security",
    severity: "medium",
    title: "Potential shift overflow vulnerability",
    description: "The exponent aligner doesn't validate shift amounts, potentially causing undefined behavior with extreme exponent differences.",
    reasoning: "When exp_diff exceeds mantissa width, the shift operation behavior is undefined in Verilog. This could lead to incorrect results or security vulnerabilities.",
    impact: "Undefined behavior with extreme inputs. Potential for exploitation in security-critical applications.",
    detectedAt: new Date().toISOString(),
    remediation: {
      id: "rem-003",
      findingId: "finding-003",
      strategy: "Add shift amount validation and saturation logic",
      confidence: 90,
      estimatedEffort: "low",
      patch: {
        filePath: "largenumberalongwithexpadjuster.v",
        language: "verilog",
        before: `mantissa_aligned_b = mantissa_b >> exp_diff;`,
        after: `// Saturate shift amount to mantissa width
wire [7:0] safe_shift = (exp_diff > 8'd8) ? 8'd8 : exp_diff;
mantissa_aligned_b = mantissa_b >> safe_shift;
// Set sticky bit if shift saturated
sticky = sticky | (exp_diff > 8'd8);`,
        explanation: "Limits shift amount to mantissa width and sets sticky bit for overflow, ensuring defined behavior and IEEE 754 compliance.",
        lineStart: 15,
        lineEnd: 15
      },
      architecturalChanges: [
        "Add shift saturation logic",
        "Enhance sticky bit calculation"
      ],
      risks: [
        "Minimal - improves robustness"
      ]
    }
  },
  {
    id: "finding-004",
    nodeId: "exception",
    category: "governance",
    severity: "low",
    title: "Incomplete NaN propagation",
    description: "Exception handler doesn't properly propagate NaN through all operation types, violating IEEE 754 standard.",
    reasoning: "IEEE 754 requires NaN to propagate through all operations. Current implementation may lose NaN status in certain edge cases.",
    impact: "Non-compliant behavior with NaN inputs. May cause incorrect results in numerical algorithms.",
    detectedAt: new Date().toISOString()
  },
  {
    id: "finding-005",
    nodeId: "unpacker-a",
    category: "dependency",
    severity: "medium",
    title: "Denormal number handling incomplete",
    description: "Unpacker doesn't fully handle denormalized (subnormal) numbers according to IEEE 754 specification.",
    reasoning: "When exponent is zero, the implicit leading bit should be 0, but gradual underflow handling is incomplete.",
    impact: "Incorrect results for very small numbers near zero. Affects numerical stability.",
    detectedAt: new Date().toISOString()
  },
  {
    id: "finding-006",
    nodeId: "mux",
    category: "architecture",
    severity: "high",
    title: "No pipeline hazard detection",
    description: "Operation selector lacks hazard detection for potential future pipelining, creating technical debt.",
    reasoning: "If the design is later pipelined, the current MUX structure will require significant rework. Adding hazard detection now prevents future refactoring.",
    impact: "Blocks future performance optimizations. Increases refactoring cost.",
    detectedAt: new Date().toISOString()
  }
];

// ─── GOVERNANCE VIOLATIONS ────────────────────────────────

export const governanceViolations: GovernanceViolation[] = [
  {
    id: "gov-001",
    type: "dependency",
    severity: "high",
    affectedNodes: ["unpacker-a", "unpacker-b", "multiplication"],
    affectedDependencies: [
      { source: "unpacker-a", target: "multiplication" },
      { source: "unpacker-b", target: "multiplication" }
    ],
    description: "Multiplication unit bypasses alignment stage, violating dataflow architecture constraints",
    constraint: "All arithmetic operations must receive aligned operands from the aligner module",
    recommendation: "Route multiplication inputs through aligner or add explicit alignment bypass documentation"
  },
  {
    id: "gov-002",
    type: "architecture",
    severity: "critical",
    affectedNodes: ["normalizer", "display"],
    affectedDependencies: [
      { source: "normalizer", target: "display" }
    ],
    description: "Combinational path from normalizer to display exceeds timing budget",
    constraint: "Maximum combinational delay: 15ns. Current path: 22ns",
    recommendation: "Add pipeline register between normalizer and display modules"
  },
  {
    id: "gov-003",
    type: "coupling",
    severity: "medium",
    affectedNodes: ["grs", "addition", "subtraction"],
    affectedDependencies: [
      { source: "grs", target: "addition" },
      { source: "grs", target: "subtraction" }
    ],
    description: "GRS rounding module tightly coupled to arithmetic units, reducing modularity",
    constraint: "Support modules should use standardized interfaces",
    recommendation: "Implement standard rounding interface to decouple GRS from arithmetic units"
  },
  {
    id: "gov-004",
    type: "security",
    severity: "high",
    affectedNodes: ["pipo-a", "pipo-b"],
    affectedDependencies: [],
    description: "Input registers lack metastability protection for asynchronous button inputs",
    constraint: "All asynchronous inputs must use double-synchronizer chains",
    recommendation: "Add two-stage synchronizer before PIPO registers"
  }
];

// ─── ARCHITECTURAL DRIFT ──────────────────────────────────

export const architecturalDrift: ArchitecturalDrift[] = [
  {
    id: "drift-001",
    driftType: "layering",
    severity: "medium",
    nodes: ["unpacker-a", "unpacker-b", "exception"],
    description: "Exception detection logic split between unpacking and arithmetic layers",
    expectedPattern: "Exception detection should be centralized in Layer 3 (Arithmetic Core)",
    actualPattern: "Exception checks scattered across Layer 2 (Unpacking) and Layer 3",
    stabilizationPath: ["unpacker-a", "unpacker-b", "exception"]
  },
  {
    id: "drift-002",
    driftType: "dependency",
    severity: "high",
    nodes: ["multiplication", "mux", "normalizer"],
    description: "Multiplication result bypasses standard normalization path in certain cases",
    expectedPattern: "All arithmetic results flow through normalizer before output",
    actualPattern: "Multiplication has conditional bypass to MUX",
    stabilizationPath: ["multiplication", "normalizer", "mux"]
  },
  {
    id: "drift-003",
    driftType: "complexity",
    severity: "critical",
    nodes: ["normalizer"],
    description: "Normalizer complexity exceeds architectural guidelines (>500 lines, cyclomatic complexity: 15)",
    expectedPattern: "Modules should be <300 lines with cyclomatic complexity <10",
    actualPattern: "Normalizer: 547 lines, complexity: 15",
    stabilizationPath: ["normalizer"]
  }
];

// Made with Bob
