import { pinToolDefinitions, toolDefinitionSha256, mcpInventoryHash } from '@didis/client';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export class Blocked extends Error {}
export type Baseline = { pins: Record<string, string>; inventoryHash: string };

/** Only call with definitions explicitly reviewed by a human, never first-seen remote input. */
export async function approveReviewed(tools: Tool[]): Promise<Baseline> {
  return { pins: await pinToolDefinitions(tools), inventoryHash: await mcpInventoryHash(tools) };
}

/** Strict example policy, not an SDK guard or delegation/authorization service. */
export function executionBoundary(client: Pick<Client, 'listTools' | 'callTool'>, baseline: Baseline) {
  // Keep private copies; callers cannot mutate an already-approved baseline.
  const pins = Object.freeze({ ...baseline.pins });
  const inventoryHash = baseline.inventoryHash;
  return async (name: string) => {
    if (!Object.hasOwn(pins, name)) throw new Blocked('MISSING_PIN');
    const tools: Tool[] = [];
    const cursors = new Set<string>();
    let cursor: string | undefined;
    for (let page = 0; ; page++) {
      if (page >= 10) throw new Blocked('INCOMPLETE_INVENTORY');
      // Protocol errors and timeouts propagate: execution never continues on failure.
      const result = await client.listTools(cursor ? { cursor } : {}, { timeout: 5_000 });
      tools.push(...result.tools);
      if (tools.length > 500) throw new Blocked('INCOMPLETE_INVENTORY');
      cursor = result.nextCursor;
      if (!cursor) break;
      if (cursors.has(cursor)) throw new Blocked('REPEATED_CURSOR');
      cursors.add(cursor);
    }
    // The SDK rejects duplicate names. Extra, missing, renamed tools are denied too.
    const currentPins = await pinToolDefinitions(tools);
    if (Object.keys(currentPins).some((tool) => !Object.hasOwn(pins, tool))) throw new Blocked('UNPINNED_TOOL');
    const selected = tools.find((tool) => tool.name === name);
    if (!selected) throw new Blocked('MISSING_TOOL');
    if (await toolDefinitionSha256(selected) !== pins[name]) throw new Blocked('TOOL_DRIFT');
    if (await mcpInventoryHash(tools) !== inventoryHash) throw new Blocked('INVENTORY_DRIFT');
    // The one execution point. Expose this closure, NOT the raw MCP client, to your caller.
    return client.callTool({ name, arguments: {} }, undefined, { timeout: 5_000 });
  };
}
