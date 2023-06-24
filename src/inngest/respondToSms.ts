import { createClient } from "@supabase/supabase-js";
import { inngest } from "./client";
import { TABLE_REG_BUSINESSES } from "@/utils/constants";
import { NonRetriableError } from "inngest";

export const respondToSms = inngest.createFunction(
    {
        name: "Respond to SMS",
        cancelOn: [
            {
                event: "sms/respond/cancel",
                if: "async.data.fromPhone == event.data.fromPhone && async.data.toPhone == event.data.toPhone",
            },
        ],
    },
    { event: "sms/respond" },
    async ({ event, step }) => {
        // create supabase client
        console.log(event.data.authToken);
        const supabaseClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: {
                    persistSession: false,
                },
                // global: {
                //     headers: {
                //         Authorization: event.data.authToken!,
                //     },
                // },
            }
        );

        // incoming sms data
        const { fromPhone, toPhone, message, sid } = event.data;
        console.log(">> RespondToSMS", fromPhone, toPhone, message, sid);

        await step.run("login and fetch data", async () => {
            const token = await supabaseClient.auth.signInWithPassword({
                email: "twilioserviceuser@groundwork.com",
                password: "r2VATPnFU3afdYq",
            });
            console.log("after logging in", token);

            const {
                data: { session: s2 },
            } = await supabaseClient.auth.getSession();
            console.log(">> ", s2?.user.email);

            // retrieve business from phone
            const { data: business, error } = await supabaseClient
                .from(TABLE_REG_BUSINESSES)
                .select()
                .eq("registered_phone", toPhone)
                .single();
            if (error) {
                console.log("error in retrieving business with registered_phone " + toPhone, error);
                throw new NonRetriableError(
                    "Business with registered_phone " + toPhone + " not found",
                    { cause: error }
                );
            }
            console.log(business);
        });

        await step.sleep("30s");

        await step.run("Respond to SMS", async () => {
            console.log("Responding to SMS: " + fromPhone, toPhone, message, sid);
        });
    }
);
