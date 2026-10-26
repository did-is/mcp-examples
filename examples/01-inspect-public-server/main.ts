import { readFile } from 'node:fs/promises';
import { DidisClient, type McpInspection } from '@didis/client';
import { fail, inspectArgs, inspectionExit, projection } from '../shared.js';

try {
  const { live, endpoint } = inspectArgs(process.argv.slice(2));
  // One logical API call, no SDK retry. Public inputs may enter shared observation history.
  const result: McpInspection = live
    ? await new DidisClient({ retry: false, timeoutMs: 30_000 }).inspectMcp(endpoint)
    : JSON.parse(await readFile(new URL('../../fixtures/inspection/synthetic.json', import.meta.url), 'utf8'));
  console.log(projection(result, live).join('\n'));
  process.exitCode = inspectionExit(result.status);
} catch (error) { fail(error); }
