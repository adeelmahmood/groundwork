import { TABLE_SMS_MESSAGES } from "@/utils/constants";
import { SupabaseClient } from "@supabase/auth-helpers-nextjs";

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

    async retrieveLeadMessages(fromPhone: string, toPhone: string, leadId: string) {
        // retrieve messages received and sent
        let query = this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .select()
            .in("from_phone", [fromPhone, toPhone])
            .in("to_phone", [fromPhone, toPhone])
            .eq("lead_id", leadId);
        const { data: messages, error } = await query.order("created_at");

        if (error) {
            console.log(`error in retrieving lead messages ${error.message}`);
            throw new Error(`error in retrieving lead messages ${error.message}`);
        }

        return messages;
    }

    async retrieveMessages(fromPhone: string, toPhone: string, openOnly = true) {
        // retrieve messages received and sent
        let query = this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .select()
            .in("from_phone", [fromPhone, toPhone])
            .in("to_phone", [fromPhone, toPhone]);

        // openOnly = messages not attached to a generated lead
        if (openOnly) {
            query.is("lead_id", null);
        }

        const { data: messages, error } = await query.order("created_at");

        if (error) {
            console.log(`error in retrieving user sms messages ${error.message}`);
            throw new Error(`error in retrieving user sms messages ${error.message}`);
        }

        return messages;
    }

    async deleteMessages(fromPhone: string, toPhone: string, openOnly = true) {
        // delete messages for this conversation
        let query = this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .delete()
            .in("from_phone", [fromPhone, toPhone])
            .in("to_phone", [fromPhone, toPhone]);

        // openOnly = messages not attached to a generated lead
        if (openOnly) {
            query.is("lead_id", null);
        }

        const { error } = await query;

        if (error) {
            console.log(`error in deleting sms messages ${error.message}`);
            throw new Error(`error in deleting sms message ${error.message}`);
        }
    }
}
