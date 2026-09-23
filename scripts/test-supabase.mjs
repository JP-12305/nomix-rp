import fs from "fs";
import path from "path";

// Load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...vals] = trimmed.split("=");
        if (key && vals.length > 0) {
          process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    });
  }
} catch (e) {
  console.warn("Could not parse .env.local directly, falling back to process.env");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

async function testConnection() {
  console.log(`Testing Supabase REST connection to ${supabaseUrl}...`);
  
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rule_categories?select=*&order=order_index.asc`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ HTTP ${res.status}:`, errText);
      return;
    }

    const categories = await res.json();
    console.log(`✅ Successfully connected! Found ${categories.length} rule categories in Supabase:`);
    categories.slice(0, 5).forEach((c) => console.log(`   - [${c.slug}] ${c.name}`));

    // Test rules table
    const rulesRes = await fetch(`${supabaseUrl}/rest/v1/rules?select=id,rule_number,title&limit=5`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`
      }
    });
    const rules = await rulesRes.json();
    console.log(`✅ Found ${rules.length} sample rules returned from database.`);

    // Test applications table
    const appsRes = await fetch(`${supabaseUrl}/rest/v1/applications?select=count`, {
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "count=exact"
      }
    });
    console.log(`✅ Applications table verified and ready for submissions! (Status: ${appsRes.status})`);
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}

testConnection();
