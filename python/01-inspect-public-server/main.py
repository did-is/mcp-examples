"""Offline by default. Live inspection uses the public didis-py SDK, with no retries."""
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit


def text(value):
    return re.sub(r"[\x00-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]", "", str(value if value is not None else "not reported"))[:160]


def fingerprint(value):
    return value if isinstance(value, str) and re.fullmatch(r"[a-f0-9]{64}", value) else "not reported"


def endpoint(raw):
    try:
        url = urlsplit(raw)
        host = url.hostname or ""
        valid = ("?" not in raw and "#" not in raw and url.scheme == "https" and not url.username and not url.password
                 and not url.query and not url.fragment and url.port in (None, 443)
                 and "." in host and not re.fullmatch(r"[\d.]+", host) and ":" not in host
                 and not re.search(r"\.(localhost|local|internal|test|invalid|example)$", host))
    except ValueError:
        valid = False
    if not valid:
        raise ValueError("INPUT: use public HTTPS, port 443, no credentials/query/fragment or IP literal")
    return raw


def projection(result, live):
    if (not isinstance(result.get("status"), str) or not isinstance(result.get("tools"), list)
            or not isinstance(result.get("limitations"), list) or not isinstance(result.get("drift"), dict)
            or not isinstance(result.get("checks"), list)):
        raise RuntimeError("Malformed inspection")
    lines = [
        ("LIVE | hosted DID.is observation" if live else "OFFLINE | SYNTHETIC SAMPLE (not an observation)") + " | SDK 0.2.5",
        f"status: {text(result['status'])}",
        f"protocol: {text(result.get('negotiatedVersion'))} | mode: {text(result.get('mode'))}",
        f"tools reported: {len(result['tools'])} | inventoryHash: {fingerprint(result.get('inventoryHash'))}",
        f"jcsProfile: {text(result.get('jcsProfile'))}",
    ]
    for tool in result["tools"]:
        lines.extend([
            f"tool: {text(tool.get('name'))} | definitionSha256: {fingerprint(tool.get('definitionSha256'))} | schemaSha256: {fingerprint(tool.get('schemaSha256'))}",
            f"  declared: {text(tool.get('declaredClass'))} | heuristic: {text(tool.get('heuristicClass'))}",
        ])
    lines.append(f"public-history drift: {text(result['drift'].get('status'))} (not your approval baseline)")
    lines.extend(f"check: {text(c.get('id'))} | {text(c.get('status'))}" for c in result["checks"])
    lines.extend(f"limitation: {text(value)}" for value in result["limitations"])
    lines.append("Definitions and heuristics are evidence, not a safety certificate or behavior guarantee.")
    return lines


def main(args):
    live = bool(args)
    if live and (args[0] != "--live" or len(args) not in (1, 3) or (len(args) == 3 and args[1] != "--endpoint")):
        print("INPUT: use --live [--endpoint PUBLIC_HTTPS_URL]", file=sys.stderr)
        return 64
    try:
        if live:
            target = endpoint(args[2] if len(args) == 3 else "https://did.is/mcp")
            # Imported only in live mode: offline demo/tests need only the Python standard library.
            from didis import DidisClient
            with DidisClient(retry=False, timeout=30.0) as client:
                result = client.inspect_mcp(target)
        else:
            result = json.loads((Path(__file__).resolve().parents[2] / "fixtures/inspection/synthetic.json").read_text())
        print("\n".join(projection(result, live)))
        return 0 if result["status"] == "INSPECTED" else 3
    except json.JSONDecodeError:
        print("PARSE_ERROR: no fixture fallback.", file=sys.stderr)
        return 4
    except ValueError:
        print("INPUT: check the public HTTPS URL.", file=sys.stderr)
        return 64
    except Exception as error:
        status = getattr(error, "status", None)
        if status == 429:
            print("RATE_LIMITED: wait for Retry-After; retry manually later.", file=sys.stderr)
        elif status in (401, 403):
            print("AUTH_REQUIRED: access restriction, not evidence of malicious behavior.", file=sys.stderr)
            return 3
        elif status in (400, 422):
            print("UNSUPPORTED_OR_INVALID: check the endpoint and protocol support.", file=sys.stderr)
            return 3
        else:
            print("NETWORK_OR_PROTOCOL_ERROR: no fixture fallback. Check connectivity and compatibility.", file=sys.stderr)
        return 4


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
