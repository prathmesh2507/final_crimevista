import React from "react";
import { LoaderCircleIcon, PlugIcon } from "lucide-react";
import { API_BASE_URL, API_TIMEOUT_MS } from "../api/config";
import { ENDPOINT_REGISTRY, type EndpointSpec } from "../api/endpoints";
import { DataTable, type Column } from "../components/common/DataTable";
import { ErrorState } from "../components/common/ErrorState";
import { PageHeader } from "../components/common/PageHeader";
import { useSystemStatus } from "../hooks/useSystemStatus";
import { cn } from "../utils/cn";
import { formatDateTime } from "../utils/formatters";

const COLUMNS: Column<EndpointSpec>[] = [
  {
    key: "method",
    header: "Method",
    render: (e) => (
      <span
        className={cn(
          "font-mono text-xs font-semibold",
          e.method === "GET" ? "text-analytics" : "text-alert",
        )}
      >
        {e.method}
      </span>
    ),
  },
  {
    key: "path",
    header: "Path",
    render: (e) => <code className="font-mono text-xs text-fg">{e.path}</code>,
  },
  { key: "purpose", header: "Purpose", render: (e) => e.purpose },
  {
    key: "replaces",
    header: "Streamlit equivalent",
    render: (e) => (
      <span className="font-mono text-xs text-muted">{e.replaces}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: () => (
      <span className="whitespace-nowrap rounded-md bg-positive-soft px-2 py-0.5 text-xs font-medium text-positive">
        Available
      </span>
    ),
  },
];

export function Settings() {
  const health = useSystemStatus();

  const rows: Array<[string, React.ReactNode]> = [
    [
      "API base URL",
      <code key="u" className="break-all font-mono text-xs">
        {API_BASE_URL}
      </code>,
    ],
    ["Request timeout", `${API_TIMEOUT_MS / 1000}s`],
    [
      "Data source",
      <span key="b" className="font-medium text-positive">
        Backend API
      </span>,
    ],
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Backend connection and API contract overview."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <h2 className="text-base font-semibold text-fg">Connection</h2>
          <dl className="mt-3 divide-y divide-line text-sm">
            {rows.map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 py-2.5"
              >
                <dt className="shrink-0 text-muted">{label}</dt>
                <dd className="text-right text-fg">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs text-muted">
            Configure the backend address with{" "}
            <code className="font-mono">VITE_API_BASE_URL</code> in your{" "}
            <code className="font-mono">.env</code> file.
          </p>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-fg">Backend health</h2>
            <button
              type="button"
              onClick={() => health.refetch()}
              disabled={health.isFetching}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-fg transition-colors duration-150 hover:bg-canvas disabled:opacity-60"
            >
              {health.isFetching ? (
                <LoaderCircleIcon
                  className="h-4 w-4 animate-spin"
                  aria-hidden
                />
              ) : (
                <PlugIcon className="h-4 w-4" aria-hidden />
              )}
              Test connection
            </button>
          </div>
          <div className="mt-3">
            {health.isError ? (
              <ErrorState
                compact
                error={health.error}
                title="Health check failed"
              />
            ) : health.data ? (
              <dl className="divide-y divide-line text-sm">
                {(
                  [
                    [
                      "Status",
                      <span key="s" className="capitalize">
                        {health.data.status}
                      </span>,
                    ],
                    [
                      "Database ready",
                      health.data.databaseReady ? "Yes" : "No",
                    ],
                    [
                      "Data mode",
                      health.data.demoMode ? "Demo data" : "Live data",
                    ],
                    ["Last updated", formatDateTime(health.data.lastUpdated)],
                    ["Version", health.data.version ?? "—"],
                  ] as Array<[string, React.ReactNode]>
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 py-2.5"
                  >
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-fg">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="py-6 text-sm text-muted">Checking…</p>
            )}
          </div>
        </section>
      </div>

      <section aria-labelledby="endpoints-heading" className="space-y-3">
        <div>
          <h2
            id="endpoints-heading"
            className="text-base font-semibold text-fg"
          >
            Endpoint registry
          </h2>
          <p className="text-xs text-muted">
            Endpoints used by the connected CrimeVista backend.
          </p>
        </div>
        <DataTable
          caption="API endpoint registry"
          columns={COLUMNS}
          rows={ENDPOINT_REGISTRY}
          rowKey={(e) => `${e.method} ${e.path}`}
        />
      </section>
    </div>
  );
}
