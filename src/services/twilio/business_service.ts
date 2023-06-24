import { TABLE_REG_BUSINESSES } from "@/utils/constants";
import { SupabaseClient } from "@supabase/supabase-js";

export interface FilterParam {
    key: string;
    value: string;
}

export interface SettingType {}

export const getBusinessSettingsByParams = async (
    supabaseClient: SupabaseClient,
    filterParams: FilterParam[]
) => {
    // const { data: business_settings, error } = await supabaseClient
    //     .from(TABLE_REG_BUSINESSES)
    //     .select(`business_settings (*)`)
    //     .eq("registered_phone", toPhone)
    //     .single();
    // if (error) {
    //     console.log(
    //         `error in retrieving business with registered_phone ${toPhone} ${error.message}`
    //     );
    //     return new Response(
    //         `error in retrieving business with registered_phone ${toPhone} ${error.message}`,
    //         {
    //             status: 500,
    //         }
    //     );
    // }
    // const { business_settings: settings } = business_settings;
    // // retrieve chatbot delay setting
    // const chatbotDelay =
    //     settings?.find((s: any) => s.setting_name == "CHATBOT_DELAY")?.setting_value || 0;
};
