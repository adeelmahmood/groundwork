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
            namespace: "6e25ff6a-632e-4cb1-a099-a34af8ca6f1a",
        },
    });

    console.log(result.matches);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
