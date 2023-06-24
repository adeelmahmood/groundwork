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
        const { fromPhone, toPhone, messageId } = event.data;
        console.log(">> RespondToSMS", fromPhone, toPhone, messageId);

        const delay = await step.run("get business chatbot delay setting", async () => {
            const supabaseClient = await getTwilioSASupabaseClient();

            // retrieve business settings from phone
            const { data: business_settings, error } = await supabaseClient
                .from(TABLE_REG_BUSINESSES)
                .select(`business_settings (*)`)
                .eq("registered_phone", toPhone)
                .single();
            if (error) {
                console.log(
                    "error in retrieving business settings with registered_phone " + toPhone,
                    error
                );
                throw new NonRetriableError(
                    "Business settings for registered_phone " + toPhone + " not found",
                    { cause: error }
                );
            }

            // sign out
            await supabaseClient.auth.signOut();

            const { business_settings: settings } = business_settings;
            // retrieve chatbot delay setting
            const setting = settings?.find((s: any) => s.setting_name == "CHATBOT_DELAY") as any;
            return setting ? setting.setting_value : 0;
        });

        delay > 0 && (await step.sleep(delay + "s"));

        await step.run("Respond to all queued SMS messages", async () => {
            const supabaseClient = await getTwilioSASupabaseClient();

            // retrieve received messages
            const { data: messages, error } = await supabaseClient
                .from(TABLE_SMS_MESSAGES)
                .select()
                .eq("from_phone", fromPhone)
                .eq("to_phone", toPhone);
            if (error) {
                console.log("error in retrieving sms messages", error);
                throw new NonRetriableError("error in retrieving sms messages", { cause: error });
            }

            console.log(messages);
        });
    }
);
