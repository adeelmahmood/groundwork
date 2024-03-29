import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // twilio endpoints handle auth internally
    // if (req.nextUrl.pathname.startsWith("/api/twilio/")) {
    //     if (req.headers.get("Authorization")) {
    //         return res;
    //     } else {
    //         return new Response("Authentication required", {
    //             status: 401,
    //             headers: {
    //                 "WWW-Authenticate": 'Basic realm="Secure Area"',
    //             },
    //         });
    //     }
    // }

    const supabase = createMiddlewareClient({ req, res });

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Check auth condition
    if (session?.user?.email) {
        // Authentication successful, forward request to protected route.
        return res;
    }

    // Auth condition not met, redirect to login page
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
}

export const config = {
    matcher: ["/contractor/:path*"],
};
