"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServiceStatusCard } from "@/components/service-status-card";
import type { ProjectGroup } from "@/lib/docker";

const POLL_INTERVAL = 10_000;

export default function Home() {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const fetchContainers = useCallback(async () => {
    try {
      const res = await fetch("/api/containers");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unknown error");
        return;
      }
      setGroups(data.groups);
      setError(null);
      setUpdatedAt(new Date());
    } catch {
      setError("Could not reach the server.");
    }
  }, []);

  useEffect(() => {
    fetchContainers();
    const id = setInterval(fetchContainers, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchContainers]);

  return (
    <main className="mx-auto max-w-4xl w-full px-4 py-10 space-y-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Status</h1>
        {updatedAt && (
          <p className="text-xs text-muted-foreground">
            Updated {updatedAt.toLocaleTimeString()}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Docker unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!error && groups.length === 0 && updatedAt && (
        <p className="text-sm text-muted-foreground">
          No Docker Compose services found.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.project} className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {group.project}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.services.map((svc) => (
              <ServiceStatusCard key={svc.containerName} service={svc} />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
