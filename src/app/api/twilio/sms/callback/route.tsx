import { SmsDataService } from "@/modules/data/sms-service";
import { getTwilioSASupabaseClient } from "@/utils/supbase";

export async function POST(req: Request) {
    const data = await req.formData();

    const twilioSignature = req.headers.get("x-twilio-signature");
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN!;
    const twilioWebhookUrl = process.env.TWILIO_SMS_CALLBACK_URL;

    const twilio = require("twilio");

    try {
        // validate twilio signature
        const valid = twilio.validateRequest(
            twilioAuthToken,
            twilioSignature!,
            twilioWebhookUrl,
            Object.fromEntries(data)
        );
        if (!valid) {
            console.log("Invalid Twilio signature, Rejecting callback call");
            return new Response("Twilio Signature not valid", {
                status: 405,
            });
        }

        const sid = data.get("MessageSid")?.toString() || "";
        const status = data.get("MessageStatus")?.toString() || "";
        const statusInfo =
            status == "failed" || status == "undelivered"
                ? data.get("ErrorMessage")?.toString() || ""
                : "";

        if (["delivered", "undelivered", "failed"].includes(status)) {
            const supbaseClient = await getTwilioSASupabaseClient();
            const smsService = new SmsDataService(supbaseClient);

            // update message status
            await smsService.updateStatus(sid, status, statusInfo);
        }

        return new Response();
    } catch (e) {
        return new Response(JSON.stringify({ error: (e as any).message }), {
            status: 500,
            headers: { "Content-Type": "text/xml" },
        });
    }
}
