# DID.is · MCP examples

**Inspect an MCP server. Review its tools. Stop wrapped calls when approved definitions change.**

Small, runnable TypeScript examples using the public [DID.is SDK](https://github.com/did-is/didis-js) and the official [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk). No DID.is account, API key, or LLM is needed for the default examples.

[**Block definition drift →**](examples/02-block-definition-drift/) · [**Inspect a public server →**](examples/01-inspect-public-server/) · [**Connect DID.is →**](examples/00-connect-didis/)

## Start here: make a change, see the call stop

Prerequisites: **Node.js 22.19+**, npm, Git. Python 3.11+ is needed for the cross-language test, not the TypeScript demos. Package installation uses the public npm registry; the default demos themselves are offline.

```sh
git clone https://github.com/did-is/mcp-examples.git
cd mcp-examples
npm ci
npm run demo:drift
```

```text
OFFLINE | controlled MCP server | public DID.is SDK 0.2.5 | no authority service
UNCHANGED           EXECUTED   handler calls for attempt: 1
CHANGED DESCRIPTION BLOCKED    handler calls for attempt: 0
MISSING PIN         BLOCKED    handler calls for attempt: 0
ADDED TOOL          BLOCKED    handler calls for attempt: 0
PASS | unchanged executes; denied attempts do not enter the handler.
```

The server and client communicate through the official SDK's in-memory transport. The only action is a synthetic weather handler incrementing a memory counter. No files, shell commands, emails, payments, or model calls are executed.

### Three examples. Three different jobs.

| You want to… | Run | What it establishes |
| --- | --- | --- |
| Block wrapped calls after a definition change | `npm run demo:drift` | SDK hashes + an explicit execution condition; denied attempts enter the handler **zero** times |
| Understand hosted inspection evidence | `npm run demo:inspect` | Reads a clearly labeled synthetic fixture; no server contacted |
| Connect your MCP client to DID.is | `npm run demo:connect` | Prints opt-in instructions; no connection until `--live` |

Connecting DID.is does **not** automatically protect your other tools. Inspection observes definitions; it does not execute the inspected tools or certify their behavior.

## Inspect a server you own

Start offline, then explicitly opt in:

```sh
npm run demo:inspect
npm run demo:inspect -- --live
# One endpoint you own or have permission to inspect:
npm run demo:inspect -- --live --endpoint https://your-public-host/mcp
```

`--live` defaults to `https://did.is/mcp`. It makes one logical `DidisClient.inspectMcp` call, with retries disabled and a 30-second API timeout. The hosted inspector then contacts the target for discovery and tool listing; this can involve multiple remote requests. It does not call the target's tools.

Output separates status, negotiated protocol, tool fingerprints, declared vs heuristic class, checks, limitations, and public-history drift. **AUTH_REQUIRED is an access restriction, not maliciousness.** A heuristic is not a verdict. Public-history drift is not your approved baseline.

Only public HTTPS URLs on port 443 without credentials, query, or fragment are accepted. Do not submit private identifiers or secret URLs: anonymous inspection inputs may enter shared public observation history. Live errors are nonzero and **never** silently replaced with fixtures. [Interpret results and failures →](examples/01-inspect-public-server/)

## Use DID.is from your MCP host

```sh
npm run demo:connect -- --live
```

This connects to `https://did.is/mcp`, lists the available tools, and calls `resolve_did` for the public sample `did:web:did.is`. Successful non-error MCP content is the round-trip check; raw response content is intentionally omitted.

Seven existing read-only tools: `resolve_did`, `verify_credential`, `inspect_mcp_server`, `inspect_a2a_agent`, `authorize_tool_call`, `evaluate_policy`, `search_directory`. Availability can change; the live command reports what the server actually advertises.

Host setup: [Claude Code](clients/claude-code.md) · [VS Code](clients/vscode.md) · [Cursor](clients/cursor.md). Host subscriptions/model requirements are separate. These configurations are documented, not interactive IDE-tested.

## Copy the boundary, not a safety claim

```text
explicitly reviewed definitions → SDK pins + inventory hash
                                  ↓
current tools/list → complete bounded listing → exact-match policy
                                  ↓ only if every check passes
                            MCP tools/call
```

Read [`boundary.ts`](examples/02-block-definition-drift/boundary.ts): it uses `pinToolDefinitions`, `toolDefinitionSha256`, and `mcpInventoryHash` from **@didis/client 0.2.5**. There is one execution point, after all checks. Added, removed, renamed, changed, duplicate, missing, and incomplete inventories fail closed. The raw client must remain private to your integration.

**This is a local definition-pin policy, not `createDidisGuard`, an authorization check, or a new security standard.** The SDK's full guard additionally requires real `verifyTool` delegation authority; we do not fake that authority to make an offline demo appear verified. [Limits and advanced integration →](docs/LIMITATIONS.md)

Definition equality does not prove server identity, legal identity, unchanged behavior, absence of prompt injection, or supply-chain safety. A server can preserve definitions while changing behavior; re-listing and calling also have a time-of-check/time-of-use gap.

## Python mirror

Offline inspection uses only the Python standard library:

```sh
python3 python/01-inspect-public-server/main.py
```

For the optional live path, use Python 3.11+ and the locked public SDK:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r python/requirements.lock
.venv/bin/python python/01-inspect-public-server/main.py --live
```

[Python instructions, including Windows →](python/01-inspect-public-server/)

## Verify and contribute

```sh
npm run check
npm test
python3 -m unittest discover -s python -p 'test_*.py'
```

Tests are offline: real in-memory MCP handler assertions, fail-closed cases, the SDK's `ok`/`unpinned` distinction, synthetic fingerprint consistency, endpoint validation, and matching TypeScript/Python projections. CI has no live probes, credentials, scheduled scans, package publishing, or model dependencies.

- [Compatibility and actual verification](docs/compatibility.md)
- [Limits and threat model](docs/LIMITATIONS.md)
- [Manual live testing](docs/live-testing.md)
- [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md)
- [DID.is developer documentation](https://docs.did.is/) · [Official MCP Inspector](https://github.com/modelcontextprotocol/inspector) for general protocol debugging

MIT licensed. This is an examples repository, not a published npm package or a hosted service.
