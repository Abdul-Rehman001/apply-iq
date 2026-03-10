const https = require('https');
const fs = require('fs');
const path = require('path');

function getEnv(key) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return null;
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(new RegExp(`${key}=(.*)`));
  return match ? match[1].trim() : null;
}

const apiKey = getEnv('GEMINI_API_KEY');

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

console.log(`🔍 Fetching ALL available models for key: ${apiKey.substring(0, 5)}...`);

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) {
        console.error("❌ API Error:", json.error.message);
      } else if (json.models) {
        console.log("\n📋 Available Models:");
        json.models.forEach(m => {
          // Clean up the name (remove 'models/')
          const shortName = m.name.replace('models/', '');
          console.log(`- ${shortName}`);
        });
        
        console.log("\n💡 Recommended models to try in .env.local if ones fail:");
        console.log("gemini-1.5-flash");
        console.log("gemini-1.5-pro");
        console.log("gemini-1.0-pro");
      }
    } catch (e) {
      console.error("❌ Failed to parse response");
    }
  });
}).on('error', (err) => {
  console.error("❌ Network Error:", err.message);
});
