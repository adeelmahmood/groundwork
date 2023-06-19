import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
    RECEPTIONIST_PROMPT,
    RECEPTIONIST_PROMPT_TEMPERATURE,
    TABLE_RECEPTIONIST_PROMPTS,
    TABLE_REG_BUSINESSES,
} from "../../../utils/constants";
import { PineconeClient } from "@pinecone-database/pinecone";

export async function POST(request: Request) {
    const { business } = await request.json();
    console.log(business);

    const supabase = createRouteHandlerClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // const {
    //     data: { session },
    // } = await supabase.auth.getSession();

    // remove relations
    const { receptionist_prompts, ...bus } = business;

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

    // check if we dont have a prompt for this business yet
    const { data: promptData, error: promptError } = await supabase
        .from(TABLE_RECEPTIONIST_PROMPTS)
        .select()
        .eq("business_id", data?.id)
        .single();
    if (!promptData) {
        // save receptionist prompt
        const { error: pError } = await supabase.from(TABLE_RECEPTIONIST_PROMPTS).insert({
            prompt: RECEPTIONIST_PROMPT,
            temperature: RECEPTIONIST_PROMPT_TEMPERATURE,
            business_id: data?.id,
        });

        if (pError) {
            console.log("error in saving prompt", pError);
        }
    }

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
