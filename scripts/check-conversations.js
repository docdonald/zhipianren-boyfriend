const postgres = require("postgres");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, ssl: { rejectUnauthorized: false } });

async function main() {
  try {
    const rows = await sql`SELECT user_id, character_id, role, LEFT(content, 50) as content, created_at FROM "conversation" ORDER BY created_at DESC LIMIT 10`;
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await sql.end();
  }
}

main();
