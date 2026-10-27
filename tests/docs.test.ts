import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

async function markdown(dir: string): Promise<string[]> {
  const paths: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) paths.push(...await markdown(path));
    else if (path.endsWith('.md')) paths.push(path);
  }
  return paths;
}
test('relative Markdown links resolve in the public tree', async () => {
  for (const path of await markdown(process.cwd())) {
    const body = await readFile(path, 'utf8');
    for (const [, link] of body.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(link)) continue;
      const target = resolve(dirname(path), link.split('#')[0]);
      const entry = await stat(target).catch(() => null);
      assert.ok(entry, `Broken relative link in ${path}: ${link}`);
      if (entry.isDirectory()) await stat(resolve(target, 'README.md'));
    }
  }
});

test('committed demo transcript is a successful actual recording with matching artifact hashes', async () => {
  const { createHash } = await import('node:crypto');
  const provenance = JSON.parse(await readFile('docs/demo/provenance.json', 'utf8'));
  assert.equal(provenance.exitCode, 0);
  assert.equal(provenance.mode, 'OFFLINE');
  assert.match(provenance.sourceCommit, /^[a-f0-9]{40}$/);
  for (const [file, hash] of Object.entries(provenance.sha256)) {
    assert.equal(createHash('sha256').update(await readFile(`docs/demo/${file}`)).digest('hex'), hash);
  }
  const [header, ...events] = (await readFile('docs/demo/drift.cast', 'utf8')).trim().split('\n').map((line) => JSON.parse(line));
  assert.equal(header.version, 2);
  assert.equal(header.command, 'npm run demo:drift');
  assert.ok(events.every((event, index) => event[1] === 'o' && event[0] >= (events[index - 1]?.[0] ?? 0)));
  const transcript = await readFile('docs/demo/drift.txt', 'utf8');
  assert.equal(events.map((event) => event[2]).join('').replaceAll('\r\n', '\n'), transcript);
  assert.match(transcript, /UNCHANGED\s+EXECUTED\s+handler calls for attempt: 1/);
  for (const label of ['CHANGED DESCRIPTION', 'MISSING PIN', 'ADDED TOOL']) {
    assert.match(transcript, new RegExp(`${label}\\s+BLOCKED\\s+handler calls for attempt: 0`));
  }
  assert.doesNotMatch(transcript, /\/home\/|Bearer |api[_-]?key\s*[:=]/i);
});
