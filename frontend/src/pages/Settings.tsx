import React, { useEffect, useState } from "react";
import { LoaderCircleIcon, LogOutIcon, PlugIcon } from "lucide-react";
import { authApi } from "../api/authApi";
import { API_BASE_URL, API_TIMEOUT_MS } from "../api/config";
import { isApiError } from "../api/errors";
import { ENDPOINT_REGISTRY, type EndpointSpec } from "../api/endpoints";
import { DataTable, type Column } from "../components/common/DataTable";
import { ErrorState } from "../components/common/ErrorState";
import { PageHeader } from "../components/common/PageHeader";
import { AUTH_STATE_CHANGED_EVENT } from "../auth/session";
import { useSystemStatus } from "../hooks/useSystemStatus";
import { cn } from "../utils/cn";
import { formatDateTime } from "../utils/formatters";

const COLUMNS: Column<EndpointSpec>[] = [
  {
    key: "method",
    header: "Method",
    render: (endpoint) => (
      <span
        className={cn(
          "font-mono text-xs font-semibold",
          endpoint.method === "GET" ? "text-analytics" : "text-alert",
        )}
      >
        {endpoint.method}
      </span>
    ),
  },
  {
    key: "path",
    header: "Path",
    render: (endpoint) => (
      <code className="font-mono text-xs text-fg">{endpoint.path}</code>
    ),
  },
  { key: "purpose", header: "Purpose", render: (endpoint) => endpoint.purpose },
  {
    key: "replaces",
    header: "Streamlit equivalent",
    render: (endpoint) => (
      <span className="font-mono text-xs text-muted">{endpoint.replaces}</span>
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const onAuthStateChanged = () => setAuthenticated(false);
    authApi
      .getSession()
      .then((session) => {
        if (active) setAuthenticated(session.authenticated);
      })
      .catch(() => {
        if (active) setAuthenticated(false);
      });
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, onAuthStateChanged);
    return () => {
      active = false;
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, onAuthStateChanged);
    };
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

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      await authApi.login({ username, password });
      setPassword("");
      setAuthenticated(true);
    } catch (error) {
      if (isApiError(error) && error.status === 401) {
        setAuthError("The administrator username or password is incorrect.");
      } else if (isApiError(error) && error.status === 503) {
        setAuthError(
          "Administrator sign-in is not configured on the server. Set ADMIN_USERNAME, ADMIN_PASSWORD, and API_ADMIN_TOKEN in Render.",
        );
      } else {
        setAuthError("Sign-in failed. Check the connection and try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await authApi.logout();
      setAuthenticated(false);
    } catch {
      setAuthError("Sign-out failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
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
            <h2 className="text-base font-semibold text-fg">
              Administrator sign-in
            </h2>
            {authenticated && (
              <span className="rounded-full bg-positive-soft px-2 py-0.5 text-xs font-medium text-positive">
                Signed in
              </span>
            )}
          </div>

          {authenticated === null ? (
            <p className="mt-4 text-sm text-muted">Checking sign-in…</p>
          ) : authenticated ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted">
                You are signed in. This browser keeps a secure, HttpOnly
                administrator session for up to 30 days.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                disabled={authLoading}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-fg transition-colors hover:bg-canvas disabled:opacity-60"
              >
                {authLoading ? (
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <LogOutIcon className="h-4 w-4" aria-hidden />
                )}
                Sign out
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="mt-4 space-y-3">
              <div>
                <label
                  className="mb-1.5 block text-sm text-muted"
                  htmlFor="admin-username"
                >
                  Administrator username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:border-analytics focus:outline-none"
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm text-muted"
                  htmlFor="admin-password"
                >
                  Administrator password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:border-analytics focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-analytics px-3 text-sm font-medium text-white transition-colors hover:bg-analytics-strong disabled:opacity-60"
              >
                {authLoading && (
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden />
                )}
                Sign in
              </button>
            </form>
          )}

          {authError && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {authError}
            </p>
          )}
          <p className="mt-3 text-xs text-muted">
            Administrator access is provisioned by the server owner. There is
            no public registration. The API secret remains on the server; this
            browser receives only an HttpOnly session cookie.
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
                <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden />
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
          rowKey={(endpoint) => `${endpoint.method} ${endpoint.path}`}
        />
      </section>
    </div>
  );
}
