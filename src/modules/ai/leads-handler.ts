import { getTwilioSASupabaseClient } from "@/utils/supbase";
import { AiLeadsClient } from "../clients/leads-client";
import { SmsDataService } from "../data/sms-service";
import { BusinessDataService } from "../data/business-service";
import { LeadsDataService } from "../data/leads-service";
import { SimpleChatMessage } from "@/app/types";

export class AiLeadsHandler {
    private client: AiLeadsClient;

    constructor() {
        this.client = new AiLeadsClient();
    }

    async generateLead(fromPhone: string, toPhone: string) {
        // twilio db service account
        const supabaseClient = await getTwilioSASupabaseClient();

        // business data service
        const businessService = new BusinessDataService(supabaseClient);
        // sms data service
        const smsService = new SmsDataService(supabaseClient);
        // leads data service
        const leadsService = new LeadsDataService(supabaseClient);

        try {
            // retrieve all messages
            const messages = await smsService.retrieveMessages(fromPhone, toPhone);
            if (messages.length == 0) {
                console.log("no messages to process, returning");
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
                (p: any) => p.prompt_type == "summarizer"
            );

            // conversation
            const conversation: SimpleChatMessage[] = messages.map((m: any) => {
                return {
                    message: m.message,
                    speaker: m.speaker,
                } as SimpleChatMessage;
            });

            // call the ai agent
            const response = await this.client.generate(conversation, promptConfig);
            const lead = {
                ...response,
                business_id: business.id,
                customer_phone: fromPhone,
            };

            // save this lead
            const saved = await leadsService.insertLead(lead, messages);
            return saved;
        } catch (e) {
            throw e;
        } finally {
            // make sure to close the db connection
            await supabaseClient.auth.signOut();
        }
    }
}
