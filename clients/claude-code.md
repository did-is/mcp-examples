# Claude Code

Add the existing remote server (no local server process or DID.is key):

```sh
claude mcp add --transport http didis https://did.is/mcp
```

Do not replace an existing server named `didis` without reviewing its configuration. Choose the scope deliberately using your installed Claude Code version's options. In a conversation, ask the host to call `resolve_did` for `did:web:did.is` and inspect the actual tool result—not just the generated answer. Follow the host's permission prompts.

This connects the DID.is tools; it does not intercept or guard other tools. Model access/subscriptions are separate from DID.is's public endpoint.

Source: [official Claude Code MCP documentation](https://code.claude.com/docs/en/mcp). Configuration documented, not interactively tested in Claude Code. For an executed terminal round trip, use `npm run demo:connect -- --live`.
