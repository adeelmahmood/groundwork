import { TABLE_LEADS, TABLE_SMS_MESSAGES } from "@/utils/constants";
import { SupabaseClient } from "@supabase/supabase-js";

export class LeadsDataService {
    private supabaseClient: SupabaseClient;

    constructor(supabaseClient: SupabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    async insertLead(lead: any, messages: Record<string, any>[]) {
        // insert new lead in the database
        const { data, error } = await this.supabaseClient
            .from(TABLE_LEADS)
            .insert(lead)
            .select()
            .single();

        if (error) {
            console.log(`error in inserting lead ${error.message}`);
            throw new Error(`error in inserting lead ${error.message}`);
        }

        const updates = messages.map((m) => ({
            id: m.id,
            lead_id: data.id,
        }));

        // update all messages to be attached to this lead
        const { error: updateError } = await this.supabaseClient
            .from(TABLE_SMS_MESSAGES)
            .upsert(updates);
        if (updateError) {
            console.log(`error in updating message to attach lead ${updateError.message}`);
            throw new Error(`error in updating message to attach lead ${updateError.message}`);
        }

        return data;
    }
}
