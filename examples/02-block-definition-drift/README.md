# 02 · Block definition drift

**Offline, no account, no model, no authority mock.**

```sh
npm ci
npm run demo:drift
```

[See the actual recorded run and its execution boundary](../../docs/demo.md), including a plain-text transcript and optional terminal replay.

## Follow the code

1. [`reviewed.json`](../../fixtures/tools/reviewed.json) is a committed, explicitly reviewed synthetic definition. It is not auto-approved from a remote first observation.
2. [`main.ts`](main.ts) approves that exact fixture with the public SDK helpers.
3. [`local-server.ts`](local-server.ts) implements a benign synthetic weather tool using the official MCP SDK and `InMemoryTransport`.
4. [`boundary.ts`](boundary.ts) reads the current inventory, checks pins **and** the strict inventory hash, then—and only then—calls the tool.
5. Change the description, remove a pin, or add a tool: the command asserts no handler entry for each denied attempt.

Expected: unchanged executes once; changed description, missing pin, and added tool each execute zero times. The scripted demo exits **0** because all expected denials were asserted. An unexpected execution makes it fail.

## Move this into your application

Keep the raw MCP client inside your integration. Expose only the checked closure to your agent/application. Review the baseline out of band and store it in your own trusted configuration. The sample supports only the no-argument weather call; deliberately adapt input handling and business authorization for real tools.

Never automatically replace approved pins on mismatch. A baseline change is a separate human review and explicit code/configuration change. CI must not regenerate and auto-accept it.

Pagination is bounded to 10 pages and 500 tools; repeated cursors, duplicates, protocol errors, missing definitions, and incomplete listings fail closed. This is a small controlled example, not a universal remote-inventory proof. A syntactically terminated listing cannot prove a dishonest server revealed everything.

This does **not** use the SDK's full `createDidisGuard`. That API also performs delegation authorization through `verifyTool`; pin equality alone is not authorization. [Detailed limitations](../../docs/LIMITATIONS.md).
