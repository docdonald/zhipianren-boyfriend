import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, ssl: { rejectUnauthorized: false } });

async function main() {
  const filePath = resolve(process.cwd(), "scripts", "init-neon.sql");
  const sqlContent = readFileSync(filePath, "utf-8");

  // Split by semicolon and filter out empty statements
  const statements = sqlContent
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    const fullStmt = stmt + ";";
    try {
      await sql.unsafe(fullStmt);
      console.log("OK:", fullStmt.substring(0, 60) + "...");
    } catch (e: any) {
      console.error("ERR:", e.message);
      console.error("SQL:", fullStmt);
    }
  }

  await sql.end();
  console.log("Done");
}

main();
