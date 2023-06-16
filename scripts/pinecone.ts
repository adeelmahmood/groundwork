import { PineconeClient } from "@pinecone-database/pinecone";

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

    await deleteAll();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
