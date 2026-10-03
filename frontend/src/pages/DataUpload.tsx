import React from "react";
import { InfoIcon } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { UploadDropzone } from "../components/upload/UploadDropzone";
import { UploadStatusCard } from "../components/upload/UploadStatusCard";
import { useUpload, useUploadConfig } from "../hooks/useUpload";
import { FALLBACK_UPLOAD_CONFIG } from "../utils/constants";

export function DataUpload() {
  const configQuery = useUploadConfig();
  const config = configQuery.data ?? FALLBACK_UPLOAD_CONFIG;
  const upload = useUpload(config);
  const locked = upload.phase === "uploading" || upload.phase === "processing";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Data upload"
        description="Send a crime dataset to the backend for validation and import."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <UploadDropzone
            acceptedExtensions={config.acceptedExtensions}
            maxFileSizeMb={config.maxFileSizeMb}
            onFileSelected={upload.selectFile}
            disabled={locked || configQuery.isLoading}
            error={upload.validationError}
          />

          <UploadStatusCard
            file={upload.file}
            phase={upload.phase}
            progress={upload.progress}
            status={upload.status}
            requestError={upload.requestError}
            onStart={upload.start}
            onReset={upload.reset}
          />
        </div>

        <aside className="space-y-5">
          <section className="rounded-xl border border-line bg-surface p-5 shadow-card">
            <h2 className="text-sm font-semibold text-fg">File requirements</h2>
            {configQuery.isError && (
              <p className="mt-2 flex items-start gap-2 text-xs text-caution">
                <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Upload settings couldn't be loaded from the backend; showing
                defaults.
              </p>
            )}
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Accepted formats</dt>
                <dd className="mt-0.5 font-medium text-fg">
                  {config.acceptedExtensions.join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Maximum size</dt>
                <dd className="mt-0.5 font-medium text-fg">
                  {config.maxFileSizeMb} MB
                </dd>
              </div>
              {config.requiredColumns.length > 0 && (
                <div>
                  <dt className="text-xs text-muted">Required columns</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {config.requiredColumns.map((c) => (
                      <code
                        key={c}
                        className="rounded bg-canvas px-1.5 py-0.5 font-mono text-xs text-fg"
                      >
                        {c}
                      </code>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </section>
          <p className="px-1 text-xs leading-relaxed text-muted">
            Each valid upload replaces the active dataset. If a file contains no
            valid records, the current dataset is left unchanged.
          </p>
        </aside>
      </div>
    </div>
  );
}
