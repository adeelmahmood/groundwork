"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSearchParams } from "next/navigation";

export default function Login({}) {
    const searchParams = useSearchParams();
    const redirectedFrom = searchParams.get("redirectedFrom");

    const redirectURL = () => {
        let url =
            process?.env?.NEXT_PUBLIC_OAUTH_REDIRECT_URL ?? // Manually set in vercel (mainly for staging)
            process?.env?.NEXT_PUBLIC_SITE_URL ?? // This points to prod url
            "http://localhost:3000"; // local
        // Make sure to include `https://` when not localhost.
        url = url.includes("http") ? url : `https://${url}`;
        // Make sure to including trailing `/`.
        // url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
        // if redirect query is provided, add that too
        if (redirectedFrom) {
            url = `${url}${encodeURI(redirectedFrom)}`;
        }
        return url;
    };

    const supabase = createClientComponentClient();

    return (
        <>
            <div className="container mx-auto p-6">
                <div className="flex items-start justify-center">
                    <div className="w-96 rounded-lg p-6 shadow-lg md:mt-10">
                        <Auth
                            supabaseClient={supabase}
                            appearance={{
                                theme: ThemeSupa,
                            }}
                            providers={["google"]}
                            redirectTo={redirectURL()}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
