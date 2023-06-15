import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const redirectedFrom = requestUrl.searchParams.get("redirectedFrom");

    const redirectURL = () => {
        let url =
            process?.env?.NEXT_PUBLIC_OAUTH_REDIRECT_URL ?? // Manually set in vercel (mainly for staging)
            process?.env?.NEXT_PUBLIC_SITE_URL ?? // This points to prod url
            "http://localhost:3000/"; // local
        // Make sure to include `https://` when not localhost.
        url = url.includes("http") ? url : `https://${url}`;
        // Make sure to including trailing `/`.
        url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
        // if redirect query is provided, add that too
        if (redirectedFrom) {
            url = `${url}login-redirect?redirectedFrom=${encodeURI(redirectedFrom)}`;
        }
        return url;
    };

    if (code) {
        const supabase = createRouteHandlerClient({ cookies });
        await supabase.auth.exchangeCodeForSession(code);
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(redirectURL());
}
