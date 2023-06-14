import "./globals.css";
import { Inter } from "next/font/google";

import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import TopGradient from "@/components/ui/TopGradient";
import BottomGradient from "@/components/ui/BottomGradient";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Ground Work",
    description: "Ground Work - Connecting Contractors with Homeowners",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
            ></meta>
            <body className={inter.className}>
                <TopGradient />
                <Navbar />
                <Providers>{children}</Providers>
                <BottomGradient />
            </body>
        </html>
    );
}
