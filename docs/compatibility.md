# Compatibility and verification

Last local verification: **2026-10-26**. These are examples, not a package release.

| Component | Exact version / scope | Evidence |
| --- | --- | --- |
| DID.is TypeScript SDK | `@didis/client` 0.2.5 from npm | Clean lockfile install, typecheck, offline SDK hashes and in-memory MCP execution |
| Official MCP TypeScript SDK | `@modelcontextprotocol/sdk` 1.32.1 from npm | In-memory transport + opt-in Streamable HTTP round trip |
| Node.js | 22.19.0 and 24.18.1 locally tested | Clean staged archive: typecheck, 12 tests and drift demo passed on both runtimes |
| Python | 3.11+ supported; local 3.12.3 | Standard-library offline script/tests and exact TypeScript output parity |
| DID.is Python SDK | `didis-py` 0.2.5 from PyPI | Clean virtual-environment install and live API signature checked; no Python live request |
| Claude Code / VS Code / Cursor | Linked official configuration docs | Documented, **not interactively executed** |
| Hosted DID.is MCP | `https://did.is/mcp` | One live TypeScript connect and one hosted inspect, 2026-10-26; not continuous monitoring |

Local OS: Linux x86_64. Windows commands are documented, not executed here. `package-lock.json` pins exact public npm dependencies; `python/requirements.lock` pins a public PyPI resolution. No private workspace links or generated SDK source are included. Node/Python minimum versions are this repository's support choices, not claims about every upstream package's minimum.

This repository deliberately stays on the monolithic stable MCP 1.32.1 import family. Newer upstream split client/server APIs are a separate compatibility migration; do not mix their import paths with these examples. The official Inspector is linked as an existing general protocol tool, not installed or reimplemented.

CI runs only offline checks, with Node 22/24 and Python 3.11/3.12. A configured workflow is not a claim that a remote run has already passed. Check the exact commit's Actions result after publication.
