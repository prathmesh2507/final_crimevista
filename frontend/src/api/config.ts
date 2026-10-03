type EnvShape = Record<string, string | undefined>;

const env: EnvShape = (import.meta as unknown as { env?: EnvShape }).env ?? {};

/** Base URL of the CrimeVista backend. Configure via VITE_API_BASE_URL.
 * For same-origin Railway deployments, the default is the app's own /api path.
 */
export const API_BASE_URL = (
  env.VITE_API_BASE_URL ?? "/api"
).replace(/\/$/, "");

export const API_TIMEOUT_MS = Number(env.VITE_API_TIMEOUT_MS ?? 30000);

/** CARTO raster basemap key; exposed in tile requests and should be host-restricted. */
export const CARTO_API_KEY = env.VITE_CARTO_API_KEY ?? "";

export const AUTH_TOKEN_STORAGE_KEY = "crimevista.authToken";
