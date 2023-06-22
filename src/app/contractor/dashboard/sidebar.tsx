import ListBoxComponent from "@/components/ui/ListBoxComponent";
import { ArrowLeftCircleIcon, Bars2Icon } from "@heroicons/react/24/solid";

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

    const [open, setOpen] = useState(true);

    return (
        <>
            <aside className={`${open ? "w-72" : "w-8"}`}>
                <div className="h-screen border-r border-t border-b border-gray-300 shadow-md rounded-md dark:border-slate-400">
                    <div className="relative mt-1 z-10">
                        <Bars2Icon
                            onClick={() => setOpen(!open)}
                            className={`absolute h-8 fill-current text-gray-500 hover:text-gray-900 cursor-pointer rotate-90 ${
                                !open ? "" : "-right-1"
                            }`}
                        />
                    </div>
                    {business && businesses.length && open && (
                        <div className="mt-8 flex flex-col">
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
                                    Interact with AI Receptionist
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
