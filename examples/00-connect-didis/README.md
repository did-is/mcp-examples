# 00 · Connect DID.is

```sh
npm run demo:connect              # OFFLINE: no request
npm run demo:connect -- --live    # LIVE: initialize, tools/list, resolve_did
```

[`main.ts`](main.ts) uses the official MCP SDK's `Client` and `StreamableHTTPClientTransport` against `https://did.is/mcp`. It calls `resolve_did` for public sample `did:web:did.is` and checks for non-error MCP content. It does not create accounts, register delegations, forward credentials, or generate keys. Individual MCP requests have 15-second timeouts; the HTTP transport has a 30-second abort budget and reconnection retries disabled.

A round trip proves this sample connected and received tool content, not that another tool is protected or that a DID holder is safe. No raw response bodies are printed. Public lookups are public: adding an API key to some other SDK method does not make every lookup private.

Host setup: [Claude Code](../../clients/claude-code.md), [VS Code](../../clients/vscode.md), [Cursor](../../clients/cursor.md). Merge with existing configuration; never overwrite it wholesale.
