import { TABLE_SMS_MESSAGES } from "@/utils/constants";
import { SupabaseClient } from "@supabase/supabase-js";

export class SmsDataService {
    private supabaseClient: SupabaseClient;

    constructor(supabaseClient: SupabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    async insertSmsMessage(smsData: Record<string, any>) {
        // insert new message in the database
        const { data, error } = await this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .insert(smsData)
            .select();

        if (error) {
            console.log(`error in inserting sms message ${error.message}`);
            throw new Error(`error in inserting sms message ${error.message}`);
        }
    }

    async retrieveMessages(fromPhone: string, toPhone: string) {
        // retrieve messages received and sent
        const { data: messages, error } = await this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .select()
            .in("from_phone", [fromPhone, toPhone])
            .in("to_phone", [fromPhone, toPhone])
            .order("created_at");

        if (error) {
            console.log(`error in retrieving user sms messages ${error.message}`);
            throw new Error(`error in retrieving user sms messages ${error.message}`);
        }

        return messages;
    }

    async deleteMessages(fromPhone: string, toPhone: string) {
        // delete all messages for this conversation
        const { data, error } = await this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .delete()
            .in("from_phone", [fromPhone, toPhone])
            .in("to_phone", [fromPhone, toPhone]);

        if (error) {
            console.log(`error in deleting sms messages ${error.message}`);
            throw new Error(`error in deleting sms message ${error.message}`);
        }
    }
}
