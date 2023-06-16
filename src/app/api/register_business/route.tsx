import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TABLE_REG_BUSINESSES } from "../../../../utils/constants";
import { inngest } from "@/inngest/client";

export async function POST(request: Request) {
    const { business } = await request.json();
    console.log(business);

    const supabase = createRouteHandlerClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // save business
    const { data } = await supabase
        .from(TABLE_REG_BUSINESSES)
        .upsert({
            ...business,
            contractor_id: user?.id,
        })
        .select()
        .single();

    // Send request to Inngest to crawl the business website
    if (!data?.crawl_completed) {
        await inngest.send({
            name: "event.crawl",
            data: {
                business: data,
                accessToken: session?.access_token,
            },
        });
    }

    return NextResponse.json({ data });
}
