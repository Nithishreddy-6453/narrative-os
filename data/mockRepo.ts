export interface ArchitectureNode {
  id: string;
  label: string;
  type: "client" | "gateway" | "core" | "service" | "database" | "infrastructure";
  layer: number;
  /** Normalized 0-1 position within the canvas */
  nx: number;
  ny: number;
  description: string;
  criticality: "low" | "medium" | "high" | "critical";
  technologies: string[];
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
// L1  Client / Edge         y ≈ 0.08
// L2  Gateway / Auth        y ≈ 0.27
// L3  Core Orchestration    y ≈ 0.50  (center of gravity)
// L4  Microservices         y ≈ 0.72
// L5  Persistence           y ≈ 0.90

export const mockNodes: ArchitectureNode[] = [
  // ── Layer 1: Client ──
  { id: "client",        label: "Web Client",        type: "client",         layer: 1, nx: 0.50, ny: 0.08, description: "Next.js frontend application with SSR and client routing.", criticality: "high",     technologies: ["React", "Next.js", "TypeScript"] },

  // ── Layer 2: Gateway / Edge ──
  { id: "edge-auth",     label: "Edge Auth",         type: "service",        layer: 2, nx: 0.25, ny: 0.27, description: "JWT validation running in Edge middleware for zero-latency auth.", criticality: "high",     technologies: ["JWT", "Edge Runtime"] },
  { id: "gateway",       label: "API Gateway",       type: "gateway",        layer: 2, nx: 0.58, ny: 0.27, description: "Central entry point handling rate limiting, routing, and request validation.", criticality: "critical", technologies: ["Nginx", "Node.js", "GraphQL"] },

  // ── Layer 3: Core ──
  { id: "core",          label: "Runtime Engine",    type: "core",           layer: 3, nx: 0.50, ny: 0.50, description: "Central orchestration engine. Manages system state, event bus, and service coordination.", criticality: "critical", technologies: ["Go", "gRPC", "Protobuf"] },

  // ── Layer 4: Microservices ──
  { id: "service-user",  label: "User Service",      type: "service",        layer: 4, nx: 0.25, ny: 0.72, description: "Handles user profiles, permissions, and authentication state.", criticality: "high",     technologies: ["Node.js", "Express", "Prisma"] },
  { id: "service-data",  label: "Data Pipeline",     type: "service",        layer: 4, nx: 0.75, ny: 0.72, description: "Asynchronous data ingestion, transformation, and analytics pipeline.", criticality: "medium",   technologies: ["Python", "Kafka", "Spark"] },

  // ── Layer 5: Persistence ──
  { id: "db-primary",    label: "Primary Database",  type: "database",       layer: 5, nx: 0.35, ny: 0.90, description: "PostgreSQL — source of truth for all transactional data.", criticality: "critical", technologies: ["PostgreSQL", "pgBouncer"] },
  { id: "cache",         label: "Redis Cluster",     type: "infrastructure", layer: 5, nx: 0.65, ny: 0.90, description: "In-memory caching and pub/sub layer for real-time state.", criticality: "medium",   technologies: ["Redis", "Sentinel"] },
];

export const layerLabels = [
  { layer: 1, label: "Client / Edge",        ny: 0.08 },
  { layer: 2, label: "Gateway",              ny: 0.27 },
  { layer: 3, label: "Orchestration Core",   ny: 0.50 },
  { layer: 4, label: "Microservices",        ny: 0.72 },
  { layer: 5, label: "Persistence",          ny: 0.90 },
];

export const mockDependencies: Dependency[] = [
  // L1 → L2
  { source: "client",       target: "gateway",      type: "sync",   description: "REST / GraphQL requests" },
  { source: "client",       target: "edge-auth",    type: "async",  description: "Session validation at edge" },
  // L2 → L2
  { source: "edge-auth",    target: "gateway",      type: "sync",   description: "Passes authenticated context" },
  // L2 → L3
  { source: "gateway",      target: "core",         type: "sync",   description: "Routes validated requests to core" },
  // L3 → L4
  { source: "core",         target: "service-user", type: "sync",   description: "User data requests" },
  { source: "core",         target: "service-data", type: "stream", description: "Emits events to pipeline" },
  // L3 → L5
  { source: "core",         target: "cache",        type: "async",  description: "High-speed state lookups" },
  // L4 → L5
  { source: "service-user", target: "db-primary",   type: "async",  description: "Reads / writes user data" },
  { source: "service-user", target: "cache",        type: "async",  description: "Session caching" },
  { source: "service-data", target: "db-primary",   type: "async",  description: "Batch analytics writes" },
];

export const mockStoryWalkthrough: StoryStep[] = [
  {
    id: "auth-flow",
    title: "Authentication Flow",
    description: "Tracing the path from user login through JWT validation at the edge, through the gateway, to the User Service.",
    iconType: "shield",
    activeNodes: ["client", "edge-auth", "gateway", "core", "service-user", "db-primary"],
    activeDependencies: [
      { source: "client", target: "edge-auth" },
      { source: "edge-auth", target: "gateway" },
      { source: "gateway", target: "core" },
      { source: "core", target: "service-user" },
      { source: "service-user", target: "db-primary" },
    ],
    codeSnippet: {
      filename: "middleware.ts",
      code: [
        { text: "// 1. Intercept request in Edge runtime", type: "comment" },
        { text: "const token = request.cookies.get('session');", highlight: true },
        { text: "// 2. Validate token against Auth Service", type: "comment" },
        { text: "const user = await verifyJwt(token);", highlight: true },
        { text: "if (!user) return redirect('/login');", type: "code" },
      ],
    },
    insight: "JWT verification is isolated at the edge, reducing Core Engine load by 40%. However, cache latency between Auth and Redis could bottleneck under heavy concurrent logins.",
  },
  {
    id: "data-pipeline",
    title: "Event Data Pipeline",
    description: "How the core engine streams events into the data pipeline without blocking the request lifecycle.",
    iconType: "network",
    activeNodes: ["core", "service-data", "db-primary"],
    activeDependencies: [
      { source: "core", target: "service-data" },
      { source: "service-data", target: "db-primary" },
    ],
    codeSnippet: {
      filename: "events.go",
      code: [
        { text: "// Publish event to Kafka asynchronously", type: "comment" },
        { text: "go func() {", highlight: true },
        { text: "  err := eventBus.Publish(ctx, topic, payload)", type: "code" },
        { text: "  if err != nil { log.Error(err) }", type: "code" },
        { text: "}()", highlight: true },
        { text: "return Response{Status: 202}", type: "code" },
      ],
    },
    insight: "Event streaming keeps Core Engine throughput high. The Data Pipeline buffers events, but prolonged DB write latency could cause backpressure on the Kafka consumer group.",
  },
  {
    id: "cache-layer",
    title: "Caching Architecture",
    description: "Understanding how the User Service and Core Engine share session state via the Redis Cluster.",
    iconType: "zap",
    activeNodes: ["core", "service-user", "cache"],
    activeDependencies: [
      { source: "core", target: "cache" },
      { source: "service-user", target: "cache" },
    ],
    codeSnippet: {
      filename: "state.service.ts",
      code: [
        { text: "// Attempt to read from high-speed cluster", type: "comment" },
        { text: "let state = await redisCluster.get(key);", highlight: true },
        { text: "if (!state) {", type: "code" },
        { text: "  // Cache miss → fallback to primary DB", type: "comment" },
        { text: "  state = await fetchFromUserService(key);", type: "code" },
        { text: "  await redisCluster.set(key, state, { ex: 300 });", highlight: true },
        { text: "}", type: "code" },
      ],
    },
    insight: "Shared cache state prevents duplicate DB queries. Hit rate is 92%, but cache invalidation relies on TTLs rather than event-driven purges — a latent consistency risk.",
  },
];
