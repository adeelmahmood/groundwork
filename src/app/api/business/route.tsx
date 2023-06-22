import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
    PROMPTSCONFIG,
    TABLE_BUSINESS_PROMPTS,
    TABLE_REG_BUSINESSES,
} from "../../../utils/constants";
import { PineconeClient } from "@pinecone-database/pinecone";

export async function POST(request: Request) {
    const { business } = await request.json();

    const supabase = createRouteHandlerClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // const {
    //     data: { session },
    // } = await supabase.auth.getSession();

    // remove relations
    const { business_prompts, ...bus } = business;

    const savePrompt = async (business: any, promptConfig: any) => {
        const { data: d, error: e } = await supabase
            .from(TABLE_BUSINESS_PROMPTS)
            .select()
            .eq("business_id", business.id)
            .eq("prompt_type", promptConfig.promptType)
            .single();
        if (e) {
            console.log("error in looking up prompt", e.message);
        }
        if (!d) {
            const { error: e1 } = await supabase.from(TABLE_BUSINESS_PROMPTS).insert({
                prompt: promptConfig.prompt,
                temperature: promptConfig.temperature,
                prompt_type: promptConfig.promptType,
                business_id: business.id,
            });
            if (e1) {
                console.log("error in saving prompt", e1.message);
            }
        }
    };

    // save business
    const { data, error } = await supabase
        .from(TABLE_REG_BUSINESSES)
        .upsert({
            ...bus,
            contractor_id: user?.id,
        })
        .select()
        .single();

    if (error) {
        console.log("error in saving business", error);
    }

    // save prompts
    const promptConfig = PROMPTSCONFIG as any;
    await Promise.all(
        promptConfig.map(async (config: any) => {
            await savePrompt(data, {
                promptType: config.promptType,
                prompt: config.prompt,
                temperature: config.temperature,
            });
        })
    );

    // Send request to Inngest to crawl the business website
    // if (!data?.crawl_completed) {
    //     await inngest.send({
    //         name: "event.crawl",
    //         data: {
    //             business: data,
    //             accessToken: session?.access_token,
    //         },
    //     });
    // }

    return NextResponse.json(data);
}

let pinecone: PineconeClient | null = null;
async function initPineconeClient() {
    pinecone = new PineconeClient();
    console.log("init pinecone");
    await pinecone.init({
        environment: process.env.PINECONE_ENVIRONMENT!,
        apiKey: process.env.PINECONE_API_KEY!,
    });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    console.log("delete business", id);

    const supabase = createRouteHandlerClient({ cookies });
    const { data, error } = await supabase
        .from(TABLE_REG_BUSINESSES)
        .select()
        .eq("id", id)
        .single();

    if (!error) {
        // delete business from database
        const { error: de } = await supabase.from(TABLE_REG_BUSINESSES).delete().eq("id", id);
        console.log("deleting " + data.id + " and got " + de);

        // delete pinecone index
        await initPineconeClient();
        await pinecone!
            .Index("groundwork-contractors")
            .delete1({ deleteAll: true, namespace: data.id });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
}
