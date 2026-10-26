# Limits and threat model

## What the default example actually enforces

A consumer-owned closure lists current tool definitions, verifies exact hashes using published SDK helpers, rejects unknown/missing/changed inventory, and only then calls one no-argument tool. It protects **that wrapped path**. The demonstration uses a controlled official MCP in-memory server and observable handler entry counts, not a fabricated authority response.

- Baseline: the exact committed synthetic definition, explicitly reviewed in code. Remote first observation is never automatic approval.
- Selected-tool pin plus strict inventory hash: extra tools are not implicitly allowed.
- Pagination: at most 10 pages / 500 tools; duplicates, repeated cursors, malformed responses, read errors and missing termination fail closed.
- No baseline update or auto-repin path. Review and intentionally change trusted source/configuration.
- No business authorization, argument policy, model policy, or delegation verification. Add those separately for a real integration.

## What remains possible

A dishonest server can hide tools, return client-specific definitions, preserve a definition while changing behavior, or change between listing and calling (**TOCTOU**). Pin equality cannot prove identity, legal ownership, behavior, prompt-injection resistance, dependency integrity, or absence of malware. An application exposing the raw client alongside the closure permits bypass. A server's `readOnlyHint` is self-reported, not enforced by MCP.

The illustrative local boundary does not impose a raw response-byte limit on the official SDK transport. It limits parsed pages/tools, not arbitrary hostile payload size. Production clients need transport/resource budgets appropriate to their deployment. Hosted inspection has separate server-side limits: currently 2 MiB per response, 10 pages and 500 tools. Inspection output has no general proof that an arbitrary inventory is complete. These two paths are not interchangeable.

## `attestMcpPins` is not strict inventory approval

Public SDK 0.2.5 can return `ok: true` for matching pinned tools while reporting additional tools in `unpinned`. `ok` alone is insufficient for a strict whole-inventory policy. Test [`inspection.test.ts`](../tests/inspection.test.ts) demonstrates this using an explicitly labeled inspection stub. The runnable boundary checks unknown names and the complete bounded inventory hash instead.

Hosted inspection's public-history `drift` compares previous observations. It does not know what **you** reviewed or approved. Do not automatically treat `UNCHANGED` as an approval or `FIRST_OBSERVATION` as safe.

## Advanced: the full SDK guard is a different layer

[`createDidisGuard`](https://github.com/did-is/didis-js) also calls `verifyTool` to verify delegation authority. It is not a pin-only API. A real integration must supply actual agent/root authority and the correct capability mapping, require reviewed pins, choose an authorization cache policy (default ALLOW cache is 30 seconds), and expose only the guarded call path. Definition checks run before that cache. Consider `allowCacheMs: 0` when demonstrating immediate decisions.

This repository deliberately does **not** provide a fake ALLOW service, generate keys, register public delegation chains, or claim authority verification. DID.is delegation receipts are an experimental DID.is format, not a new MCP standard. Real delegation setup and registration have separate state/privacy effects and require deliberate integration; they are outside this first examples release.

## Public inputs and safe output

Live anonymous inspection uses `https://did.is/api`. Public inputs can enter shared observation history. API keys affect specific customer routes, not every SDK method; a key does not make `resolve()` private. Never send secrets, private identifiers, credential-bearing URLs, or internal endpoints to these examples. The sample rejects query strings instead of quietly stripping them and changing the target.

No raw remote descriptions/instructions, server metadata, response bodies or endpoint URLs are printed. Projected strings are bounded and stripped of control characters. Do not treat terminal output, a README badge, an observation hash or a stored result as a continuing certificate. Authentication-required, unsupported protocol, rate limits and network failures are distinct from malicious behavior.
