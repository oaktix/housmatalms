const { Client } = require('pg');

const host = "aws-0-eu-north-1.pooler.supabase.com"; // IPv4 pooler host
const servername = "db.ryzarcduqfhbvzilithu.supabase.co"; // SNI domain
const password = "Hous@Mata2026!";

async function run() {
  console.log(`Connecting to pooler ${host} with SNI ${servername}...`);
  
  const client = new Client({
    host: host,
    port: 5432, // Try standard port for SNI
    database: "postgres",
    user: "postgres", // Just postgres!
    password: password,
    ssl: {
      servername: servername,
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log("SUCCESS! SNI connection established over IPv4!");
    await client.end();
  } catch (err) {
    console.error("FAILED:", err.message);
    try { await client.end(); } catch (e) {}
  }
}

run();
