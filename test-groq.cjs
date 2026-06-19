const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

// Load API key from environment variables or .env file
let apiKey = process.env.VITE_GROQ_API_KEY;
if (!apiKey) {
  try {
    const envPath = path.resolve(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const match = envContent.match(/^VITE_GROQ_API_KEY=(.*)$/m);
      if (match && match[1]) {
        apiKey = match[1].trim();
      }
    }
  } catch (e) {
    // Ignore error
  }
}

const groq = new Groq({ apiKey: apiKey || 'YOUR_GROQ_API_KEY' });

async function main() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'hello' }],
      model: 'llama-3.3-70b-versatile',
    });
    console.log(chatCompletion.choices[0].message.content);
  } catch (e) {
    console.error('Groq Error:', e.message);
  }
}
main();
