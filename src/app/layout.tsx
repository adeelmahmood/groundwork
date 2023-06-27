import "./globals.css";
import { Inter } from "next/font/google";

import { Providers } from "./providers";
import NavbarComponent from "@/components/Navbar";

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
                <Providers>
                    <NavbarComponent />
                    {children}
                    <div className="bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-900 h-full w-full absolute top-1/2 left-0 -z-10"></div>
                </Providers>
            </body>
        </html>
    );
}
