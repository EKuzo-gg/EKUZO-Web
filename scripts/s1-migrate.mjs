/**
 * Season 01 migration runner.
 *   node --env-file=.env.local scripts/s1-migrate.mjs [--live]
 * Applies each db/migrations/*.sql not yet recorded in s1_migrations. Each
 * file (its statements plus the record insert) runs in one transaction over
 * the Neon HTTP driver. Refuses any host other than the Neon test endpoint
 * unless --live. Prints only file names and counts.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const TEST_ENDPOINT = "ep-lively-boat-b4fak1h6";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "db", "migrations");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
const live = process.argv.includes("--live");
let hostLabel = "";
try {
  hostLabel = new URL(url).hostname.toLowerCase().split(".")[0];
} catch {
  console.error("DATABASE_URL is not a valid URL");
  process.exit(1);
}
// Same rule as isTestDbUrl in lib/season1/mode.ts (plain node here, no TS import):
// the endpoint id must be the host's first label (or its prefix, e.g. "-pooler").
const hostIsTest = hostLabel === TEST_ENDPOINT || hostLabel.startsWith(`${TEST_ENDPOINT}-`);
if (!live && !hostIsTest) {
  console.error("Refusing: DATABASE_URL is not the Neon test endpoint (pass --live to override).");
  process.exit(1);
}

/**
 * Split SQL into statements on ';' at end of line, outside $$ blocks.
 * Full-line "--" comments are dropped first.
 */
export function splitStatements(sqlText) {
  const out = [];
  let cur = [];
  let inDollar = false;
  for (const line of sqlText.split(/\r?\n/)) {
    if (!inDollar && line.trim().startsWith("--")) continue;
    cur.push(line);
    const dollars = (line.match(/\$\$/g) || []).length;
    if (dollars % 2 === 1) inDollar = !inDollar;
    if (!inDollar && line.trimEnd().endsWith(";")) {
      const stmt = cur.join("\n").trim().replace(/;$/, "").trim();
      if (stmt) out.push(stmt);
      cur = [];
    }
  }
  const rest = cur.join("\n").trim().replace(/;$/, "").trim();
  if (rest) out.push(rest);
  return out;
}

const sql = neon(url);
await sql`create table if not exists s1_migrations (name text primary key, applied_at timestamptz default now())`;
const applied = new Set((await sql`select name from s1_migrations`).map((r) => r.name));
const files = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();

let ran = 0;
for (const file of files) {
  if (applied.has(file)) {
    console.log(`skip   ${file} (already applied)`);
    continue;
  }
  const statements = splitStatements(readFileSync(join(DIR, file), "utf8"));
  const queries = statements.map((s) => sql.query(s));
  queries.push(sql`insert into s1_migrations (name) values (${file})`);
  await sql.transaction(queries);
  console.log(`apply  ${file} (${statements.length} statements)`);
  ran++;
}
console.log(`done: ${ran} applied, ${files.length - ran} skipped`);
