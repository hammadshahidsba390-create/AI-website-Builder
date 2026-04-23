import OpenAI from 'openai';

interface AIProvider {
    name: string;
    client: OpenAI;
    models: string[];
}

class AIService {
    private providers: AIProvider[] = [];

    constructor() {
        // 1. Groq (PRIMARY - Fastest, highest accuracy)
        if (process.env.GROQ_API_KEY) {
            this.providers.push({
                name: 'groq',
                client: new OpenAI({
                    baseURL: "https://api.groq.com/openai/v1",
                    apiKey: process.env.GROQ_API_KEY,
                }),
                models: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768']
            });
        }

        // 2. Together AI (SECONDARY - Good quality models)
        if (process.env.TOGETHER_API_KEY) {
            this.providers.push({
                name: 'together',
                client: new OpenAI({
                    baseURL: "https://api.together.xyz/v1",
                    apiKey: process.env.TOGETHER_API_KEY,
                }),
                models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'meta-llama/Llama-3-70b-chat-hf']
            });
        }

        // 3. OpenRouter (TERTIARY - Wide model selection)
        if (process.env.AI_API_KEY) {
            this.providers.push({
                name: 'openrouter',
                client: new OpenAI({
                    baseURL: "https://openrouter.ai/api/v1",
                    apiKey: process.env.AI_API_KEY,
                }),
                models: ['deepseek/deepseek-chat', 'google/gemini-pro-1.5', 'anthropic/claude-3-haiku']
            });
        }

        // 4. HuggingFace (LAST RESORT - Free tier fallback)
        if (process.env.HF_TOKEN) {
            this.providers.push({
                name: 'huggingface',
                client: new OpenAI({
                    baseURL: "https://api-inference.huggingface.co/v1/",
                    apiKey: process.env.HF_TOKEN,
                }),
                models: ['meta-llama/Llama-3.2-3B-Instruct', 'mistralai/Mistral-7B-Instruct-v0.3']
            });
        }

        console.log(`[AI] Initialized ${this.providers.length} providers: ${this.providers.map(p => p.name).join(' → ')}`);
    }

    private extractHTML(content: string): string {
        // Try to find HTML in code blocks first
        const codeBlockMatch = content.match(/```html([\s\S]*?)```/);
        if (codeBlockMatch) {
            return codeBlockMatch[1].trim();
        }

        // Try to find a full HTML document
        const docMatch = content.match(/(<!DOCTYPE html>[\s\S]*<\/html>)/i);
        if (docMatch) {
            return docMatch[1].trim();
        }

        // Try to find content starting with <html
        const htmlMatch = content.match(/(<html[\s\S]*<\/html>)/i);
        if (htmlMatch) {
            return htmlMatch[1].trim();
        }

        // Fallback: strip markdown artifacts and return as-is
        return content
            .replace(/```[a-z]*\n?/gi, '')
            .replace(/```$/g, '')
            .trim();
    }

    async generateContent(systemPrompt: string, userPrompt: string): Promise<string> {
        let lastError = null;

        for (const provider of this.providers) {
            for (const model of provider.models) {
                try {
                    console.log(`[AI] Trying ${provider.name} → ${model}`);
                    const response = await provider.client.chat.completions.create({
                        model: model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        temperature: 0.7,
                        max_tokens: 4000,
                    });

                    const rawContent = response.choices[0]?.message?.content || '';
                    if (!rawContent || rawContent.length < 50) {
                        console.warn(`[AI] ${provider.name} (${model}) returned empty/short response, skipping`);
                        continue;
                    }

                    console.log(`[AI] ✅ Success with ${provider.name} → ${model} (${rawContent.length} chars)`);
                    return this.extractHTML(rawContent);

                } catch (error: any) {
                    console.error(`[AI] ❌ ${provider.name} (${model}) failed:`, error.message);
                    lastError = error;
                }
            }
        }

        throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
    }

    async enhancePrompt(prompt: string): Promise<string> {
        const systemPrompt = `
        You are a prompt enhancement specialist. Expand the user's website request into a professional web developer brief.
        Include details on:
        - Modern UI/UX (Glassmorphism, animations, hover effects)
        - Layout structure (Hero section, Grid, Flexbox)
        - Color palette, typography, and spacing
        - Responsive design requirements
        Return ONLY the enhanced request in 1-2 paragraphs. No code, no analysis.
        `;

        return this.generateContent(systemPrompt, prompt);
    }
}

export const aiService = new AIService();
