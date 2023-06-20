import { CallbackManager } from "langchain/callbacks";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain, OpenAI } from "langchain";

export async function POST(req: Request) {
    const { conversation, promptConfig } = await req.json();
    // console.log(conversation, promptConfig);

    try {
        const prompt = PromptTemplate.fromTemplate(promptConfig.prompt);
        const streaming = req.headers.get("accept") === "text/event-stream";
        console.log("streaming", streaming);
        if (streaming) {
            const encoder = new TextEncoder();
            const stream = new TransformStream();
            const writer = stream.writable.getWriter();

            const llm = new OpenAI({
                temperature: promptConfig.temperature,
                // maxTokens: 256,
                // topP: 1,
                // frequencyPenalty: 0,
                // presencePenalty: 0,
                streaming: true,
                callbackManager: CallbackManager.fromHandlers({
                    handleLLMNewToken: async (token: string) => {
                        await writer.ready;
                        await writer.write(encoder.encode(`data: ${token}\n\n`));
                    },
                    handleLLMEnd: async () => {
                        await writer.ready;
                        await writer.close();
                    },
                    handleLLMError: async (e: Error) => {
                        await writer.ready;
                        await writer.abort(e);
                    },
                }),
            });

            const chain = new LLMChain({
                prompt: prompt,
                llm: llm,
            });

            chain
                .call({
                    conversation,
                })
                .catch((e: Error) => console.error(e));

            return new Response(stream.readable, {
                headers: { "Content-Type": "text/event-stream" },
            });
        } else {
            const llm = new OpenAI({ temperature: promptConfig.temperature });
            const chain = new LLMChain({
                prompt: prompt,
                llm: llm,
            });

            const response = await chain.call({ conversation });
            return new Response(JSON.stringify(response), {
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify({ error: (e as any).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export const runtime = "edge";
