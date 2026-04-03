import { z } from "zod";

const SOCKET = "/var/run/docker.sock";

export type ContainerState =
  | "running"
  | "exited"
  | "paused"
  | "restarting"
  | "dead"
  | "created"
  | "removing";

export type ServiceStats = {
  cpuPercent: number;
  memUsageBytes: number;
  memLimitBytes: number;
};

export type ServiceInfo = {
  service: string;
  containerId: string;
  containerName: string;
  state: ContainerState;
  status: string;
  image: string;
  port?: number;
};

export type ProjectGroup = {
  project: string;
  services: ServiceInfo[];
};

// #region Zod schemas

const ContainerSchema = z.object({
  Id: z.string(),
  Names: z.array(z.string()),
  Image: z.string(),
  State: z.string(),
  Status: z.string(),
  Labels: z.record(z.string(), z.string()).default({}),
});

const ContainerListSchema = z.array(ContainerSchema);

const StatsSchema = z.object({
  cpu_stats: z.object({
    cpu_usage: z.object({
      total_usage: z.number(),
      percpu_usage: z.array(z.number()).optional(),
    }),
    system_cpu_usage: z.number(),
    online_cpus: z.number().optional(),
  }),
  precpu_stats: z.object({
    cpu_usage: z.object({
      total_usage: z.number(),
    }),
    system_cpu_usage: z.number(),
  }),
  memory_stats: z.object({
    usage: z.number(),
    limit: z.number(),
    stats: z.object({ cache: z.number().optional(), inactive_file: z.number().optional() }).optional(),
  }),
});

// #endregion

// #region Docker API helpers

async function dockerFetch(path: string): Promise<unknown> {
  const res = await fetch(`http://localhost${path}`, { unix: SOCKET } as RequestInit);
  if (!res.ok) throw new Error(`Docker API ${path} → ${res.status}`);
  return res.json();
}

export async function fetchStats(
  containerId: string,
): Promise<{ cpuPercent: number; memUsageBytes: number; memLimitBytes: number } | null> {
  try {
    const raw = await dockerFetch(`/containers/${containerId}/stats?stream=false`);
    const stats = StatsSchema.parse(raw);

    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const numCpus =
      stats.cpu_stats.online_cpus ?? stats.cpu_stats.cpu_usage.percpu_usage?.length ?? 1;
    const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * numCpus * 100 : 0;

    const cache = stats.memory_stats.stats?.cache ?? stats.memory_stats.stats?.inactive_file ?? 0;
    const memUsageBytes = stats.memory_stats.usage - cache;
    const memLimitBytes = stats.memory_stats.limit;

    return { cpuPercent, memUsageBytes, memLimitBytes };
  } catch (e) {
    console.error(`fetchStats(${containerId.slice(0, 12)}):`, e);
    return null;
  }
}

// #endregion

// #region Public API

export async function getComposeGroups(): Promise<ProjectGroup[]> {
  const raw = await dockerFetch("/containers/json");
  const containers = ContainerListSchema.parse(raw);

  const composeContainers = containers.filter(
    (c) => c.Labels["com.docker.compose.project"] !== undefined,
  );

  const groups = new Map<string, ServiceInfo[]>();

  for (const c of composeContainers) {
    const project = c.Labels["com.docker.compose.project"]!;
    const service = c.Labels["com.docker.compose.service"] ?? c.Names[0]?.replace("/", "");
    const containerName = c.Names[0]?.replace("/", "") ?? c.Id.slice(0, 12);

    const hrefLabel = c.Labels["homepage.href"];
    const port = hrefLabel ? Number(/(\d+)$/.exec(hrefLabel)?.[1]) || undefined : undefined;

    const info: ServiceInfo = {
      service,
      containerId: c.Id,
      containerName,
      state: c.State as ContainerState,
      status: c.Status,
      image: c.Image,
      port,
    };

    const existing = groups.get(project) ?? [];
    existing.push(info);
    groups.set(project, existing);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([project, services]) => ({
      project,
      services: services.sort((a, b) => a.service.localeCompare(b.service)),
    }));
}
// #endregion
