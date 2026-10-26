# Contributing

Keep each example small, readable, and centered on an observable execution boundary. English code, comments and documentation. Prefer official SDKs and existing tools to a new framework, CLI platform, or UI.

```sh
npm ci
npm run check
npm test
python3 -m unittest discover -s python -p 'test_*.py'
```

Tests/demos must remain offline by default. Network use requires a visible `--live` choice, a bounded request budget, and a public endpoint you own or are authorized to inspect. Never add live production probes to CI, schedules, install hooks, or fork-controlled workflow inputs. No credentials or model keys are needed in CI.

- Commit only synthetic/public-safe fixtures and label their provenance. Never commit private endpoints, real user identifiers, production receipts, customer data, credentials, environment files, generated keys, or raw server response dumps.
- Don't automatically update pins on drift. Reviewed baseline changes require explicit review in the diff.
- Preserve failure causes and fail closed. Never fall back to fixtures after a live failure.
- Test denied attempts with actual handler entry counts where possible. A log saying BLOCKED is not sufficient evidence.
- Distinguish observation, definition equality and authorization. Do not add universal safety scores, certification badges, or claims of full prompt-injection prevention.
- Maintain the existing MIT license. This private npm manifest prevents accidental package publication; do not add package/release publishing workflows.

Use public GitHub issues only for non-sensitive bugs. Follow [SECURITY.md](SECURITY.md) for private reports.
