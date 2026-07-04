const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5emFyY2R1cWZoYnZ6aWxpdGh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDI4NDMzMiwiZXhwIjoyMDk1ODYwMzMyfQ.IUh9tyGTuu_AiAS1vGWhEoq4HoW3tRkXJvQ2QqfX6NM";
const url = "https://ryzarcduqfhbvzilithu.supabase.co/rest/v1/";

async function run() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const data = await res.json();
    const paths = Object.keys(data.paths || {});
    console.log("All API Paths:");
    console.log(paths.filter(p => p.includes('rpc')));
  } catch (err) {
    console.error(err);
  }
}

run();
