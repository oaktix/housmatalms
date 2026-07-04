const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

dns.setDefaultResultOrder('ipv6first');

const regions = [
  "eu-north-1", // Stockholm (your region)
  "eu-central-1", "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "ap-northeast-1", "ap-northeast-2", "ap-south-1",
  "ap-southeast-1", "ap-southeast-2", "ca-central-1",
  "eu-west-1", "eu-west-2", "eu-west-3", "sa-east-1"
];

const password = "Hous@Mata2026!";
const username = "postgres.ryzarcduqfhbvzilithu";
const dbName = "postgres";

const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260703_add_phase2_class_selection.sql'), 'utf8');

async function run() {
  console.log("Migration SQL to execute:");
  console.log(sql);

  // Try direct connection first
  {
    const host = "[2a05:d016:dd0:9401:9b9e:6609:3219:d398]";
    console.log(`Trying direct connection to: ${host} on port 5432...`);
    const client = new Client({
      host: host,
      port: 5432,
      database: dbName,
      user: "postgres",
      password: password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    try {
      await client.connect();
      console.log("Direct connection successful! Running migration...");
      const res = await client.query(sql);
      console.log("Migration completed successfully!");
      console.log(res);
      await client.end();
      return;
    } catch (err) {
      console.error("Direct connection failed:", err);
      try { await client.end(); } catch (e) {}
    }
  }
  
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Trying region: ${region} (${host})...`);
    
    const client = new Client({
      host: host,
      port: 5432,
      database: dbName,
      user: username,
      password: password,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 5000
    });
    
    try {
      await client.connect();
      console.log(`Connected to region ${region}! Running migration...`);
      const res = await client.query(sql);
      console.log("Migration completed successfully!");
      console.log(res);
      await client.end();
      return;
    } catch (err) {
      console.error(`Failed for region ${region}:`, err);
      try {
        await client.end();
      } catch (e) {}
    }
  }
  
  console.error("All regions failed!");
  process.exit(1);
}

run();
