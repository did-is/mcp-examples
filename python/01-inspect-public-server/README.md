# Python · Inspect a public MCP server

Python **3.11+**. The default uses only the standard library and the same synthetic fixture/output fields as TypeScript:

```sh
python3 python/01-inspect-public-server/main.py
```

For live inspection, install the locked public `didis-py==0.2.5` HTTP client (no Python MCP SDK or model framework):

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r python/requirements.lock
.venv/bin/python python/01-inspect-public-server/main.py --live
```

Windows PowerShell:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r python/requirements.lock
.\.venv\Scripts\python.exe python/01-inspect-public-server/main.py --live
```

Optionally add `--endpoint https://your-public-host/mcp` after `--live`, only for a target you own or are authorized to inspect. SDK call: `with DidisClient(retry=False, timeout=30.0) as client: client.inspect_mcp(target)`. No account/key, retries, secret URLs, raw response dumps, or silent offline fallback. Public inputs may enter public observation history. [Interpretation and limits](../../examples/01-inspect-public-server/).

`requirements.lock` pins the complete dependency resolution used for the live SDK install; it is a version lock, not a hash-verified supply-chain guarantee. Offline tests never call the SDK's network methods.
