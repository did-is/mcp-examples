# Security

For sensitive reports, use the contact published at [DID.is security.txt](https://did.is/.well-known/security.txt) and the [security policy](https://did.is/security). At the time this file was written, the published contact is **ai@did.is**. Do not put credentials, private identifiers, customer information, or sensitive endpoint URLs into a public GitHub issue.

These examples are not a security certification, authorization service, or prompt-injection defense guarantee. Read [the threat model](docs/LIMITATIONS.md) before adapting the execution boundary. Definitions, annotations, remote metadata and tool results are untrusted input; never execute or evaluate them as instructions.

No credentials are required by the default examples or offline CI. Keep any real integration's secrets outside this repository. Do not submit private endpoints to anonymous public inspection. If credentials were accidentally disclosed, revoke them through their issuer and report privately; do not repeat their values in an issue.
