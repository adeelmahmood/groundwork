import ListBoxComponent from "@/components/ui/ListBoxComponent";
import { Bars2Icon } from "@heroicons/react/24/solid";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BusinessType {
    id: string;
    business_name: string;
    business_url: string;
}

export default function Sidebar({
    businesses,
    business,
}: {
    businesses: BusinessType[];
    business: BusinessType;
}) {
    const router = useRouter();

    const [open, setOpen] = useState(false);

    return (
        <>
            {!open && (
                <div className="lg:hidden">
                    <button onClick={() => setOpen(!open)}>
                        <Bars2Icon className="h-8 fill-current text-indigo-700 focus:outline-none dark:text-gray-200" />
                    </button>
                </div>
            )}
            <aside
                className={`${
                    !open ? "hidden lg:block" : "fixed block bg-gray-50 dark:bg-gray-800"
                }`}
            >
                <div className="h-screen w-72 border-r border-t border-b border-gray-300 shadow-md rounded-md dark:border-slate-400">
                    {open && (
                        <div>
                            <button onClick={() => setOpen(!open)}>
                                <Bars2Icon className="h-8 fill-current text-indigo-700 focus:outline-none dark:text-gray-200" />
                            </button>
                        </div>
                    )}
                    {business && businesses.length && (
                        <div className="flex flex-col">
                            <div className="px-4 py-4">
                                <ListBoxComponent
                                    value={business}
                                    setValue={(b: any) =>
                                        router.replace(`/contractor/dashboard/${b.id}`)
                                    }
                                    valueDisplay={(c: any) => c?.business_name}
                                    options={businesses}
                                />
                            </div>
                            <div className="px-4 hover:bg-indigo-400 hover:text-gray-50 dark:hover:bg-gray-200 dark:hover:text-gray-900 hover:cursor-pointer py-4">
                                <Link href={`/contractor/dashboard/${business?.id}`}>Home</Link>
                            </div>
                            <div className="px-4 hover:bg-indigo-400 hover:text-gray-50 dark:hover:bg-gray-200 dark:hover:text-gray-900 hover:cursor-pointer border-t py-4">
                                <Link href={`/contractor/dashboard/interact/${business?.id}`}>
                                    Interact with AI Agent
                                </Link>
                            </div>

                            <div className="px-4 hover:bg-indigo-400 hover:text-gray-50 dark:hover:bg-gray-200 dark:hover:text-gray-900 hover:cursor-pointer border-t py-4">
                                <Link href={`/contractor/dashboard/analyze/${business?.id}`}>
                                    Analyze Conversation
                                </Link>
                            </div>
                            <div className="px-4 hover:bg-indigo-400 hover:text-gray-50 dark:hover:bg-gray-200 dark:hover:text-gray-900 hover:cursor-pointer border-t py-4">
                                <Link href={`/contractor/dashboard/settings/${business?.id}`}>
                                    Settings
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
