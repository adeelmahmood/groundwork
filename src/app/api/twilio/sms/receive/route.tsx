import { inngest } from "@/inngest/client";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";

export async function POST(req: Request) {
    const data = await req.formData();
    console.log(">>", data);
    console.log("** ", req.headers);

    const fromPhone = data.get("From");
    const toPhone = data.get("To");
    const message = data.get("Body");
    const sid = data.get("SmsSid");
    const authToken = req.headers.get("authorization");

    // cancel any existing events for processing sms
    await inngest.send({
        name: "sms/respond/cancel",
        data: { fromPhone, toPhone },
    });
    // emit event process this sms
    await inngest.send({
        name: "sms/respond",
        data: { fromPhone, toPhone, message, sid, authToken },
    });

    const twiml = new MessagingResponse();
    const resp = twiml.message("");

    return new Response(resp.toString(), {
        headers: { "Content-Type": "text/xml" },
    });
}

export const runtime = "edge";
