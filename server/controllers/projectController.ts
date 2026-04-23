import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
 controllers-or-stripe-add
import { aiService } from '../services/AIService.js';

export const createProject = async (req: Request, res: Response) => {
    const userId = req.userId;
    try {
        const { initial_prompt } = req.body;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.credits < 5) return res.status(403).json({ message: 'Insufficient credits' });

        const project = await prisma.websiteProject.create({
            data: {
                name: initial_prompt.length > 50 ? initial_prompt.substring(0, 47) + '...' : initial_prompt,
                initial_prompt,
                userId
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { totalCreation: { increment: 1 }, credits: { decrement: 5 } }
        });

        res.json({ projectId: project.id });

        // Run background tasks: Enhance -> Generate -> Save
        (async () => {
             try {
                await prisma.conversation.create({
                    data: { role: 'user', content: initial_prompt, projectId: project.id }
                });

                const enhancedPrompt = await aiService.enhancePrompt(initial_prompt);
                await prisma.conversation.create({
                    data: { role: 'assistant', content: `I've refined your vision: "${enhancedPrompt}"`, projectId: project.id }
                });

                await prisma.conversation.create({
                    data: { role: 'assistant', content: `Building your digital experience...`, projectId: project.id }
                });

                const systemPrompt = `
                You are an expert web developer. Create a production-ready, beautiful website using Tailwind CSS.
                Requirements:
                - Valid HTML ONLY. Use Tailwind CDN: <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
                - Fully responsive, modern design.
                - Include all JS in <script> tags before </body>.
                - Return ONLY the code. No markdown.
                `;

                const code = await aiService.generateContent(systemPrompt, enhancedPrompt);

                const version = await prisma.version.create({
                    data: { code, description: 'Initial Generation', projectId: project.id }
                });

                await prisma.websiteProject.update({
                    where: { id: project.id },
                    data: { current_code: code, current_version_index: version.id }
                });

                await prisma.conversation.create({
                    data: { role: 'assistant', content: "Your website is live! Check the preview.", projectId: project.id }
                });
             } catch (err) {
                 console.error("Project generation failed:", err);
             }
        })();

    } catch (error: any) {
        res.status(500).json({ message: error.message });

import openai from '../configs/openai.js';
import { createChatCompletionWithFallback, extractHTML } from './UserController.js';

// controller function to make Revesion 

export const makeRevision=async (req: Request, res: Response)=>{
    const userId=req.userId;

    try{
        
        const {projectId}=req.params;
        const {message}=req.body;

        const user=await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!userId || !user){
            return res.status(401).json({message:'Unauthorized user'})
        }
       if(user.credits < 5){
        return res.status(403).json({message:'add more credits to make a changes'})
       }

       if(!message || message.trim() === ''){
        return res.status(400).json({message:'Please enter a valid prompt'})
       }

       const currentProject=await prisma.websiteProject.findUnique({
            where:{id:projectId, userId},
            include:{versions:true}
       })

       if(!currentProject){
        return res.status(404).json({message:'Project not found'})
       }

       await prisma.conversation.create({
        data:{
            role:'user',
            content:message,
            projectId
        }
       })

       await prisma.user.update({
        where:{id:userId},
        data:{credits:{decrement:5}}
         })

         //Enhance  user prompt
         const promptEnhanceResponse=await createChatCompletionWithFallback([
                {
                    role:'system',
                    content: `
                    You are a prompt enhancement specialist. The user wants to make changes to their website. Enhance their request to be more specific and actionable for a web developer.

                    Enhance this by:
                    1. Being specific about what elements to change
                    2. Mentioning design details (colors, spacing, sizes)
                    3. Clarifying the desired outcome
                    4. Using clear technical terms

                Return ONLY the enhanced request, nothing else. Keep it concise (1-2 sentences).`
               },
               {
                    role:'user',
                    content: `User's request: "${message}"`
               }
            ]);

         const enhancePrompt=promptEnhanceResponse.choices[0].message.content;

         await prisma.conversation.create({
            data:{
                role:'assistant',
                content: `I've enhanced your prompt to: "${enhancePrompt}"`,
                projectId
            }
         })

          await prisma.conversation.create({
            data:{
                role:'assistant',
                content: 'Now making changes to your website...',
                projectId
            }
         })

         // Generate website code
         const codeGenerationResponse=await createChatCompletionWithFallback([
                {
                    role:'system',
                    content: `
                    You are an expert web developer. 

                    CRITICAL REQUIREMENTS:
                    - Return ONLY the complete updated HTML code with the requested changes.
                    - Use Tailwind CSS for ALL styling (NO custom CSS).
                    - Use Tailwind utility classes for all styling changes.
                    - Include all JavaScript in <script> tags before closing </body>
                    - Make sure it's a complete, standalone HTML document with Tailwind CSS
                    - Return the HTML Code Only, nothing else
                    - Absolutely NO text, symbols, or hidden tags (like <thinking> or <reasoning>) before or after the code.
                    - Start your response IMMEDIATELY with <!DOCTYPE html> or <html.

                    Apply the requested changes while maintaining the Tailwind CSS styling approach.`
                },
                {
                    role:'user',
                    content: `
                    Here is the current website code: "${currentProject.current_code}"
                    The user wants this change: "${enhancePrompt}"`
                }
            ]);

         const code=codeGenerationResponse.choices[0].message.content || '';

         if(!code){
            await prisma.conversation.create({
                data:{
                    role:'assistant',
                    content: `Unable to generate code ,please try again.`,
                    projectId
                }
            }),
                await prisma.user.update({
                    where:{id:userId},
                    data:{credits:{increment:5}}
                })
                return;
         }

         const cleanedCode = extractHTML(code);
         const version= await prisma.version.create({
            data:{
                code: cleanedCode,
                description:'changes made',
                projectId
                
            }
         })

         await prisma.conversation.create({
            data:{
                role:'assistant',
                content:"I've made the changes to your website!. You can now preview it ",
                projectId
            }
         })

         await prisma.websiteProject.update({
            where:{id:projectId},
            data:{
                current_code: cleanedCode,
               current_version_index:version.id
            }
         })

         

        res.json({message:'Changes made  successfully'})
    }catch(error:any){
         await prisma.user.update({
        where:{id:userId},
        data:{credits:{increment:5}}
         })

        console.log(error.code|| error.message);
        res.status(500).json({message:error.code|| error.message});
 main
    }
};

export const makeRevision = async (req: Request, res: Response) => {
    const userId = req.userId;
    const { projectId } = req.params;
    const { message } = req.body;

    try {
        if (!userId) return res.status(401).json({ message: 'Unauthorized user' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.credits < 5) return res.status(403).json({ message: 'Insufficient credits to revise' });

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId }
        });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: 5 } }
        });

        await prisma.conversation.create({
            data: { role: 'user', content: message, projectId }
        });

        res.json({ message: 'Revision started' });

        (async () => {
            try {
                const systemPrompt = `
                You are an expert web developer. Modify the existing website code based on the user's request.
                Requirements:
                - Return COMPLETE updated HTML.
                - Use Tailwind CSS exclusively.
                - Return ONLY the code. No markdown.
                `;

                const userPrompt = `
                Current Code: ${project.current_code}
                Revision Request: ${message}
                `;

                const code = await aiService.generateContent(systemPrompt, userPrompt);

                const version = await prisma.version.create({
                    data: { code, description: `Revision: ${message.substring(0, 30)}`, projectId }
                });

                await prisma.websiteProject.update({
                    where: { id: projectId },
                    data: { current_code: code, current_version_index: version.id }
                });

                await prisma.conversation.create({
                    data: { role: 'assistant', content: "Revision complete! Check out the updates in the preview.", projectId }
                });
            } catch (err) {
                console.error("Revision failed:", err);
            }
        })();

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const rollbackToVersion = async (req: Request, res: Response) => {
    const userId = req.userId;
    const { projectId, versionId } = req.params;

    try {
        if (!userId) return res.status(401).json({ message: 'Unauthorized user' });

        const version = await prisma.version.findFirst({
            where: { id: versionId, projectId, project: { userId } }
        });

        if (!version) return res.status(404).json({ message: 'Version not found' });

        await prisma.websiteProject.update({
            where: { id: projectId },
            data: { current_code: version.code, current_version_index: version.id }
        });

        await prisma.conversation.create({
            data: { role: 'assistant', content: `Restored to snapshot: ${version.description || version.id}`, projectId }
        });

        res.json({ message: 'Rollback successful' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProject = async (req: Request, res: Response) => {
     try {
        const { projectId } = req.params;
        const userId = req.userId;

        const project = await prisma.websiteProject.findUnique({
            where: { id: projectId, userId },
            include: {
                conversation: { orderBy: { timestamp: 'asc' } },
                versions: { orderBy: { timestamp: 'asc' } }
            }
        });

        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json({ project });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.websiteProject.findMany({
            where: { userId: req.userId },
            orderBy: { updatedAt: 'desc' }
        });
        res.json({ projects });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const saveProjectCode = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;
        const { projectId } = req.params;
        const userId = req.userId;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        await prisma.websiteProject.update({
            where: { id: projectId, userId },
            data: { current_code: code }
        });

        res.json({ message: 'Saved successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        await prisma.websiteProject.delete({
            where: { id: req.params.projectId, userId: req.userId }
        });
        res.json({ message: 'Project deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const togglePublish = async (req: Request, res: Response) => {
    try {
        const project = await prisma.websiteProject.findUnique({
            where: { id: req.params.projectId, userId: req.userId }
        });
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const updated = await prisma.websiteProject.update({
            where: { id: project.id },
            data: { isPublished: !project.isPublished }
        });

        res.json({ 
            message: updated.isPublished ? 'Project published on community board' : 'Project removed from community', 
            isPublished: updated.isPublished 
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Public endpoint: get project code for preview/view (no auth required for published projects)
export const getProjectCode = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;

        // First try to find as published project (public access)
        const project = await prisma.websiteProject.findFirst({
            where: {
                id: projectId,
                OR: [
                    { isPublished: true },
                    ...(req.userId ? [{ userId: req.userId }] : [])
                ]
            },
            include: {
                versions: { orderBy: { timestamp: 'asc' } }
            }
        });

        if (!project || !project.current_code) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ code: project.current_code, project });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPublishedProjects = async (req: Request, res: Response) => {
    try {
        const projects = await prisma.websiteProject.findMany({
            where: { isPublished: true },
            include: { user: true },
            orderBy: { updatedAt: 'desc' }
        });
        res.json({ projects });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
