import type { UploadConfig } from '../types/operations';

/** Client-side pre-check only (type, size, empty). Content validation happens on the backend. */
export function validateUploadFile(file: File, config: UploadConfig): string | null {
  const name = file.name.toLowerCase();
  const accepted = config.acceptedExtensions.map((e) => e.toLowerCase());
  if (accepted.length && !accepted.some((ext) => name.endsWith(ext))) {
    return `Unsupported file type. Accepted: ${config.acceptedExtensions.join(', ')}.`;
  }
  if (file.size === 0) return 'The selected file is empty.';
  if (file.size > config.maxFileSizeMb * 1024 * 1024) {
    return `File exceeds the ${config.maxFileSizeMb} MB limit.`;
  }
  return null;
}