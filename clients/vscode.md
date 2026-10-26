# VS Code

1. Open the Command Palette and choose **MCP: Add Server**.
2. Choose **HTTP** and enter `https://did.is/mcp`.
3. Use `didis` as the server ID, checking for an existing entry first.
4. Select the intended user/workspace configuration scope. Review changes rather than overwriting an existing configuration.
5. In a supported agent/chat mode, request `resolve_did` for `did:web:did.is`. Confirm the actual tool call/result and follow host permission prompts.

VS Code uses its own `servers` configuration format; do not paste Cursor's `mcpServers` object into it. Host trust controls, model access, and subscriptions remain separate. Connecting DID.is does not protect your other tools.

Source: [official VS Code MCP documentation](https://code.visualstudio.com/docs/agent-customization/mcp-servers). Configuration documented, not interactively tested in VS Code.
