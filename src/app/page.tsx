import { Box, Cpu, ExternalLink, HardDrive } from "lucide-react";
import { headers } from "next/headers";
import { Suspense } from "react";

import { getComposeGroups, fetchStats, type ContainerState, type ServiceInfo } from "@/lib/docker";

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const STATE_STYLES: Record<ContainerState, { dot: string; badge: string; label: string }> = {
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

async function StatsDisplay({ containerId }: { containerId: string }) {
  const stats = await fetchStats(containerId);
  if (!stats) return null;

  return (
    <div className="text-muted-foreground flex gap-4 text-xs">
      <span className="flex items-center gap-1">
        <Cpu className="size-3" />
        {stats.cpuPercent.toFixed(1)}%
      </span>
      <span className="flex items-center gap-1">
        <HardDrive className="size-3" />
        {formatBytes(stats.memUsageBytes)} / {formatBytes(stats.memLimitBytes)}
      </span>
    </div>
  );
}

function ServiceCard({ service, href }: { service: ServiceInfo; href?: string }) {
  const state = STATE_STYLES[service.state] ?? STATE_STYLES.created;

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{service.service}</p>
          <p className="text-muted-foreground mt-0.5 truncate text-xs">{service.containerName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${state.badge}`}
          >
            <span className={`size-1.5 rounded-full ${state.dot}`} />
            {state.label}
          </span>
          {href && <ExternalLink className="text-muted-foreground size-3" />}
        </div>
      </div>

      <p className="text-muted-foreground truncate text-xs">{service.image}</p>

      <Suspense
        fallback={
          <div className="flex gap-4">
            <span className="bg-muted h-3 w-12 animate-pulse rounded" />
            <span className="bg-muted h-3 w-28 animate-pulse rounded" />
          </div>
        }
      >
        <StatsDisplay containerId={service.containerId} />
      </Suspense>

      <p className="text-muted-foreground text-xs">{service.status}</p>
    </>
  );

  const cardClass = "flex flex-col gap-3 rounded-lg border border-border bg-card p-4";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${cardClass} hover:border-border/80 hover:bg-card/80 transition-colors`}
      >
        {inner}
      </a>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}

export default async function Home() {
  const [groups, headersList] = await Promise.all([getComposeGroups(), headers()]);

  const host = headersList.get("host") ?? "localhost";
  const hostname = host.split(":")[0];
  const proto = headersList.get("x-forwarded-proto") ?? "http";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Status</h1>
        <p className="text-muted-foreground text-xs">
          Updated at {new Date().toLocaleTimeString()}
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-24">
          <Box className="size-8 opacity-40" />
          <p className="text-sm">No Docker Compose projects found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.project}>
              <div className="mb-4 flex items-center gap-2">
                <h2 className="text-sm font-medium">{group.project}</h2>
                <span className="text-muted-foreground text-xs">
                  {group.services.length} service
                  {group.services.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.services.map((service) => {
                  const href = service.port ? `${proto}://${hostname}:${service.port}` : undefined;
                  return <ServiceCard key={service.containerName} service={service} href={href} />;
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
