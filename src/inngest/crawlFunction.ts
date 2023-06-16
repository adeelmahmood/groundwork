import { Crawler, Page } from "../utils/crawler";
import { inngest } from "./client";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeClient, Vector } from "@pinecone-database/pinecone";
import { sliceIntoChunks, truncateStringByBytes } from "../utils/utils";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import Bottleneck from "bottleneck";
import { uuid } from "uuidv4";
import { createClient } from "@supabase/supabase-js";
import { TABLE_REG_BUSINESSES } from "../utils/constants";

let pinecone: PineconeClient | null = null;

async function initPineconeClient() {
    pinecone = new PineconeClient();
    console.log("init pinecone");
    await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT!,
        apiKey: process.env.PINECONE_API_KEY!,
    });
}

async function crawl(urls: string[], excludes: string[]) {
    // Instantiate the crawler
    const crawler = new Crawler(urls, excludes, 10, 200);
    // Start the crawler
    const pages = (await crawler.start()) as Page[];

    const documents = await Promise.all(
        pages.map((row) => {
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 100,
            });
            const docs = splitter.splitDocuments([
                new Document({
                    pageContent: row.text,
                    metadata: {
                        url: row.url,
                        text: truncateStringByBytes(row.text, 35000),
                        title: row.title,
                    },
                }),
            ]);
            return docs;
        })
    );

    // console.log(JSON.stringify(documents, null, 4));

    console.log(documents.length);
    console.log(documents.flat().length);
    return documents;
}

async function generateEmbeddings(documents: Document<Record<string, any>>[][], ns: string = "") {
    const getEmbeddingAsVetor = async (doc: Document) => {
        const embedding = await embeddings.embedQuery(doc.pageContent);
        return {
            id: uuid(),
            values: embedding,
            metadata: {
                content: doc.pageContent,
                text: doc.metadata.text as string,
                url: doc.metadata.url as string,
                title: doc.metadata.title as string,
            },
        } as Vector;
    };

    const embeddings = new OpenAIEmbeddings();

    const limiter = new Bottleneck({
        minTime: 50,
    });

    const rateLimitedEmbeddings = limiter.wrap(getEmbeddingAsVetor);
    console.log("done embedding");

    if (!pinecone) await initPineconeClient();

    const index = pinecone!.Index("groundwork-contractors");
    let vectors = [] as Vector[];

    try {
        vectors = (await Promise.all(
            documents.flat().map((doc) => rateLimitedEmbeddings(doc))
        )) as unknown as Vector[];

        const v = vectors.map((v) => {
            const md = v.metadata as any;
            return {
                id: v.id,
                content: md?.content,
                text: md?.text,
                url: md?.url,
                title: md?.title,
            };
        });
        // fs.writeFile("./data/earnestblog.json", JSON.stringify(v, null, 1), "utf-8", () =>
        // console.log("done")
        // );

        vectors.map((v: Vector) => console.log(v.id));
        const chunks = sliceIntoChunks(vectors, 10);

        await Promise.all(
            chunks.map(async (chunk) =>
                index.upsert({
                    upsertRequest: {
                        vectors: chunk as Vector[],
                        namespace: ns,
                    },
                })
            )
        );
        console.log("added to pinecone");
    } catch (e) {
        console.log(e);
    }
}

async function updateDb(accessToken: string, business: any) {
    const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,
            },
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        }
    );

    // const { data: existing } = await supabaseClient.from(TABLE_REG_BUSINESSES).select();
    // console.log("existing", existing);

    const { error } = await supabaseClient
        .from(TABLE_REG_BUSINESSES)
        .update({
            crawl_completed: true,
        })
        .eq("id", business.id);
    if (error) {
        console.log("error in updating db", error);
    }
}

export const crawler = inngest.createFunction(
    { name: "Crawler" },
    { event: "event.crawl" },
    async ({ event, step }) => {
        const { business, accessToken } = event.data;
        console.log(business);

        console.log("starting crawl");
        console.time("crawl");
        const docs = await crawl([business.business_url], []);
        console.timeEnd("crawl");

        console.log("starting embed");
        console.time("embed");
        await generateEmbeddings(docs, business.id);
        console.timeEnd("embed");

        console.log("starting updatedb");
        console.time("db");
        await updateDb(accessToken, business);
        console.timeEnd("db");

        return { event, body: "Done!" };
    }
);
