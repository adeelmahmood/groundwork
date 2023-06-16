import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { loadEnvConfig } from "@next/env";

loadEnvConfig("");

let pinecone: PineconeClient | null = null;

async function initPineconeClient() {
    pinecone = new PineconeClient();
    console.log("init pinecone");
    await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT!,
        apiKey: process.env.PINECONE_API_KEY!,
    });
}

export async function deleteAll() {
    await pinecone!.Index("groundwork-contractors").delete1({ deleteAll: true });
}

async function main() {
    await initPineconeClient();

    // await deleteAll();

    const query = "what services do you offer";

    const embedding = new OpenAIEmbeddings();
    const vector = await embedding.embedQuery(query);
    console.log(vector);

    const index = pinecone!.Index("groundwork-contractors");
    const result = await index.query({
        queryRequest: {
            vector: vector,
            topK: 3,
            includeMetadata: true,
            namespace: "bac454f9-ebfc-4b7c-8a2e-487b0395e3b6",
        },
    });

    console.log(result.matches);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
