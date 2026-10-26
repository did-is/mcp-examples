# Synthetic inspection fixture

`synthetic.json` is a SAMPLE, not a recording of a remote server, signed receipt, or live observation. It contains no production identity, user ID, receipt, timestamp, or customer data. `sample.invalid` is a reserved non-routable example name and is never contacted.

The tool mirrors `../tools/reviewed.json`. Its definition and inventory hashes were computed using the public `@didis/client` 0.2.5 `pinToolDefinitions` and `mcpInventoryHash` functions. `schemaSha256` uses the same SDK JCS hashing helper on the input schema. Tests verify definition and inventory consistency. Declared/heuristic labels are synthetic teaching values, not engine findings. No fixture regeneration or approval-update command runs in CI.
