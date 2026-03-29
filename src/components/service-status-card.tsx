import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServiceInfo } from "@/lib/docker";

const stateConfig: Record<
  string,
  { label: string; className: string }
> = {
  running: {
    label: "Running",
    className: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20",
  },
  exited: {
    label: "Exited",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  },
  dead: {
    label: "Dead",
    className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  },
  paused: {
    label: "Paused",
    className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  restarting: {
    label: "Restarting",
    className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  created: {
    label: "Created",
    className: "bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border-neutral-500/20",
  },
  removing: {
    label: "Removing",
    className: "bg-neutral-500/15 text-neutral-600 dark:text-neutral-400 border-neutral-500/20",
  },
};

function StateBadge({ state }: { state: string }) {
  const config = stateConfig[state] ?? {
    label: state,
    className: "bg-neutral-500/15 text-neutral-600 border-neutral-500/20",
  };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function ServiceStatusCard({ service }: { service: ServiceInfo }) {
  const hasStats = service.cpuPercent !== undefined;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-medium">
            {service.service}
          </CardTitle>
          <StateBadge state={service.state} />
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-1">
        <p>{service.status}</p>
        <p className="truncate font-mono text-xs">{service.image}</p>
        {hasStats && (
          <div className="flex gap-4 pt-1 text-xs font-mono">
            <span>CPU {service.cpuPercent!.toFixed(1)}%</span>
            <span>
              MEM {formatBytes(service.memUsageBytes!)}
              {service.memLimitBytes ? ` / ${formatBytes(service.memLimitBytes)}` : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
