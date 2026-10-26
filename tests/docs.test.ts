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
