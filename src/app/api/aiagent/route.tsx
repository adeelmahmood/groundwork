import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { CallbackManager } from "langchain/callbacks";
import { HumanChatMessage, AIChatMessage, SystemChatMessage } from "langchain/schema";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
    SystemMessagePromptTemplate,
} from "langchain/prompts";
import { cookies } from "next/headers";
import { TABLE_RECEPTIONIST_PROMPTS, TABLE_REG_BUSINESSES } from "@/utils/constants";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
    const { input, history, business } = await req.json();

    try {
        const supabase = createRouteHandlerClient({ cookies });

        // initialize pinecone client
        // const pinecone: PineconeClient = new PineconeClient();
        // await pinecone.init({
        //     environment: process.env.PINECONE_ENVIRONMENT!,
        //     apiKey: process.env.PINECONE_API_KEY!,
        // });

        // retrieve business prompt
        const { data: promptConfig, error } = await supabase
            .from(TABLE_RECEPTIONIST_PROMPTS)
            .select()
            .eq("business_id", business.id)
            .single();
        if (error) throw new Error("unable to retrieve business prompt " + error.message);

        // generate history
        const pastMessages: any[] = history.map((h: string) => {
            if (h.trim().length == 0) return;

            const speaker = h.substring(h.indexOf("[") + 1, h.indexOf("]"));
            const message = h.substring(h.indexOf("]") + 2);
            if (speaker == "User") return new HumanChatMessage(message);
            if (speaker == "Assistant") return new AIChatMessage(message);
            if (speaker == "System") return new SystemChatMessage(message);
        });

        // chat bot memory
        const memory = new BufferMemory({
            chatHistory: new ChatMessageHistory(pastMessages),
            returnMessages: true,
            memoryKey: "history",
        });

        const promptData = {
            ...business,
            business_description: business.business_description.replace(/\n/g, " "),
        };
        const promptTemplate = PromptTemplate.fromTemplate(promptConfig.prompt);
        const promptParsed = await promptTemplate.format(promptData);
        // console.log(promptParsed);

        // generate prompt
        const prompt = ChatPromptTemplate.fromPromptMessages([
            SystemMessagePromptTemplate.fromTemplate(promptParsed),
            new MessagesPlaceholder("history"),
            HumanMessagePromptTemplate.fromTemplate("{input}"),
        ]);

        const streaming = req.headers.get("accept") === "text/event-stream";
        if (streaming) {
            const encoder = new TextEncoder();
            const stream = new TransformStream();
            const writer = stream.writable.getWriter();

            const llm = new ChatOpenAI({
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

            const chain = new ConversationChain({
                memory: memory,
                prompt: prompt,
                llm: llm,
            });

            chain
                .call({
                    input,
                })
                .catch((e: Error) => console.error(e));

            return new Response(stream.readable, {
                headers: { "Content-Type": "text/event-stream" },
            });
        } else {
            const llm = new ChatOpenAI({ temperature: promptConfig.temperature });
            const chain = new ConversationChain({
                memory: memory,
                prompt: prompt,
                llm: llm,
            });

            const response = await chain.call({ input });
            return new Response(JSON.stringify(response), {
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (e) {
        return new Response(JSON.stringify({ error: (e as any).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export const runtime = "edge";
