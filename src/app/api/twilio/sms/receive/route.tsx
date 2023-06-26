import { SmsProcessor } from "@/modules/processor/sms-processor";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";

export async function POST(req: Request) {
    const data = await req.formData();

    const twilioSignature = req.headers.get("x-twilio-signature");
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN!;
    const twilioWebhookUrl = process.env.TWILIO_SMS_WEBHOOK_URL;

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
            return new Response("Twilio Signature not valid", {
                status: 405,
            });
        }

        // process the incoming sms message
        const smsProcessor = new SmsProcessor();
        let resp = "";

        // command or message
        const message = data.get("Body")?.toString().toLowerCase().trim();
        const command = message?.startsWith("/") ? message.split("/")[1] : null;
        if (command) {
            resp = (await smsProcessor.processCommand(command, data)) || "";
        } else {
            await smsProcessor.processIncomingSms(data);
        }

        // respond to twilio
        const twiml = new MessagingResponse();
        const response = twiml.message(resp);

        return new Response(response.toString(), {
            headers: { "Content-Type": "text/xml" },
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: (e as any).message }), {
            status: 500,
            headers: { "Content-Type": "text/xml" },
        });
    }
}

// looks we twilio needs libraries that arent available on edge
// export const runtime = "edge";
