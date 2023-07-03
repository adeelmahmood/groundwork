import { TABLE_LEADS, TABLE_SMS_MESSAGES } from "@/utils/constants";
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

    async updateStatus(sid: string, status: string, statusInfo: string) {
        // update status of message
        const { error } = await this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .update({
                status: status,
                status_info: statusInfo,
            })
            .eq("sid", sid);

        if (error) {
            console.log(`error in updating sms status ${error.message}`);
            throw new Error(`error in updating sms status ${error.message}`);
        }
    }

    async retrieveLeadImages(leadId: string) {
        // retrieve media messages received for this lead
        let query = this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .select()
            .eq("lead_id", leadId)
            .eq("message_type", "image");
        const { data: messages, error } = await query.order("created_at");

        if (error) {
            console.log(`error in retrieving lead images ${error.message}`);
            throw new Error(`error in retrieving lead images ${error.message}`);
        }

        return messages?.flatMap((message) => message.message.split("\n"));
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

    async deleteMessages(fromPhone: string, toPhone: string) {
        // delete messages for pre-lead conversation
        const { error } = await this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .delete()
            .in("from_phone", [fromPhone, toPhone])
            .in("to_phone", [fromPhone, toPhone])
            .is("lead_id", null);

        if (error) {
            console.log(`error in deleting sms messages ${error.message}`);
            throw new Error(`error in deleting sms message ${error.message}`);
        }
    }

    async deleteAllMessages(businessId: string, businessPhone: string, customerPhone: string) {
        // delete messages for this conversation
        const { error } = await this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .delete()
            .in("from_phone", [businessPhone, customerPhone])
            .in("to_phone", [businessPhone, customerPhone]);

        if (error) {
            console.log(`error in deleting sms messages ${error.message}`);
            throw new Error(`error in deleting sms message ${error.message}`);
        }

        // delete any leads from this number
        const { error: leadsDelError } = await this.supabaseClient
            .from(TABLE_LEADS)
            .delete()
            .eq("business_id", businessId)
            .eq("customer_phone", customerPhone);
        if (leadsDelError) {
            console.log(`error in deleting leads ${leadsDelError.message}`);
            throw new Error(`error in deleting leads ${leadsDelError.message}`);
        }
    }
}
