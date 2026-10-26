import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { fail, text } from '../shared.js';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('OFFLINE | no connection attempted. Use --live to connect to https://did.is/mcp.');
  console.log('The live example lists tools, then calls resolve_did for public sample did:web:did.is.');
} else if (args.length !== 1 || args[0] !== '--live') {
  fail(new Error('INPUT: use --live (no credentials or custom targets accepted)'));
} else {
  const client = new Client({ name: 'didis-connect-example', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL('https://did.is/mcp'), {
    reconnectionOptions: { maxRetries: 0, initialReconnectionDelay: 1000, maxReconnectionDelay: 1000, reconnectionDelayGrowFactor: 1 },
    requestInit: { signal: AbortSignal.timeout(30_000) },
  });
  console.log('LIVE | public DID.is MCP | read-only public sample | no account or API key');
  try {
    await client.connect(transport, { timeout: 15_000 });
    const listed = await client.listTools({}, { timeout: 15_000 });
    if (!listed.tools.some((tool) => tool.name === 'resolve_did')) throw new Error('Expected tool missing');
    console.log(`tools reported: ${listed.tools.length}`);
    console.log(`tool names: ${listed.tools.map((tool) => text(tool.name)).join(', ')}`);
    const result = await client.callTool({ name: 'resolve_did', arguments: { did: 'did:web:did.is' } }, undefined, { timeout: 15_000 });
    if (result.isError || !Array.isArray(result.content) || result.content.length === 0) throw new Error('Tool call failed');
    console.log('resolve_did returned non-error MCP content for did:web:did.is. Raw content omitted.');
    console.log('This proves a tool round trip, not protection of your other MCP tools.');
  } catch (error) { fail(error); }
  finally { await client.close(); await transport.close(); }
}
