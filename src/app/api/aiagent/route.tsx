import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAI, PromptTemplate } from "langchain";
import { LLMChain } from "langchain/chains";
import { CallbackManager } from "langchain/callbacks";
import {
    formulateQuestion,
    generateEmbeddingFor,
    getMatches,
    summarizeMatches,
} from "../../../utils/prompts";

export async function POST(req: Request) {
    const { input, history, business } = await req.json();
    console.log({ input, history, business });

    const prompt =
        PromptTemplate.fromTemplate(`You are a helpful AI agent whose job is to find customer leads for contractors. 
You represent the company '${business.business_name}'. You are having a conversation with a potential customer. Your should 
answer any questions that the user may have about the company: '${business.business_name}'. Use the CONTEXT to answer those questions.
If the answer is not found in the context, do not make up an answer.
The URLs are the urls of the pages that contain the Knowledge base. Always include these urls at the end of the answer as HTML anchor tags

Your main job is to schedule an appointment for this customer for one of the services that '${business.business_name}' offers. 
Ask questions based on the type of service that the user is interested in and find a time slot for the appointment. 
Once you have the appointment scheduled, thank the user and provide them with finalized appointment information and end the conversation.

User Question: {question}

Chat History:
{chatHistory}

Context:
{context}

Urls:
{urls}

Provide your answer in HTML.

Answer:
`);

    try {
        // initialize pinecone client
        const pinecone: PineconeClient = new PineconeClient();
        await pinecone.init({
            environment: process.env.PINECONE_ENVIRONMENT!,
            apiKey: process.env.PINECONE_API_KEY!,
        });

        // first formulate a better question from user prompt and chat history
        console.time("forumate question");
        const question = await formulateQuestion(input, history);
        console.log("formulated question: " + question);
        console.timeEnd("forumate question");

        // generate embedding for the formulated question
        console.time("embedding for question");
        const embedding = await generateEmbeddingFor(question);
        console.log("generated embedding for formulated question: " + embedding[0] + "...");
        console.timeEnd("embedding for question");

        // lets get matches for this question
        console.time("getting matches");
        const matches = await getMatches(pinecone, embedding, 3, business.id);
        console.log("got matches ==> ", matches?.length);
        if (matches?.length == 0) {
            return new Response("Unable to find any information on this");
        }
        console.timeEnd("getting matches");
        const urls =
            matches &&
            Array.from(
                new Set(
                    matches.map((match) => {
                        const metadata = match.metadata as any;
                        const { url } = metadata;
                        return url;
                    })
                )
            );
        console.log(urls);

        // lets summarize the matches
        console.time("summarizing");
        const summarizedMatches = await summarizeMatches(pinecone, question, matches);
        console.log("matches summarized ==> ", summarizedMatches);
        console.timeEnd("summarizing");

        // lets do the final query
        const streaming = req.headers.get("accept") === "text/event-stream";
        if (streaming) {
            const encoder = new TextEncoder();
            const stream = new TransformStream();
            const writer = stream.writable.getWriter();

            const llm = new OpenAI({
                temperature: 0,
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
                    question: question,
                    chatHistory: history,
                    context: summarizedMatches,
                    urls: urls && urls.length ? urls : [],
                })
                .catch((e: Error) => console.error(e));

            return new Response(stream.readable, {
                headers: { "Content-Type": "text/event-stream" },
            });
        } else {
            const llm = new OpenAI({
                temperature: 0,
                // maxTokens: 256,
                // topP: 1,
                // frequencyPenalty: 0,
                // presencePenalty: 0,
            });
            const chain = new LLMChain({
                prompt: prompt,
                llm: llm,
            });

            const response = await chain.call({
                question: question,
                chatHistory: history,
                context: summarizedMatches,
            });
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
