import Docker from "dockerode";

export type ContainerState =
  | "running"
  | "exited"
  | "paused"
  | "restarting"
  | "dead"
  | "created"
  | "removing";

export type ServiceInfo = {
  service: string;
  containerName: string;
  state: ContainerState;
  status: string;
  image: string;
  cpuPercent?: number;
  memUsageBytes?: number;
  memLimitBytes?: number;
  port?: number;
};

export type ProjectGroup = {
  project: string;
  services: ServiceInfo[];
};

const docker = new Docker();

async function fetchStats(
  containerId: string,
): Promise<{ cpuPercent: number; memUsageBytes: number; memLimitBytes: number } | null> {
  try {
    const container = docker.getContainer(containerId);
    const stats = await container.stats({ stream: false });

    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const numCpus =
      stats.cpu_stats.online_cpus ?? stats.cpu_stats.cpu_usage.percpu_usage?.length ?? 1;
    const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * numCpus * 100 : 0;

    const memUsageBytes = stats.memory_stats.usage - (stats.memory_stats.stats?.cache ?? 0);
    const memLimitBytes = stats.memory_stats.limit;

    return { cpuPercent, memUsageBytes, memLimitBytes };
  } catch {
    return null;
  }
}

export async function getComposeGroups(): Promise<ProjectGroup[]> {
  const containers = await docker.listContainers();

  const groups = new Map<string, ServiceInfo[]>();

  const statsResults = await Promise.all(containers.map((c) => fetchStats(c.Id)));

  for (let i = 0; i < containers.length; i++) {
    const c = containers[i];
    const labels = c.Labels ?? {};
    const project = labels["com.docker.compose.project"];
    if (!project) continue;

    const service = labels["com.docker.compose.service"] ?? c.Names[0]?.replace("/", "");
    const containerName = c.Names[0]?.replace("/", "") ?? c.Id.slice(0, 12);
    const usage = statsResults[i];

    const hrefLabel = labels["homepage.href"];
    const port = hrefLabel ? Number(/(\d+)$/.exec(hrefLabel)?.[1]) || undefined : undefined;

    const info: ServiceInfo = {
      service,
      containerName,
      state: c.State as ContainerState,
      status: c.Status,
      image: c.Image,
      ...(usage ?? {}),
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
