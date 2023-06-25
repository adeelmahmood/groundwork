import { getTwilioSASupabaseClient } from "@/utils/supbase";
import { BusinessDataService } from "../data/business-service";
import { SmsDataService } from "../data/sms-service";
import { inngest } from "@/inngest/client";

export class SmsProcessor {
    constructor() {}

    async processIncomingSms(smsData: Record<string, any>) {
        // twilio db service account
        const supabaseClient = await getTwilioSASupabaseClient();

        // business data service
        const businessService = new BusinessDataService(supabaseClient);
        // sms data service
        const smsService = new SmsDataService(supabaseClient);

        try {
            const fromPhone = smsData.get("From");
            const toPhone = smsData.get("To");
            const message = smsData.get("Body");
            const sid = smsData.get("SmsSid");

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
}
