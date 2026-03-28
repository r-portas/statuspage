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
};

export type ProjectGroup = {
  project: string;
  services: ServiceInfo[];
};

const docker = new Docker();

export async function getComposeGroups(): Promise<ProjectGroup[]> {
  const containers = await docker.listContainers({ all: true });

  const groups = new Map<string, ServiceInfo[]>();

  for (const c of containers) {
    const labels = c.Labels ?? {};
    const project = labels["com.docker.compose.project"];
    if (!project) continue;

    const service =
      labels["com.docker.compose.service"] ?? c.Names[0]?.replace("/", "");
    const containerName = c.Names[0]?.replace("/", "") ?? c.Id.slice(0, 12);

    const info: ServiceInfo = {
      service,
      containerName,
      state: c.State as ContainerState,
      status: c.Status,
      image: c.Image,
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
