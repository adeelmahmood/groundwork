import { TABLE_REG_BUSINESSES } from "@/utils/constants";
import { SupabaseClient } from "@supabase/auth-helpers-nextjs";

export class BusinessDataService {
    private supabaseClient: SupabaseClient;

    constructor(supabaseClient: SupabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    async retrieveAllBusinesses() {
        const { data: businesses, error } = await this.supabaseClient
            .from(TABLE_REG_BUSINESSES)
            .select(`id, business_name`)
            .order("created_at", { ascending: false });
        if (error) {
            console.log(`error in retrieving all businesses: ${error}`);
            throw new Error(`error in retrieving all businesses: ${error}`);
        }
        return businesses;
    }

    async retrieveBusinessById(id: string) {
        return await this.retrieveBusiness([
            {
                key: "id",
                value: id,
            },
        ]);
    }

    async retrieveBusiness(filter: [{ key: string; value: string }] | null) {
        let query = this.supabaseClient
            .from(TABLE_REG_BUSINESSES)
            .select(`*, business_prompts (*), business_settings (*)`);

        // apply filters
        filter?.map((f) => query.eq(f.key, f.value));

        const { data: business, error } = await query.single();
        if (error) {
            console.log(`error in retrieving business: ${error}`);
            throw new Error(`error in retrieving business: ${error}`);
        }
        return business;
    }

    async retrieveBusinessSetting(filter: { key: string; value: string }, setting: string) {
        const { data: business_settings, error } = await this.supabaseClient
            .from(TABLE_REG_BUSINESSES)
            .select(`business_settings (*)`)
            .eq(filter.key, filter.value)
            .single();
        if (error) {
            console.log(
                `error in retrieving business with ${filter.key}=${filter.value}: ${error.message}`
            );
            throw new Error(
                `error in retrieving business with ${filter.key}=${filter.value}: ${error.message}`
            );
        }

        const { business_settings: settings } = business_settings;
        return settings?.find((s: any) => s.setting_name == setting)?.setting_value;
    }
}
