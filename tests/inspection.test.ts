import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { attestMcpPins, mcpInventoryHash, pinToolDefinitions } from '@didis/client';
import { inspectArgs, inspectionExit, projection, publicEndpoint, text } from '../examples/shared.js';
const sample = JSON.parse(await readFile(new URL('../fixtures/inspection/synthetic.json', import.meta.url), 'utf8'));
const reviewed = JSON.parse(await readFile(new URL('../fixtures/tools/reviewed.json', import.meta.url), 'utf8'));

test('synthetic hashes are computed from raw reviewed definitions using published SDK', async () => {
  assert.equal(await mcpInventoryHash(reviewed), sample.inventoryHash);
  assert.deepEqual(await pinToolDefinitions(reviewed), { weather_forecast: sample.tools[0].definitionSha256 });
  assert.match(projection(sample, false)[0], /OFFLINE.*SYNTHETIC/);
  assert.equal(inspectionExit('AUTH_REQUIRED'), 3);
  assert.equal(inspectionExit('UNSUPPORTED'), 3);
});
test('input validation rejects secret-bearing and non-public URL forms', () => {
  for (const url of ['http://localhost/mcp','https://127.0.0.1/mcp','https://[::1]/mcp','https://host.local/mcp','https://u:p@did.is/mcp','https://did.is/mcp?secret=1','https://did.is/mcp#secret','https://did.is:8443/mcp']) assert.throws(() => publicEndpoint(url), /INPUT/);
  assert.equal(publicEndpoint('https://did.is/mcp'), 'https://did.is/mcp');
  assert.equal(inspectArgs([]).live, false);
  assert.equal(inspectArgs(['--live']).live, true);
  assert.throws(() => inspectArgs(['--endpoint','https://did.is/mcp']), /INPUT/);
});
test('remote output is control-stripped and bounded; malformed input is rejected', () => {
  assert.ok(!text('\x1b[31mhello\n').includes('\x1b'));
  assert.equal(text('x'.repeat(500)).length, 160);
  assert.throws(() => projection({} as never, true));
});
test('Python and TypeScript produce identical offline projection', () => {
  const python = spawnSync('python3', ['python/01-inspect-public-server/main.py'], { encoding: 'utf8' });
  assert.equal(python.status, 0, python.stderr);
  assert.equal(python.stdout.trim(), projection(sample, false).join('\n'));
});
test('attestMcpPins.ok alone accepts extra tools: strict policy must check unpinned', async () => {
  const pins = await pinToolDefinitions(reviewed);
  // Explicit inspection stub, NOT hosted observation or an authority response.
  const result = await attestMcpPins({ inspectMcp: async () => ({ ...sample, tools: [...sample.tools, { name: 'extra', definitionSha256: 'a'.repeat(64) }] }) } as never, 'https://sample.invalid/mcp', pins);
  assert.equal(result.ok, true);
  assert.deepEqual(result.unpinned, ['extra']);
  assert.equal(result.ok && result.unpinned.length === 0, false);
});
test('live inspection network error is nonzero, never synthetic success', () => {
  const command = spawnSync(process.execPath, ['--import', 'tsx', '--import', './tests/deny-network.ts', 'examples/01-inspect-public-server/main.ts', '--live'], { encoding: 'utf8' });
  assert.equal(command.status, 4);
  assert.match(command.stderr, /NETWORK_OR_PROTOCOL_ERROR/);
  assert.doesNotMatch(command.stdout, /SYNTHETIC|INSPECTED/);
});
test('all default commands complete with sockets and fetch forbidden', () => {
  for (const file of ['02-block-definition-drift', '01-inspect-public-server', '00-connect-didis']) {
    const command = spawnSync(process.execPath, ['--import', 'tsx', '--import', './tests/deny-network.ts', `examples/${file}/main.ts`], { encoding: 'utf8' });
    assert.equal(command.status, 0, command.stderr);
    assert.match(command.stdout, /OFFLINE/);
  }
});
