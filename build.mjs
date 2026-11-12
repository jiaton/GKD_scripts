// Builds subscription.json5 from rules/<appId>/*.json5 (one rule group per file).
// The version is bumped only when the rules change, so GKD sees an update exactly then.
// Every selector is compiled with GKD's own parser; a bad one fails the build.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import JSON5 from 'json5';
import { Selector } from '@gkd-kit/selector';

const OUT = 'subscription.json5';
const RAW = 'https://raw.githubusercontent.com/jiaton/GKD_scripts/main';
const APP_NAMES = {
  'com.tencent.mm': '微信',
  'com.samsung.android.incallui': '三星通话',
  'com.android.settings': '设置',
};

const errors = [];
const checkSelectors = (where, list) => {
  for (const s of [list ?? []].flat()) {
    try {
      Selector.compile(s).value; // throws SelectorSyntaxException on a bad selector
    } catch (e) {
      errors.push(`${where}: ${s}\n  ${e.message}`);
    }
  }
};

const apps = readdirSync('rules').sort().map((id) => {
  const groups = readdirSync(`rules/${id}`).filter((f) => f.endsWith('.json5')).sort()
    .map((f) => ({ file: `rules/${id}/${f}`, g: JSON5.parse(readFileSync(`rules/${id}/${f}`, 'utf8')) }));
  const keys = new Set();
  for (const { file, g } of groups) {
    if (keys.has(g.key)) errors.push(`${file}: duplicate group key ${g.key} in ${id}`);
    keys.add(g.key);
    for (const r of g.rules ?? []) {
      for (const k of ['matches', 'anyMatches', 'excludeMatches', 'excludeAllMatches'])
        checkSelectors(`${file} rule ${r.key} ${k}`, r[k]);
    }
  }
  return { id, name: APP_NAMES[id] ?? id, groups: groups.sort((a, b) => a.g.key - b.g.key).map((x) => x.g) };
});

if (errors.length) {
  console.error('Invalid rules:\n' + errors.join('\n'));
  process.exit(1);
}

const prev = existsSync(OUT) ? JSON5.parse(readFileSync(OUT, 'utf8')) : null;
const changed = !prev || JSON.stringify(prev.apps) !== JSON.stringify(apps);
const sub = {
  id: 20251216,
  name: 'jiaton GKD rules',
  version: changed ? (prev?.version ?? 0) + 1 : prev.version,
  author: 'jiaton',
  updateUrl: `${RAW}/${OUT}`,
  supportUri: 'https://github.com/jiaton/GKD_scripts',
  apps,
};
writeFileSync(OUT, JSON.stringify(sub, null, 2) + '\n');
console.log(changed ? `built ${OUT} v${sub.version}` : `${OUT} unchanged (v${sub.version})`);
if (process.argv.includes('--check') && changed) {
  console.error(`${OUT} was stale; run npm run build and commit it`);
  process.exit(1);
}
