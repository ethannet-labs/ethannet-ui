/**
 * Playwright global setup: the media-api lives in its own repo, so e2e doesn't
 * start it. Fail fast, with the fix, if it isn't already running and healthy.
 *
 * Override the address with `MEDIA_API_URL` (default `http://localhost:4001`).
 */
export default async function globalSetup(): Promise<void> {
  const base = process.env.MEDIA_API_URL ?? "http://localhost:4001";
  const url = `${base}/actuator/health`;
  const hint =
    "Start it from the media-api repo (../ethannet-media): `podman compose up -d postgres`, then `./mvnw spring-boot:run`.";

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error(`media-api is not reachable at ${url}. ${hint}`);
  }
  const body = (await res.json().catch(() => ({}))) as { status?: string };
  if (!res.ok || body.status !== "UP") {
    throw new Error(
      `media-api at ${url} is not healthy (HTTP ${res.status}, status ${body.status ?? "unknown"}). ${hint}`,
    );
  }
}
