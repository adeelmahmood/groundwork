"use client";

import ListBoxComponent from "@/components/ui/ListBoxComponent";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const supabase = createClientComponentClient();

    const [businesses, setBusinesses] = useState<any>([]);
    const [business, setBusiness] = useState<any>(null);

    async function loadBusinesses() {
        const { data, error } = await supabase.from("registered_businesses").select();
        setBusinesses(data);
        setBusiness(data?.at(0));
    }

    useEffect(() => {
        loadBusinesses();
    }, [supabase]);

    return (
        <div className="flex">
            <aside className="h-screen w-72 border-r border-t border-b border-gray-300 shadow-md rounded-md dark:border-slate-400">
                <div className="flex flex-col">
                    {businesses && businesses.length > 0 && (
                        <div className="px-4 py-4">
                            <ListBoxComponent
                                value={business}
                                setValue={setBusiness}
                                valueDisplay={(c: any) => c?.business_name}
                                options={businesses}
                            />
                        </div>
                    )}
                    <div className="px-4 hover:bg-indigo-400 hover:text-gray-50 dark:hover:bg-gray-200 dark:hover:text-gray-900 hover:cursor-pointer py-4">
                        <Link href={`/contractor/dashboard`}>Home</Link>
                    </div>
                    {business && (
                        <div className="px-4 hover:bg-indigo-400 hover:text-gray-50 dark:hover:bg-gray-200 dark:hover:text-gray-900 hover:cursor-pointer border-t py-4">
                            <Link href={`/contractor/dashboard/interact/${business?.id}`}>
                                Interact with AI Agent
                            </Link>
                        </div>
                    )}
                    {/* {business && (
                        <div className="px-4 hover:bg-indigo-400 hover:text-gray-50 dark:hover:bg-gray-200 dark:hover:text-gray-900 hover:cursor-pointer border-t py-4">
                            Analyze Conversations
                        </div>
                    )} */}
                    {business && (
                        <div className="px-4 hover:bg-indigo-400 hover:text-gray-50 dark:hover:bg-gray-200 dark:hover:text-gray-900 hover:cursor-pointer border-t py-4">
                            <Link href={`/contractor/dashboard/settings/${business?.id}`}>
                                Settings
                            </Link>
                        </div>
                    )}
                </div>
            </aside>

            {children}
        </div>
    );
}
