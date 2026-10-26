# Cursor

Merge this entry into the **existing** `mcpServers` object in your project's `.cursor/mcp.json` (or use your intended user-level scope). Do not overwrite the whole file or replace an existing `didis` entry without review.

```json
{
  "mcpServers": {
    "didis": {
      "url": "https://did.is/mcp"
    }
  }
}
```

In an MCP-capable agent session, request `resolve_did` for `did:web:did.is` and inspect the real tool result, following permission prompts. Model access/subscriptions are separate. This adds DID.is tools; it is not a global guard over other tools.

Source: [official Cursor MCP documentation](https://cursor.com/docs/mcp). Configuration documented, not interactively tested in Cursor.
