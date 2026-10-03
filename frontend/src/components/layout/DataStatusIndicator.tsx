import React from "react";
import { Link } from "react-router-dom";
import { useSystemStatus } from "../../hooks/useSystemStatus";
import { cn } from "../../utils/cn";
import { formatDateTime } from "../../utils/formatters";

/** LIVE / DEMO state comes exclusively from the backend health response. */
export function DataStatusIndicator() {
  const { data, isLoading, isError } = useSystemStatus();

  let label = "Checking…";
  let dot = "bg-subtle";
  let text = "text-muted";
  let title = "Checking backend status";

  if (isError) {
    label = "API offline";
    dot = "bg-danger";
    text = "text-danger";
    title = "The backend health endpoint could not be reached";
  } else if (data) {
    label = data.demoMode ? "Demo data" : "Live data";
    dot = data.demoMode ? "bg-caution" : "bg-positive";
    text = data.demoMode ? "text-caution" : "text-positive";
    title = `Last updated ${formatDateTime(data.lastUpdated)}`;
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        to="/settings"
        title={title}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 transition-colors duration-150 hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics"
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            dot,
            isLoading && "animate-pulse",
          )}
          aria-hidden
        />
        <span
          className={cn("text-xs font-semibold uppercase tracking-wide", text)}
        >
          {label}
        </span>
      </Link>
    </div>
  );
}
