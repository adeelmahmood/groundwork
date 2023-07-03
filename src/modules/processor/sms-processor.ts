import { getTwilioSASupabaseClient } from "@/utils/supbase";
import { BusinessDataService } from "../data/business-service";
import { SmsDataService } from "../data/sms-service";
import { inngest } from "@/inngest/client";
import { AiLeadsHandler } from "../ai/leads-handler";

export class SmsProcessor {
    constructor() {}

    SUPPORTED_MEDIA_TYPES = ["image/jpeg", "image/jpg", "image/png"];

    async processIncomingMms(smsData: Record<string, any>) {
        const mediaUrls = [];
        const numMedia = smsData.get("NumMedia");

        for (let i = 0; i < numMedia; i++) {
            // check if content type is supported
            const contentType = smsData.get(`MediaContentType${i}`);
            if (this.SUPPORTED_MEDIA_TYPES.includes(contentType)) {
                // get media url
                const mediaUrl = smsData.get(`MediaUrl${i}`);
                mediaUrls.push(`![](${mediaUrl})`);
            } else {
                return `content type ${contentType} not supported`;
            }
        }

        const fromPhone = smsData.get("From");
        const toPhone = smsData.get("To");
        const sid = smsData.get("MessageSid");
        const message = mediaUrls.join("\n");

        // process as text message
        await this.processMessage(fromPhone, toPhone, message, sid, "image");
    }

    async processIncomingSms(smsData: Record<string, any>) {
        const fromPhone = smsData.get("From");
        const toPhone = smsData.get("To");
        const message = smsData.get("Body");
        const sid = smsData.get("MessageSid");

        await this.processMessage(fromPhone, toPhone, message, sid);
    }

    async processMessage(
        fromPhone: string,
        toPhone: string,
        message: string,
        sid: string,
        messageType: string = "text"
    ) {
        // twilio db service account
        const supabaseClient = await getTwilioSASupabaseClient();

        // business data service
        const businessService = new BusinessDataService(supabaseClient);
        // sms data service
        const smsService = new SmsDataService(supabaseClient);

        try {
            // retrieve sms response delay setting
            const responseDelay = await businessService.retrieveBusinessSetting(
                {
                    key: "registered_phone",
                    value: toPhone,
                },
                "CHATBOT_DELAY"
            );

            // insert sms message in db
            await smsService.insertSmsMessage({
                from_phone: fromPhone,
                to_phone: toPhone,
                message,
                sid,
                speaker: "User",
                status: "Received",
                message_type: messageType,
            });

            // finally, emit event to process this sms
            // cancel any existing events for processing sms
            await inngest.send({
                name: "sms/respond/cancel",
                data: { fromPhone, toPhone },
            });

            // emit event process this sms
            await inngest.send({
                name: "sms/respond",
                data: { fromPhone, toPhone, responseDelay },
            });
        } catch (e) {
            throw e;
        } finally {
            // make sure to close the db connection
            await supabaseClient.auth.signOut();
        }
    }

    async processCommand(command: string, smsData: Record<string, any>) {
        // twilio db service account
        const supabaseClient = await getTwilioSASupabaseClient();

        // sms data service
        const smsService = new SmsDataService(supabaseClient);
        // ai leads handler
        const leadsHandler = new AiLeadsHandler();
        // business data service
        const businessService = new BusinessDataService(supabaseClient);

        try {
            const fromPhone = smsData.get("From");
            const toPhone = smsData.get("To");
            let response;

            switch (command) {
                // remove all messages and leads for this conversation
                case "reset":
                    const business = await businessService.retrieveBusiness([
                        {
                            key: "registered_phone",
                            value: toPhone,
                        },
                    ]);
                    await smsService.deleteAllMessages(
                        business.id,
                        business.registered_phone,
                        fromPhone
                    );
                    response = "[All previous messages deleted from and to this number]";
                    break;
                // remove all messages for this conversation
                case "clear":
                    await smsService.deleteMessages(fromPhone, toPhone);
                    response = "[Current conversation deleted from and to this number]";
                    break;
                // generate lead from conversation
                case "end":
                    const lead = await leadsHandler.generateLead(fromPhone, toPhone);
                    response = lead ? "[Lead generated]" : "[]";
                    break;
            }

            return response;
        } catch (e) {
            throw e;
        } finally {
            // make sure to close the db connection
            await supabaseClient.auth.signOut();
        }
    }
}
