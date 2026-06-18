const http = require('http');

const PORT = process.env.PORT || 3001;

console.log("=================================================");
console.log("🚀 Starting Local Notification Queue Worker...");
console.log(`This script will ping the local Next.js queue every 10 seconds.`);
console.log(`Make sure you are running 'npm run dev' on port ${PORT} in another terminal!`);
console.log("=================================================\n");

setInterval(() => {
  http.get(`http://127.0.0.1:${PORT}/api/cron/process-notifications`, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.processed > 0) {
          console.log(`[${new Date().toLocaleTimeString()}] ✅ Processed ${json.processed} emails/notifications!`);
        } else {
          console.log(`[${new Date().toLocaleTimeString()}] 💤 Queue empty. No pending emails.`);
        }
      } catch (e) {
        console.log(`[${new Date().toLocaleTimeString()}] ⚠️ Error reading response. Is localhost:${PORT} running?`);
      }
    });
  }).on("error", (err) => {
    console.log(`[${new Date().toLocaleTimeString()}] ⚠️ Could not connect. Make sure your Next.js dev server is running on port ${PORT}!`);
  });
}, 10000);

// Run immediately on start
http.get(`http://127.0.0.1:${PORT}/api/cron/process-notifications`).on("error", () => {});
