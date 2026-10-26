import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { approveReviewed, executionBoundary } from '../examples/02-block-definition-drift/boundary.js';
import { localServer } from '../examples/02-block-definition-drift/local-server.js';

const reviewed: Tool[] = JSON.parse(await readFile(new URL('../fixtures/tools/reviewed.json', import.meta.url), 'utf8'));
const changed: Tool[] = JSON.parse(await readFile(new URL('../fixtures/tools/changed-description.json', import.meta.url), 'utf8'));

test('official MCP handler: unchanged executes, changed/missing/extra/renamed/duplicate never execute', async () => {
  const baseline = await approveReviewed(reviewed);
  const local = await localServer(reviewed);
  try {
    const call = executionBoundary(local.client, baseline);
    await call('weather_forecast');
    assert.equal(local.calls(), 1);
    for (const tools of [changed, [], [...reviewed, { name: 'extra', inputSchema: { type: 'object' as const } }],
      [{ ...reviewed[0], name: 'renamed' }], [...reviewed, ...reviewed]]) {
      local.replace(tools);
      await assert.rejects(call('weather_forecast'));
      assert.equal(local.calls(), 1);
    }
    await assert.rejects(executionBoundary(local.client, { ...baseline, pins: {} })('weather_forecast'), /MISSING_PIN/);
    assert.equal(local.calls(), 1);
  } finally { await local.close(); }
});

test('strict SDK pin contract rejects duplicate reviewed names', async () => {
  await assert.rejects(approveReviewed([...reviewed, ...reviewed]), /duplicate/);
});

test('list failure, repeated cursor, missing terminal page and >500 tools fail closed', async () => {
  const baseline = await approveReviewed(reviewed);
  for (const kind of ['error', 'repeat', 'endless', 'oversized', 'malformed', 'empty-cursor'] as const) {
    let executions = 0, pages = 0;
    const fake = {
      listTools: async () => {
        pages++;
        if (kind === 'error') throw new Error('Synthetic list failure');
        if (kind === 'malformed') return { tools: null };
        if (kind === 'empty-cursor') return { tools: reviewed, nextCursor: '' };
        if (kind === 'oversized') return { tools: Array.from({ length: 501 }, (_, n) => ({ ...reviewed[0], name: `tool_${n}` })) };
        return { tools: reviewed, nextCursor: kind === 'repeat' ? 'same' : String(pages) };
      },
      callTool: async () => { executions++; return { content: [] }; },
    };
    // Deliberately malformed protocol fixture: not a production client/authority.
    await assert.rejects(executionBoundary(fake as never, baseline)('weather_forecast'));
    assert.equal(executions, 0);
    assert.ok(pages <= 10);
  }
});

test('baseline mutation after construction cannot silently approve changed tools', async () => {
  const baseline = await approveReviewed(reviewed);
  const local = await localServer(changed);
  try {
    const call = executionBoundary(local.client, baseline);
    Object.assign(baseline, await approveReviewed(changed));
    await assert.rejects(call('weather_forecast'), /TOOL_DRIFT/);
    assert.equal(local.calls(), 0);
  } finally { await local.close(); }
});
