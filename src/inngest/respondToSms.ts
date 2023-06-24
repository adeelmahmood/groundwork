import { inngest } from "./client";
import { TABLE_REG_BUSINESSES, TABLE_SMS_MESSAGES } from "@/utils/constants";
import { NonRetriableError } from "inngest";
import { getTwilioSASupabaseClient } from "@/utils/supbase";

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
        // incoming sms data
        const { fromPhone, toPhone, chatbotDelay } = event.data;
        console.log(">> RespondToSMS", fromPhone, toPhone, chatbotDelay);

        event.data.chatbotDelay > 0 && (await step.sleep(event.data.chatbotDelay + "s"));

        const aiMessage = await step.run("Generate AI response", async () => {
            console.log(">>> Now generating AI response...");
            const supabaseClient = await getTwilioSASupabaseClient();

            // retrieve received messages
            const { data: messages, error } = await supabaseClient
                .from(TABLE_SMS_MESSAGES)
                .select()
                .eq("from_phone", fromPhone)
                .eq("to_phone", toPhone)
                .order("created_at");
            if (error) {
                console.log("error in retrieving sms messages", error);
                throw new NonRetriableError("error in retrieving sms messages", { cause: error });
            }

            // make sure the most recent message has not been processed yet
            const mostRecentInReceivedStatus =
                messages.at(messages.length - 1)?.status === "Received";
            if (mostRecentInReceivedStatus) {
                // load business data
                const { data: business, error } = await supabaseClient
                    .from(TABLE_REG_BUSINESSES)
                    .select(`*, business_prompts (*), business_settings (*)`)
                    .eq("registered_phone", toPhone)
                    .single();
                if (error) {
                    console.log(`error in retrieving business with phone ${toPhone} ${error}`);
                    throw new NonRetriableError(
                        `error in retrieving business with phone ${toPhone}`,
                        { cause: error }
                    );
                }
                const promptConfig = business.business_prompts?.find(
                    (p: any) => p.prompt_type == "receptionist"
                );

                console.log("preparing input for ai receptionist");
                const lastMessage = messages[messages.length - 1];
                console.log("lastMessage", lastMessage);
                const input = "[" + lastMessage.speaker + "] " + lastMessage.message.trim();
                const history = messages
                    .slice(0, messages.length - 1)
                    .map((m) => "[" + m.speaker + "] " + m.message.trim());

                // retrieve app url
                const baseUrl = process.env.VERCEL_URL
                    ? "https://" + process.env.VERCEL_URL
                    : "http://localhost:3000";

                // call ai receptionist
                const response = await fetch(`${baseUrl}/api/ai-receptionist`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        input,
                        history,
                        business,
                        promptConfig,
                    }),
                });

                const data = await response.json();
                if (response.status !== 200) {
                    console.log("error in calling ai receptionist", data.error);
                    throw new NonRetriableError(`error in calling ai receptionist`, {
                        cause: data.error,
                    });
                }
                console.log("response from AI receptionist >>>> ", data);

                // return the AI message
                return data.response;
            }
        });

        await step.run("Respond with AI message", async () => {
            console.log(">>> Now sending AI response...");

            const twilio = require("twilio")(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            const sent = await twilio.messages.create({
                body: aiMessage,
                from: toPhone,
                to: fromPhone,
            });
            console.log("message sent ", sent);

            if (sent) {
                const supabaseClient = await getTwilioSASupabaseClient();

                // insert new message record in the database
                const { data: smsInsert, error: smsInsertError } = await supabaseClient
                    .from(TABLE_SMS_MESSAGES)
                    .insert({
                        from_phone: toPhone,
                        to_phone: fromPhone,
                        message: aiMessage,
                        sid: sent.sid,
                        speaker: "AI",
                        status: "Sent",
                    })
                    .select();
            }
        });
    }
);
