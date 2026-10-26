import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { approveReviewed, executionBoundary } from './boundary.js';
import { localServer } from './local-server.js';

const reviewed = JSON.parse(await readFile(new URL('../../fixtures/tools/reviewed.json', import.meta.url), 'utf8'));
const changed = JSON.parse(await readFile(new URL('../../fixtures/tools/changed-description.json', import.meta.url), 'utf8'));
// Approval is explicit: this committed SAMPLE definition was reviewed, not fetched and auto-approved.
const baseline = await approveReviewed(reviewed);
const local = await localServer(reviewed);
console.log('OFFLINE | controlled MCP server | public DID.is SDK 0.2.5 | no authority service');
try {
  const call = executionBoundary(local.client, baseline);
  await call('weather_forecast');
  assert.equal(local.calls(), 1);
  console.log('UNCHANGED           EXECUTED   handler calls for attempt: 1');
  local.replace(changed);
  await assert.rejects(call('weather_forecast'), /TOOL_DRIFT/);
  assert.equal(local.calls(), 1);
  console.log('CHANGED DESCRIPTION BLOCKED    handler calls for attempt: 0');
  await assert.rejects(executionBoundary(local.client, { ...baseline, pins: {} })('weather_forecast'), /MISSING_PIN/);
  assert.equal(local.calls(), 1);
  console.log('MISSING PIN         BLOCKED    handler calls for attempt: 0');
  local.replace([...reviewed, { name: 'unexpected_tool', inputSchema: { type: 'object' } }]);
  await assert.rejects(call('weather_forecast'), /UNPINNED_TOOL/);
  assert.equal(local.calls(), 1);
  console.log('ADDED TOOL          BLOCKED    handler calls for attempt: 0');
  console.log('PASS | unchanged executes; denied attempts do not enter the handler.');
  console.log('This checks definition equality, not behavior, identity, or delegation authority.');
} finally {
  await local.close();
}
