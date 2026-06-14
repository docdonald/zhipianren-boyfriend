const postgres = require("postgres");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, ssl: { rejectUnauthorized: false } });

async function main() {
  try {
    await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "password" text`;
    console.log("OK: password column added");
  } catch (e) {
    console.error("ERR:", e.message);
  } finally {
    await sql.end();
  }
}

main();
