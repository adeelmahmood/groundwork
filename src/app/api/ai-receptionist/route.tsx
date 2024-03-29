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
import { SimpleChatMessage } from "@/app/types";

export async function POST(req: Request) {
    const { input, history, business, promptConfig } = await req.json();
    // console.log("input -" + input + "-");
    // console.log("history", history);
    // console.log("business", business);
    // console.log("promptConfig", promptConfig);

    try {
        // generate history
        const pastMessages: any[] = history.map((h: SimpleChatMessage) => {
            if (h.message.trim().length == 0) return;

            if (h.speaker == "User") return new HumanChatMessage(h.message);
            if (h.speaker == "Assistant") return new AIChatMessage(h.message);
            if (h.speaker == "System") return new SystemChatMessage(h.message);
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
        console.log(e);
        return new Response(JSON.stringify({ error: (e as any).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export const runtime = "edge";
