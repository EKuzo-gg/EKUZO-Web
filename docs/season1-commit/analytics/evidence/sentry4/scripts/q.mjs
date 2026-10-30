// READ-ONLY query helper. Usage: node --env-file=.env.test.local q.mjs "<SELECT ...>" [params json]
import { neon } from '/home/claude/ekuzo-web/node_modules/@neondatabase/serverless/index.mjs';
const q = process.argv[2];
if (!/^\s*select\b/i.test(q) || /;\s*\S/.test(q) || /\b(insert|update|delete|alter|drop|create|truncate|grant)\b/i.test(q)) { console.error('refused: SELECT only'); process.exit(2); }
const params = process.argv[3] ? JSON.parse(process.argv[3]) : [];
const sql = neon(process.env.DATABASE_URL);
const host = new URL(process.env.DATABASE_URL).hostname.split('.')[0];
const [rows] = await sql.transaction([sql.query(q, params)], { readOnly: true, isolationLevel: 'ReadCommitted' });
console.log(JSON.stringify({ host, rows }, null, 1));
