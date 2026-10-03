import type { UploadConfig, UploadStatus } from "../types/operations";
import { apiClient } from "./client";
import type { RawUploadConfig, RawUploadStatus } from "./contracts";
import { ENDPOINTS } from "./endpoints";

const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

export const uploadApi = {
  /** GET /upload/config — REQUIRES BACKEND IMPLEMENTATION. */
  async getConfig(signal?: AbortSignal): Promise<UploadConfig> {
    const { data } = await apiClient.get<RawUploadConfig>(
      ENDPOINTS.uploadConfig,
      { signal },
    );
    return {
      acceptedExtensions: data.acceptedExtensions ?? [],
      maxFileSizeMb: data.maxFileSizeMb,
      requiredColumns: data.requiredColumns ?? [],
    };
  },

  /** POST /upload (multipart/form-data, field "file") — REQUIRES BACKEND IMPLEMENTATION. */
  async uploadFile(
    file: File,
    onProgress: (percent: number) => void,
  ): Promise<UploadStatus> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post<RawUploadStatus>(
      ENDPOINTS.upload,
      form,
      {
        timeout: UPLOAD_TIMEOUT_MS,
        onUploadProgress: (event) => {
          if (event.total)
            onProgress(Math.round((event.loaded / event.total) * 100));
        },
      },
    );
    return data;
  },

  /** GET /upload/:id/status — REQUIRES BACKEND IMPLEMENTATION. */
  async getStatus(
    uploadId: string,
    signal?: AbortSignal,
  ): Promise<UploadStatus> {
    const { data } = await apiClient.get<RawUploadStatus>(
      ENDPOINTS.uploadStatus(uploadId),
      { signal },
    );
    return data;
  },
};
