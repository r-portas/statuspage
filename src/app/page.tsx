import { Box, Cpu, HardDrive } from "lucide-react";

import { getComposeGroups, type ContainerState, type ServiceInfo } from "@/lib/docker";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const STATE_STYLES: Record<
  ContainerState,
  { dot: string; badge: string; label: string }
> = {
  running: {
    dot: "bg-green-500",
    badge: "border-green-500/20 bg-green-500/10 text-green-400",
    label: "Running",
  },
  exited: {
    dot: "bg-red-500",
    badge: "border-red-500/20 bg-red-500/10 text-red-400",
    label: "Exited",
  },
  paused: {
    dot: "bg-yellow-500",
    badge: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    label: "Paused",
  },
  restarting: {
    dot: "bg-blue-400",
    badge: "border-blue-400/20 bg-blue-400/10 text-blue-400",
    label: "Restarting",
  },
  dead: {
    dot: "bg-red-600",
    badge: "border-red-600/20 bg-red-600/10 text-red-500",
    label: "Dead",
  },
  created: {
    dot: "bg-muted-foreground",
    badge: "border-border bg-muted text-muted-foreground",
    label: "Created",
  },
  removing: {
    dot: "bg-orange-500",
    badge: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    label: "Removing",
  },
};

function ServiceCard({ service }: { service: ServiceInfo }) {
  const state = STATE_STYLES[service.state] ?? STATE_STYLES.created;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{service.service}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {service.containerName}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${state.badge}`}
        >
          <span className={`size-1.5 rounded-full ${state.dot}`} />
          {state.label}
        </span>
      </div>

      <p className="truncate text-xs text-muted-foreground">{service.image}</p>

      {(service.cpuPercent !== undefined || service.memUsageBytes !== undefined) && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          {service.cpuPercent !== undefined && (
            <span className="flex items-center gap-1">
              <Cpu className="size-3" />
              {service.cpuPercent.toFixed(1)}%
            </span>
          )}
          {service.memUsageBytes !== undefined && service.memLimitBytes !== undefined && (
            <span className="flex items-center gap-1">
              <HardDrive className="size-3" />
              {formatBytes(service.memUsageBytes)} / {formatBytes(service.memLimitBytes)}
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{service.status}</p>
    </div>
  );
}

export default async function Home() {
  const groups = await getComposeGroups();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Status</h1>
        <p className="text-xs text-muted-foreground">
          Updated at {new Date().toLocaleTimeString()}
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
          <Box className="size-8 opacity-40" />
          <p className="text-sm">No Docker Compose projects found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.project}>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-sm font-medium">{group.project}</h2>
                <span className="text-xs text-muted-foreground">
                  {group.services.length} service
                  {group.services.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.services.map((service) => (
                  <ServiceCard key={service.containerName} service={service} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
