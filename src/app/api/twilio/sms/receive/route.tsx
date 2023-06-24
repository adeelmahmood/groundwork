import { inngest } from "@/inngest/client";
import { TABLE_REG_BUSINESSES, TABLE_SMS_MESSAGES } from "@/utils/constants";
import { getTwilioSASupabaseClient } from "@/utils/supbase";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";

export async function POST(req: Request) {
    const data = await req.formData();

    // validate twilio signature
    const twilioSignature = req.headers.get("x-twilio-signature");
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN!;
    const twilioWebhookUrl = process.env.TWILIO_SMS_WEBHOOK_URL;

    const twilio = require("twilio");
    const valid = twilio.validateRequest(
        twilioAuthToken,
        twilioSignature!,
        twilioWebhookUrl,
        Object.fromEntries(data)
    );
    if (!valid) {
        return new Response("Twilio Signature not valid", {
            status: 405,
        });
    }

    const supabaseClient = await getTwilioSASupabaseClient();

    const fromPhone = data.get("From");
    const toPhone = data.get("To");
    const message = data.get("Body");
    const sid = data.get("SmsSid");

    // retrieve business settings from phone
    const { data: business_settings, error } = await supabaseClient
        .from(TABLE_REG_BUSINESSES)
        .select(`business_settings (*)`)
        .eq("registered_phone", toPhone)
        .single();
    if (error) {
        console.log(
            `error in retrieving business with registered_phone ${toPhone} ${error.message}`
        );
        return new Response(
            `error in retrieving business with registered_phone ${toPhone} ${error.message}`,
            {
                status: 500,
            }
        );
    }

    const { business_settings: settings } = business_settings;
    // retrieve chatbot delay setting
    const chatbotDelay =
        settings?.find((s: any) => s.setting_name == "CHATBOT_DELAY")?.setting_value || 0;

    // insert new message record in the database
    const { data: smsInsert, error: smsInsertError } = await supabaseClient
        .from(TABLE_SMS_MESSAGES)
        .insert({
            from_phone: fromPhone,
            to_phone: toPhone,
            message,
            sid,
            speaker: "User",
            status: "Received",
        })
        .select();

    await supabaseClient.auth.signOut();

    if (smsInsertError) {
        console.log(`error in inserting sms message ${smsInsertError.message}`);
        return new Response(`error in inserting sms message ${smsInsertError.message}`, {
            status: 500,
        });
    }

    // cancel any existing events for processing sms
    await inngest.send({
        name: "sms/respond/cancel",
        data: { fromPhone, toPhone },
    });

    // // emit event process this sms
    await inngest.send({
        name: "sms/respond",
        data: { fromPhone, toPhone, chatbotDelay },
    });

    const twiml = new MessagingResponse();
    const resp = twiml.message("");

    return new Response(resp.toString(), {
        headers: { "Content-Type": "text/xml" },
    });
}

// looks we twilio needs libraries that arent available on edge
// export const runtime = "edge";
