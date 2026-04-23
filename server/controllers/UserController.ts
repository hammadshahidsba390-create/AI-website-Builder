import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
controllers-or-stripe-add
import Stripe from 'stripe';

// Get user credits 
export const getusercredits = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized user' })

import { int } from 'better-auth';
import OpenAI from 'openai';
import openai from '../configs/openai.js';
import { role } from 'better-auth/client';
import { Content } from 'openai/resources/skills.mjs';
import { time } from 'node:console';

const FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "qwen/qwen3-coder:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "z-ai/glm-4.5-air:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "openai/gpt-oss-120b:free",
  "openrouter/free"
];

const AI_PROVIDERS = [
  {
    name: "Groq",
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
  },
  {
      name: "TogetherAI",
      apiKey: process.env.TOGETHER_API_KEY,
      baseURL: "https://api.together.xyz/v1",
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  },
  {
      name: "HuggingFace",
      apiKey: process.env.HF_TOKEN,
      baseURL: "https://router.huggingface.co/v1",
      model: "deepseek-ai/DeepSeek-V3",
  },
  {
    name: "OpenRouter",
    apiKey: process.env.AI_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    // Special flag to indicate we use the dynamic fallback loop for OpenRouter
    useOpenRouterLoop: true 
  }
];

export async function createChatCompletionWithFallback(messages: any[]) {
    for (const provider of AI_PROVIDERS) {
        if (!provider.apiKey) {
            console.log(`Skipping ${provider.name} because API Key is not configured.`);
            continue;
        }

        if (provider.useOpenRouterLoop) {
            // Handle OpenRouter with its own internal model loop 
            console.log("Entering OpenRouter Fallback Loop...");
            for (const model of FREE_MODELS) {
                try {
                    console.log(`Attempting generation with OpenRouter model: ${model}`);
                    const response = await openai.chat.completions.create({
                        model: model,
                        messages: messages
                    });
                    if (!response?.choices?.[0]?.message?.content) {
                        throw new Error(`Model ${model} returned an invalid or empty response.`);
                    }
                    console.log(`Success with OpenRouter model: ${model}`);
                    return response;
                } catch (error: any) {
                    console.error(`Failed with OpenRouter model ${model}:`, error?.response?.data?.error?.message || error.message || "Unknown error");
                }
            }
            continue; // Move to next provider if all OpenRouter models fail
        }

        // Standard OpenAI-compatible Provider (Groq, Together, HF)
        try {
            console.log(`Attempting generation with Provider: ${provider.name} (${provider.model})`);
            const customClient = new OpenAI({
                apiKey: provider.apiKey,
                baseURL: provider.baseURL
            });
            const response = await customClient.chat.completions.create({
                model: provider.model!,
                messages: messages
            });
            if (!response?.choices?.[0]?.message?.content) {
                throw new Error(`Provider ${provider.name} returned an invalid or empty response.`);
            }
            console.log(`Success with Provider: ${provider.name}`);
            return response;
        } catch (error: any) {
            console.error(`Failed with Provider ${provider.name}:`, error?.response?.data?.error?.message || error.message || "Unknown error");
        }
    }

    throw new Error("CRITICAL FAILURE: Every configured AI Provider (Groq, Together, HF, and OpenRouter) failed to respond. Please check your API keys and quotas.");
}

export function extractHTML(content: string) {
    // 1. Find the first occurrence of a valid opening tag
    const startTags = [
        { regex: /<!DOCTYPE/i, close: "</html>" },
        { regex: /<html/i, close: "</html>" },
        { regex: /<body/i, close: "</body>" },
        { regex: /<div/i, close: "</div>" }
    ];

    let firstIndex = -1;
    let closingTag = "";

    for (const tag of startTags) {
        const match = content.match(tag.regex);
        if (match && (firstIndex === -1 || match.index! < firstIndex)) {
            firstIndex = match.index!;
            closingTag = tag.close;
        }
    }

    if (firstIndex !== -1) {
        // Find the last occurrence of the appropriate closing tag
        let lastIndex = content.toLowerCase().lastIndexOf(closingTag.toLowerCase());
        
        if (lastIndex !== -1) {
            return content.substring(firstIndex, lastIndex + closingTag.length).trim();
        } else {
            // If no closing tag is found, the model might have been cut off
            // Return everything from the first index to the end
            return content.substring(firstIndex).trim();
        }
    }

    // Final fallback: Strip common AI conversational noise and code fences
    return content
        .replace(/^(Certainly|Sure|Here is|I have|Here's).*?\n/gi, '') 
        .replace(/```[a-z]*\n?/gi, '')
        .replace(/```$/g, '')
        .trim();
}

// Get user credits  
export const getusercredits=async (req: Request, res: Response)=>{
    try{
        const userId=req.userId;
        if(!userId){
            return res.status(401).json({message:'Unauthorized user'})
 main
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        res.json({ credits: user?.credits })
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.code || error.message });
    }
}

// controller function to purchase credits
export const purchaseCredits = async (req: Request, res: Response) => {
    try {
        interface Plan {
            credits: number;
            amount: number;
        }
        const plans = {
            basic: { credits: 100, amount: 5 },
            pro: { credits: 400, amount: 19 },
            Enterprise: { credits: 1000, amount: 49 }
        }
        const userId = req.userId;
        const { planId } = req.body as { planId: keyof typeof plans };
        const origin = req.headers.origin as string;

 controllers-or-stripe-add
        const plan: Plan = plans[planId];

        if (!plan) {
            return res.status(400).json({ message: 'Plan not found' })
        }
        
        const transaction = await prisma.transaction.create({
            data: {
                userId: userId!,
                planId: req.body.planId,
                amount: plan.amount,
                credits: plan.credits
            }
        })
        
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/loading`,
            cancel_url: `${origin}`,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `AiSiteBuilder-${plan.credits} Credits`
                        },
                        unit_amount: Math.floor(transaction.amount * 100)
                    },
                    quantity: 1

        // create a new project
        const project=await prisma.websiteProject.create({
            data:{
                name:initial_prompt.length >50 ? initial_prompt.substring(0,47)
                + '...' : initial_prompt,
                initial_prompt,
                userId
            }
    })

        // UPDATE USER'S TOTAL CREATION

        await prisma.user.update({
            where:{id:userId},
            data:{totalCreation:{increment:1}}
        })

        await prisma.conversation.create({
            data:{
            role:'user',
            content:initial_prompt,
            projectId:project.id
            }
        })

        await prisma.user.update({
            where:{id:userId},
            data:{credits:{decrement:5}}
        })

        res.json({projectId:project.id})

        //Enhance user prmpt
        const promtEnhanceResponse = await createChatCompletionWithFallback([
                {
                   role: "system",
            content: `
            you are a prompt enhancement specialist. Take the user's website 
            request and expand it into a detailed, comprehensive prompt that will help 
            to create the best possible website.

            enhance this prompt by:
            1. adding specific design details (layout, color scheme, typography)
            2. specifying key sections and features
            3. describing the user experience and interactions
            4. including modern web design best practices
            5. mentioning responsive design requirements
            6. adding any missing but important elements
            
                    
                    Return ONLY the enhanced prompt, nothing else.Make it detailed but
                    concise (2-3 paragraph max).`
                },
                {
                    role:'user',
                    content:initial_prompt
                }
            ]);

        const enhancedPrompt=promtEnhanceResponse.choices[0].message.content;
        await prisma.conversation.create({
            data:{
            role:'assistant',
            content: `I've enhanced your prompt to :"${enhancedPrompt}"`,
            projectId:project.id
            }
        })

        await prisma.conversation.create({
            data:{
            role:'assistant',
            content: `now generating your website...`,
            projectId:project.id
            }
        })

        //generate website content/code

        const codeGenerationResponse=await createChatCompletionWithFallback([
                {
                    role: "system",
                    content: `
                    You are an expert web developer. Create a complete, production-ready, single-page website based on this request: "${enhancedPrompt}"

                    CRITICAL REQUIREMENTS:
                    - You MUST output valid HTML ONLY. 
                    - Use Tailwind CSS for ALL styling
                    - Include this EXACT script in the <head>: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                    - Use Tailwind utility classes extensively for styling, animations, and responsiveness
                    - Make it fully functional and interactive with JavaScript in <script> tag before closing </body>
                    - Use modern, beautiful design with great UX using Tailwind classes
                    - Make it responsive using Tailwind responsive classes (sm:, md:, lg:, xl:)
                    - Use Tailwind animations and transitions (animate-*, transition-*)
                    - Include all necessary meta tags
                    - Use Google Fonts CDN if needed for custom fonts
                    - Use placeholder images from https://placehold.co/600x400
                    - Use Tailwind gradient classes for beautiful backgrounds
                    - Make sure all buttons, cards, and components use Tailwind styling

                    CRITICAL HARD RULES:
                    1. You MUST put ALL output ONLY into message.content.
                    2. You MUST NOT include internal thoughts, explanations, analysis, comments, or markdown.
                    3. Do NOT include markdown, explanations, notes, or code fences.
                    4. Start your response IMMEDIATELY with <!DOCTYPE html> and end with </html>. 
                    5. Absolutely NO text, symbols, or hidden tags (like <thinking> or <reasoning>) before or after the code.

                    The HTML should be complete and ready to render as-is with Tailwind CSS.`
                     },
                     {
                        role:'user',
                        content:enhancedPrompt || ""
                     }
                 ]);
        const code=codeGenerationResponse.choices[0].message.content ||"";

          if(!code){
            await prisma.conversation.create({
                data:{
                    role:'assistant',
                    content: `Unable to generate code ,please try again.`,
                    projectId:project.id
                }
            }),
                await prisma.user.update({
                    where:{id:userId},
                    data:{credits:{increment:5}}
                })
                return;
         }

        //Create a version of the project
        const cleanedCode = extractHTML(code);
        console.log("Cleaned HTML Length:", cleanedCode.length);
        console.log("Cleaned HTML Preview:", cleanedCode.substring(0, 100) + "...");
        
        const version=await prisma.version.create({
            data:{
                code: cleanedCode,
                description:'Initial version',
                projectId:project.id
            }
        })

        await prisma.conversation.create({
            data:{
            role:'assistant',
            content: "I've generated your website! You can now preview it and request any changes.",
            projectId:project.id
            }
        })

        await prisma.websiteProject.update({
            where:{id:project.id},
            data:{
                current_code: cleanedCode,
                current_version_index:version.id
            }
        })

    }catch(error:any){
        try {
            await prisma.user.update({
                where:{id:userId},
                data:{credits:{increment:5}}
            });
        } catch (dbError) {
            console.error("Failed to refund credits:", dbError);
        }
        console.error("Project Creation Error:", error?.response?.data || error);
        if (!res.headersSent) {
            res.status(500).json({message: error.message || "An error occurred during project creation"});
        }
    }

}

//controller function to get a single  user projects

export const getUserProject=async (req: Request, res: Response)=>{
    try{
        const userId=req.userId;
        if(!userId){
            return res.status(401).json({message:'Unauthorized user'})
        }

        const {projectId}=req.params;

        const project =await prisma.websiteProject.findUnique({
            where:{id:projectId, userId},
            include:{
                conversation:{
                    orderBy:{timestamp:'asc'}
 main
                },
            ],
            mode: 'payment',
            metadata: {
                transactionId: transaction.id,
                appId: 'ai-site-builder'
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60  //Expires in 30 minutes
        });

        res.json({ payment_link: session.url })
    } catch (error: any) {
        console.log(error.code || error.message);
        res.status(500).json({ message: error.message });
    }
}