# Deliberate live testing

Default demos/tests are offline. Install dependencies first; registry installation itself uses network.

```sh
npm run demo:connect -- --live
npm run demo:inspect -- --live
```

These commands target only DID.is's public endpoint by default. The first performs MCP initialization, listing, and one `resolve_did` call for `did:web:did.is`; the second makes one logical hosted inspection call. Inspection itself performs target discovery/listing requests, not target tool execution. There is no repeated scan, arbitrary endpoint workflow input, schedule, background monitoring, or public chain registration.

Only the inspection command accepts another target: `--live --endpoint https://your-public-host/mcp`. You must own it or have permission. Choose a public URL with no userinfo, query, fragment, private IP or secret path. HTTPS/port 443 is an example policy; service-side DNS/public-IP/redirect controls remain separate.

TypeScript inspection and Python inspection disable SDK retries and use a 30-second API timeout. On 429 respect `Retry-After`; retry manually later. The public anonymous service currently has shared per-IP budgets (overall 20/min; intensive inspections 10/min), which may be consumed by other users. These are not an entitlement or a throughput guarantee. SDK bounded retry support exists but is intentionally not used here. Live failures never become offline success.

Do not run live commands automatically on pull requests, fork inputs, dependency install hooks, or CI. Do not deliberately provoke production rate limits to test failure behavior; use synthetic offline error fixtures.

On 2026-10-26, the TypeScript connect and inspect commands were each run once against the default endpoint: both exited 0; connect advertised seven tools and returned non-error resolution content; inspect reported `INSPECTED`, `STATELESS`, protocol `2026-07-28`, seven tools. This is a historical point-in-time check, not a live availability promise. No Python live request was made.
