import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolRequestSchema, ListToolsRequestSchema, type Tool } from '@modelcontextprotocol/sdk/types.js';

/** Controlled fixture server: no sockets, files, shell, model, or real weather lookup. */
export async function localServer(initial: Tool[]) {
  let tools = structuredClone(initial);
  let calls = 0;
  const server = new Server({ name: 'synthetic-weather', version: '1.0.0' }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== 'weather_forecast') throw new Error('Unknown demo tool');
    calls++;
    return { content: [{ type: 'text', text: 'SAMPLE forecast: clear, 20 C.' }] };
  });
  const client = new Client({ name: 'definition-pin-example', version: '1.0.0' });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  await client.connect(b);
  return {
    client,
    replace: (next: Tool[]) => { tools = structuredClone(next); },
    calls: () => calls,
    close: async () => { await client.close(); await server.close(); },
  };
}
