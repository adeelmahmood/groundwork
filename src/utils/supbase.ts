import { createClient } from "@supabase/supabase-js";

export async function getTwilioSASupabaseClient() {
    // create supabase client
    const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false,
            },
        }
    );
    // sign in using TWILO service account creds
    const token = await supabaseClient.auth.signInWithPassword({
        email: process.env.TWILIO_USERNAME!,
        password: process.env.TWILIO_PASSWORD!,
    });

    return supabaseClient;
}
