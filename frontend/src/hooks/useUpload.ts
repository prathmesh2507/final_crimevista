import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadApi } from "../api/uploadApi";
import { useFilters } from "./useFilters";
import type { UploadConfig, UploadStage } from "../types/operations";
import { validateUploadFile } from "../utils/files";
import { createEmptyFilters } from "../utils/filters";

const isTerminal = (stage?: UploadStage) =>
  stage === "completed" || stage === "failed";

export type UploadPhase =
  | "idle"
  | "ready"
  | "uploading"
  | "processing"
  | "completed"
  | "failed";

export function useUploadConfig() {
  return useQuery({
    queryKey: ["upload", "config"],
    queryFn: ({ signal }) => uploadApi.getConfig(signal),
    staleTime: 30 * 60_000,
  });
}

export function useUpload(config: UploadConfig) {
  const queryClient = useQueryClient();
  const { applyFilters } = useFilters();
  const appliedUploadId = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (selected: File) => uploadApi.uploadFile(selected, setProgress),
  });

  const uploadId = mutation.data?.uploadId ?? null;
  const statusQuery = useQuery({
    queryKey: ["upload", "status", uploadId],
    queryFn: ({ signal }) => uploadApi.getStatus(uploadId as string, signal),
    enabled: Boolean(uploadId) && !isTerminal(mutation.data?.stage),
    refetchInterval: (query) =>
      isTerminal(query.state.data?.stage) ? false : 1500,
  });

  const status = statusQuery.data ?? mutation.data ?? null;

  useEffect(() => {
    if (status?.stage !== "completed") return;
    queryClient.invalidateQueries({
      predicate: (q) => q.queryKey[0] !== "upload",
    });
    if (appliedUploadId.current === status.uploadId) return;
    appliedUploadId.current = status.uploadId;
    if (status.analysisStatus === "completed") {
      applyFilters(createEmptyFilters());
    }
  }, [
    status?.stage,
    status?.uploadId,
    status?.analysisStatus,
    queryClient,
    applyFilters,
  ]);

  const selectFile = (selected: File) => {
    const error = validateUploadFile(selected, config);
    mutation.reset();
    setProgress(0);
    setValidationError(error);
    setFile(error ? null : selected);
  };

  const reset = () => {
    mutation.reset();
    setFile(null);
    setProgress(0);
    setValidationError(null);
  };

  let phase: UploadPhase = file ? "ready" : "idle";
  if (mutation.isPending) phase = "uploading";
  else if (
    mutation.isError ||
    statusQuery.isError ||
    status?.stage === "failed"
  )
    phase = "failed";
  else if (status?.stage === "completed") phase = "completed";
  else if (status) phase = "processing";

  return {
    file,
    phase,
    progress,
    status,
    validationError,
    requestError: mutation.error ?? statusQuery.error ?? null,
    selectFile,
    start: () => file && mutation.mutate(file),
    reset,
  };
}
