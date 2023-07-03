import { TABLE_LEADS, TABLE_SMS_MESSAGES } from "@/utils/constants";
import { SupabaseClient } from "@supabase/supabase-js";

export class LeadsDataService {
    private supabaseClient: SupabaseClient;

    constructor(supabaseClient: SupabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    async insertLead(lead: any, messages: Record<string, any>[]) {
        const { data: existing, error: existingErr } = await this.supabaseClient
            .from(TABLE_LEADS)
            .select("id")
            .eq("business_id", lead.business_id)
            .eq("customer_phone", lead.customer_phone)
            .single();

        if (existing && !existingErr) {
            console.log(
                "found existing lead to update but not doing anything with it for now",
                existing
            );
        }

        // insert new lead or update existing one in the database
        const { data, error } = await this.supabaseClient
            .from(TABLE_LEADS)
            .insert(lead)
            .select()
            .single();

        if (error) {
            console.log(`error in inserting/updating lead ${error.message}`);
            throw new Error(`error in inserting/updating lead ${error.message}`);
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
