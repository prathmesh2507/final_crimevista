import React from "react";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { MoonIcon, RefreshCwIcon, SunIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { useTheme } from "../../contexts/theme";
import { BrandMark } from "./BrandMark";
import { DataStatusIndicator } from "./DataStatusIndicator";

export function Topbar() {
  const queryClient = useQueryClient();
  const fetching = useIsFetching() > 0;
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="md:hidden">
          <BrandMark />
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-tight text-fg">
            CrimeVista
          </p>
          <p className="hidden truncate text-xs text-muted sm:block">
            Nagpur Crime Intelligence &amp; Urban Safety Analytics Platform
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <DataStatusIndicator />
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-fg transition-colors duration-150 hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics"
        >
          {theme === "dark" ? (
            <SunIcon className="h-4 w-4" aria-hidden />
          ) : (
            <MoonIcon className="h-4 w-4" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => queryClient.invalidateQueries()}
          aria-label="Refresh all data"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-fg transition-colors duration-150 hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-analytics"
        >
          <RefreshCwIcon
            className={cn("h-4 w-4", fetching && "animate-spin")}
            aria-hidden
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </header>
  );
}
