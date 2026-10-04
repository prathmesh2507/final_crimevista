import React, { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon, LoaderCircleIcon, PlugIcon, ShieldAlertIcon, Trash2Icon } from "lucide-react";
import { API_BASE_URL, API_TIMEOUT_MS } from "../api/config";
import { ENDPOINT_REGISTRY, type EndpointSpec } from "../api/endpoints";
import { DataTable, type Column } from "../components/common/DataTable";
import { ErrorState } from "../components/common/ErrorState";
import { PageHeader } from "../components/common/PageHeader";
import { AUTH_STATE_CHANGED_EVENT, clearAuthToken, hasAuthToken, readAuthToken, writeAuthToken } from "../auth/session";
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
  const [token, setToken] = useState<string>(readAuthToken() ?? "");
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setToken(readAuthToken() ?? "");
    sync();
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_STATE_CHANGED_EVENT, sync);
  }, []);

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

  const handleSave = () => {
    writeAuthToken(token);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    clearAuthToken();
    setToken("");
    setSaved(false);
  };

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
            <h2 className="text-base font-semibold text-fg">Admin authentication</h2>
            {hasAuthToken() && (
              <span className="rounded-full bg-positive-soft px-2 py-0.5 text-xs font-medium text-positive">
                Authorized
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <label className="block text-sm text-muted" htmlFor="api-admin-token">
              Runtime API token
            </label>
            <div className="relative">
              <input
                id="api-admin-token"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Enter the admin token"
                className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 pr-10 text-sm text-fg placeholder:text-muted focus:border-analytics focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowToken((value) => !value)}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-fg"
                aria-label={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? <EyeOffIcon className="h-4 w-4" aria-hidden /> : <EyeIcon className="h-4 w-4" aria-hidden />}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-analytics px-3 text-sm font-medium text-white transition-colors hover:bg-analytics-strong"
              >
                {hasAuthToken() ? "Update token" : "Save token"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-fg transition-colors hover:bg-canvas"
              >
                <Trash2Icon className="h-4 w-4" aria-hidden />
                Clear
              </button>
            </div>

            <p className="text-xs text-muted">
              This is the same bearer token the backend expects in <code className="font-mono">Authorization: Bearer &lt;token&gt;</code>. It is stored only in browser storage for the current runtime and is never embedded in the frontend bundle or a VITE_* variable.
            </p>
            {saved && <p className="text-xs font-medium text-positive">Token saved for this browser session.</p>}
          </div>
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
