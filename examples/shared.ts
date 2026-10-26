import { DidisError, type McpInspection } from '@didis/client';

/** Never print raw remote descriptions, instructions, URLs, or error bodies. */
export const text = (value: unknown): string => String(value ?? 'not reported').replace(/[\x00-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g, '').slice(0, 160);
export function publicEndpoint(raw: string): string {
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error('INPUT: expected a public HTTPS endpoint'); }
  if (raw.includes('?') || raw.includes('#') || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      (url.port && url.port !== '443') || !url.hostname.includes('.') ||
      /^[\d.]+$/.test(url.hostname) || url.hostname.includes(':') ||
      /\.(localhost|local|internal|test|invalid|example)$/.test(url.hostname) || url.hostname === 'localhost') {
    throw new Error('INPUT: use public HTTPS, port 443, no credentials/query/fragment or IP literal');
  }
  // The hosted inspector separately validates DNS, public IPs and redirects. This is not an SSRF defense.
  return url.href;
}
export function inspectArgs(args: string[]): { live: boolean; endpoint: string } {
  if (args.length === 0) return { live: false, endpoint: 'https://did.is/mcp' };
  if (args[0] !== '--live' || !([1, 3].includes(args.length)) ||
      (args.length === 3 && args[1] !== '--endpoint')) throw new Error('INPUT: use --live [--endpoint PUBLIC_HTTPS_URL]');
  return { live: true, endpoint: publicEndpoint(args[2] ?? 'https://did.is/mcp') };
}
const hash = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) ? value : 'not reported';
export function projection(result: McpInspection, live: boolean): string[] {
  if (!result || typeof result.status !== 'string' || !Array.isArray(result.tools) ||
      !Array.isArray(result.limitations) || !result.drift || !Array.isArray(result.checks)) throw new Error('Malformed inspection');
  return [
    `${live ? 'LIVE | hosted DID.is observation' : 'OFFLINE | SYNTHETIC SAMPLE (not an observation)'} | SDK 0.2.5`,
    `status: ${text(result.status)}`,
    `protocol: ${text(result.negotiatedVersion)} | mode: ${text(result.mode)}`,
    `tools reported: ${result.tools.length} | inventoryHash: ${hash(result.inventoryHash)}`,
    `jcsProfile: ${text(result.jcsProfile)}`,
    ...result.tools.flatMap((tool) => [
      `tool: ${text(tool.name)} | definitionSha256: ${hash(tool.definitionSha256)} | schemaSha256: ${hash(tool.schemaSha256)}`,
      `  declared: ${text(tool.declaredClass)} | heuristic: ${text(tool.heuristicClass)}`,
    ]),
    `public-history drift: ${text(result.drift.status)} (not your approval baseline)`,
    ...result.checks.map((check) => `check: ${text(check.id)} | ${text(check.status)}`),
    ...result.limitations.map((limitation) => `limitation: ${text(limitation)}`),
    'Definitions and heuristics are evidence, not a safety certificate or behavior guarantee.',
  ];
}
export function inspectionExit(status: string): number { return status === 'INSPECTED' ? 0 : 3; }
export function fail(error: unknown): void {
  if (error instanceof Error && error.message.startsWith('INPUT:')) {
    console.error(error.message); process.exitCode = 64;
  } else if (error instanceof DidisError) {
    console.error(error.status === 429 ? 'RATE_LIMITED: wait for Retry-After; retry manually later.' :
      [401, 403].includes(error.status) ? 'AUTH_REQUIRED: access restriction, not evidence of malicious behavior.' :
      [400, 422].includes(error.status) ? 'UNSUPPORTED_OR_INVALID: check the endpoint and protocol support.' :
      'UPSTREAM_ERROR: no fixture fallback; retry manually later.');
    process.exitCode = [400, 401, 403, 422].includes(error.status) ? 3 : 4;
  } else {
    console.error('NETWORK_OR_PROTOCOL_ERROR: no fixture fallback. Check connectivity and compatibility.');
    process.exitCode = 4;
  }
}
