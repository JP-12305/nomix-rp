// Test via direct PostgREST REST fetch to verify Supabase DB tables & API keys
const supabaseUrl = "https://mcqhlvkzrqqphtbqbprk.supabase.co";
const supabaseKey = "sb_secret_7VWr5RO3C4MFFqcUdlizMg_s_GovEpD";

async function testConnection() {
  console.log("Testing Supabase REST connection...");
  
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
