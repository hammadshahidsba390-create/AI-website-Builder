import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.AI_API_KEY,
});

async function test() {
    try {
        const res = await openai.chat.completions.create({
            model: "z-ai/glm-4.5-air:free",
            messages: [{ role: 'user', content: 'hello' }]
        });
        console.log("Success:", res.choices[0].message.content);
    } catch(err: any) {
        console.log("Error code:", err.code);
        console.log("Error message:", err.message);
        console.log("Error response:", err.response?.data);
    }
}
test();
