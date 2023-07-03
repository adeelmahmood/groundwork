import { getTwilioSASupabaseClient } from "@/utils/supbase";
import { BusinessDataService } from "../data/business-service";
import { SmsDataService } from "../data/sms-service";
import { TwilioClient } from "../clients/twilio-client";
import { AiReceptionistClient } from "../clients/receptionist-client";
import { SimpleChatMessage } from "@/app/types";
import { inngest } from "@/inngest/client";

export class AiReceptionist {
    private client: AiReceptionistClient;

    constructor() {
        this.client = new AiReceptionistClient();
    }

    async generateResponse(fromPhone: string, toPhone: string) {
        // twilio db service account
        const supabaseClient = await getTwilioSASupabaseClient();

        // business data service
        const businessService = new BusinessDataService(supabaseClient);
        // sms data service
        const smsService = new SmsDataService(supabaseClient);

        try {
            // retrieve all messages
            const messages = await smsService.retrieveMessages(fromPhone, toPhone, false);
            if (messages.length == 0) {
                console.log("no messages to process, returning");
                return;
            }
            if (messages[messages.length - 1].speaker == "Assistant") {
                console.log("already responded");
                return;
            }
            if (messages.find((m) => m.speaker == "Assistant" && m.message.includes("/END"))) {
                console.log("conversation already closed, no need to respond");
                return;
            }

            // retrieve business
            const business = await businessService.retrieveBusiness([
                {
                    key: "registered_phone",
                    value: toPhone,
                },
            ]);

            // retrieve the receptionist prompt for this business
            const promptConfig = business.business_prompts?.find(
                (p: any) => p.prompt_type == "receptionist"
            );

            // create input and history
            const { input, history } = this.extractInputAndHistory(messages);

            // call the ai receptionist
            const response = await this.client.reply(input, history, business, promptConfig);
            return response;
        } catch (e) {
            throw e;
        } finally {
            // make sure to close the db connection
            await supabaseClient.auth.signOut();
        }
    }

    async sendResponse(fromPhone: string, toPhone: string, message: string) {
        // twilio db service account
        const supabaseClient = await getTwilioSASupabaseClient();

        // sms data service
        const smsService = new SmsDataService(supabaseClient);
        // twilio client
        const twilio = new TwilioClient();

        try {
            let messageToSend = message;

            // check if we have all the answers
            const isDone = message.includes("/END");
            if (isDone) {
                messageToSend = messageToSend.replaceAll("/END", "");

                await inngest.send({
                    name: "generate/lead",
                    data: { fromPhone, toPhone },
                });
            }

            // send the ai response to caller
            const sent = await twilio.sendMessage(toPhone, fromPhone, messageToSend);

            // add ai response to messages history
            smsService.insertSmsMessage({
                from_phone: toPhone,
                to_phone: fromPhone,
                message,
                sid: sent.sid,
                speaker: "Assistant",
                status: "Sent",
            });
        } catch (e) {
            throw e;
        } finally {
            // make sure to close the db connection
            await supabaseClient.auth.signOut();
        }
    }

    extractInputAndHistory(messages: any) {
        const chatMessages: SimpleChatMessage[] = messages.map((m: any) => {
            return {
                message: m.message,
                speaker: m.speaker,
            } as SimpleChatMessage;
        });

        // input is the most recent message
        const input = chatMessages[chatMessages.length - 1];
        // everything else becomes history
        const history = chatMessages.slice(0, chatMessages.length - 1);
        return { input, history };
    }
}
