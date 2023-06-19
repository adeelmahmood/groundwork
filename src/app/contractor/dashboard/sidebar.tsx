import ListBoxComponent from "@/components/ui/ListBoxComponent";
import { ArrowLeftCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BusinessType {
    id: string;
    business_name: string;
    business_url: string;
}

export default function Sidebar({
    businesses,
    business,
    setBusiness = null,
}: {
    businesses: BusinessType[];
    business: BusinessType;
    setBusiness: any;
}) {
    const router = useRouter();

    return (
        <aside className="h-screen w-72 border-r border-t border-b border-gray-300 shadow-md rounded-md dark:border-slate-400">
            <div className="flex flex-col">
                {businesses && businesses.length > 0 && (
                    <div className="px-4 py-4 mt-4">
                        <ListBoxComponent
                            value={business}
                            setValue={(b: any) => router.replace(`/contractor/dashboard/${b.id}`)}
                            // setValue={setBusiness}
                            valueDisplay={(c: any) => c?.business_name}
                            options={businesses}
                        />
                    </div>
                )}
                <div className="px-4 hover:bg-indigo-400 hover:text-gray-50 dark:hover:bg-gray-200 dark:hover:text-gray-900 hover:cursor-pointer py-4">
                    <Link href={`/contractor/dashboard/${business?.id}`}>Home</Link>
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
    );
}
