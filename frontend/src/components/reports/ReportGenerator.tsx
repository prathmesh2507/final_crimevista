import React, { useEffect, useState } from "react";
import { LoaderCircleIcon } from "lucide-react";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { useFilters } from "../../hooks/useFilters";
import type { ReportFormat, ReportRequest } from "../../types/operations";
import { cn } from "../../utils/cn";
import { REPORT_FORMATS, REPORT_SECTIONS } from "../../utils/constants";
import { DateField } from "../filters/DateField";

interface ReportGeneratorProps {
  onGenerate: (request: ReportRequest) => void;
  isGenerating: boolean;
}

const selectClass =
  "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-fg hover:border-subtle focus:border-analytics focus:outline-none focus-visible:ring-2 focus-visible:ring-analytics";

export function ReportGenerator({
  onGenerate,
  isGenerating,
}: ReportGeneratorProps) {
  const { filters } = useFilters();
  const { data: options, isLoading: optionsLoading } = useFilterOptions();
  const [title, setTitle] = useState("Nagpur crime summary");
  const [startDate, setStartDate] = useState<string | null>(filters.startDate);
  const [endDate, setEndDate] = useState<string | null>(filters.endDate);
  const [area, setArea] = useState(
    filters.areas.length === 1 ? filters.areas[0] : "",
  );
  const [crimeType, setCrimeType] = useState(
    filters.crimeTypes.length === 1 ? filters.crimeTypes[0] : "",
  );
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [sections, setSections] = useState<string[]>(
    REPORT_SECTIONS.slice(0, 3).map((s) => s.value),
  );

  useEffect(() => {
    setStartDate(filters.startDate);
    setEndDate(filters.endDate);
    setArea(filters.areas.length === 1 ? filters.areas[0] : "");
    setCrimeType(filters.crimeTypes.length === 1 ? filters.crimeTypes[0] : "");
  }, [filters]);

  const dateError =
    startDate && endDate && startDate > endDate
      ? "Start date must be on or before the end date."
      : null;
  const titleError = title.trim() ? null : "Give the report a title.";
  const canSubmit =
    !dateError && !titleError && sections.length > 0 && !isGenerating;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onGenerate({
      title: title.trim(),
      format,
      sections,
      filters: {
        ...filters,
        startDate,
        endDate,
        areas: area ? [area] : [],
        crimeTypes: crimeType ? [crimeType] : [],
      },
    });
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-xl border border-line bg-surface p-5 shadow-card"
      noValidate
    >
      <div>
        <h2 className="text-base font-semibold text-fg">Report parameters</h2>
        <p className="mt-0.5 text-xs text-muted">
          The backend compiles the report; this form only defines its scope.
        </p>
      </div>

      <div>
        <label
          htmlFor="report-title"
          className="mb-1.5 block text-xs font-medium text-muted"
        >
          Title
        </label>
        <input
          id="report-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={Boolean(titleError)}
          className={selectClass}
        />
        {titleError && <p className="mt-1 text-xs text-danger">{titleError}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DateField
          id="report-start"
          label="From"
          value={startDate}
          onChange={setStartDate}
          min={options?.dateRange.min}
          max={options?.dateRange.max}
          invalid={Boolean(dateError)}
        />
        <DateField
          id="report-end"
          label="To"
          value={endDate}
          onChange={setEndDate}
          min={options?.dateRange.min}
          max={options?.dateRange.max}
          invalid={Boolean(dateError)}
        />
        <div>
          <label
            htmlFor="report-area"
            className="mb-1.5 block text-xs font-medium text-muted"
          >
            Area
          </label>
          <select
            id="report-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            disabled={optionsLoading}
            className={selectClass}
          >
            <option value="">All areas</option>
            {options?.areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="report-type"
            className="mb-1.5 block text-xs font-medium text-muted"
          >
            Crime type
          </label>
          <select
            id="report-type"
            value={crimeType}
            onChange={(e) => setCrimeType(e.target.value)}
            disabled={optionsLoading}
            className={selectClass}
          >
            <option value="">All crime types</option>
            {options?.crimeTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      {dateError && <p className="-mt-2 text-xs text-danger">{dateError}</p>}

      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted">
          Format
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {REPORT_FORMATS.map((f) => (
            <label
              key={f.value}
              className={cn(
                "flex h-10 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium transition-colors duration-150",
                format === f.value
                  ? "border-analytics bg-analytics-soft text-analytics-strong"
                  : "border-line text-fg hover:bg-canvas",
              )}
            >
              <input
                type="radio"
                name="report-format"
                value={f.value}
                checked={format === f.value}
                onChange={() => setFormat(f.value)}
                className="sr-only"
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted">
          Sections
        </legend>
        <div className="space-y-1">
          {REPORT_SECTIONS.map((s) => (
            <label
              key={s.value}
              className="flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 text-sm text-fg"
            >
              <input
                type="checkbox"
                checked={sections.includes(s.value)}
                onChange={() =>
                  setSections((cur) =>
                    cur.includes(s.value)
                      ? cur.filter((v) => v !== s.value)
                      : [...cur, s.value],
                  )
                }
                className="h-4 w-4 rounded border-line accent-analytics"
              />

              {s.label}
            </label>
          ))}
        </div>
        {!sections.length && (
          <p className="mt-1 text-xs text-danger">
            Select at least one section.
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-analytics px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-analytics-strong disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating && (
          <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden />
        )}
        {isGenerating ? "Generating report…" : "Generate report"}
      </button>
    </form>
  );
}
