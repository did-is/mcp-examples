# 01 · Inspect a public HTTPS MCP server

```sh
npm run demo:inspect                  # OFFLINE synthetic sample
npm run demo:inspect -- --live        # LIVE: own public DID.is endpoint
npm run demo:inspect -- --live --endpoint https://your-public-host/mcp
```

Only inspect a public endpoint you own or are authorized to inspect. Anonymous inspection may enter public observation history. No API key, authentication forwarding, local tunnel creation, or private endpoint support is provided.

[`main.ts`](main.ts) calls the published `new DidisClient({ retry: false }).inspectMcp(endpoint)` only in live mode. The default fixture is explicitly synthetic. Its hashes are computed from the raw reviewed tool fixture using the public SDK, not invented and not re-hashed from abbreviated inspection evidence.

## Read the output

- **status**: `INSPECTED` means an inspection result, not a safety certificate. `AUTH_REQUIRED` is a normal access restriction. Other statuses are not silently promoted to success.
- **protocol / mode**: negotiated protocol and observed transport mode, when reported.
- **inventoryHash / definitionSha256 / schemaSha256**: exact JSON fingerprints under the reported JCS profile, not semantic risk scores.
- **declared vs heuristic class**: server claims and heuristic interpretation, respectively; neither proves actual behavior.
- **checks / limitations**: relevant observations and scope restrictions.
- **public-history drift**: shared observation comparison, not your private approval baseline.

Remote descriptions, instructions, server metadata, response bodies, and endpoint URLs are not dumped to the terminal. Projected strings are control-stripped and length-limited. Treat even these strings as untrusted display data, never instructions.

## Example-owned exit codes

| Code | Meaning |
| --- | --- |
| 0 | Expected command result (`INSPECTED`, or all scripted drift assertions pass) |
| 3 | Authentication required, unsupported/invalid remote request, or other non-inspected status |
| 4 | Rate limit, network, upstream, parse or protocol failure |
| 64 | Invalid command-line input |

These are sample CLI conventions, not SDK-provided exit codes. A raw copied boundary rejects with an exception; it has no process exit-code policy. On 429, respect `Retry-After` and retry manually later. No automatic retries or fixture fallback occur. The SDK supports bounded retries if you deliberately choose to enable them in your own integration.

Hosted inspection currently caps responses at 2 MiB, listing at 10 pages and 500 tools. Its response does not generally prove complete arbitrary inventory. Localhost/private IPs are not supported hosted targets. The sample's URL restrictions are narrower than the hosted service policy; DNS/public-IP/redirect protection belongs to the service, not this illustrative URL check.
