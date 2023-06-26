import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain";
import { OpenAI } from "langchain/llms/openai";

export async function POST(req: Request) {
    const { history, promptConfig } = await req.json();
    // console.log({ history, promptConfig });

    try {
        const prompt = PromptTemplate.fromTemplate(promptConfig.prompt);

        const llm = new OpenAI({ temperature: promptConfig.temperature });
        const chain = new LLMChain({
            prompt: prompt,
            llm: llm,
        });

        const response = await chain.call({ history });
        return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify({ error: (e as any).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export const runtime = "edge";
