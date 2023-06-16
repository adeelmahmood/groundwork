import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Dashboard() {
    const supabase = createServerComponentClient({ cookies });

    const { data: registeredBusinesses } = await supabase.from("registered_businesses").select();

    return (
        <div className="container mx-auto p-6">
            <h2 className="max-w-6xl text-5xl font-bold tracking-wider text-white mt-8">
                <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                    Contractor Dashboard
                </span>
            </h2>

            <div className="mt-8 hidden w-full overflow-x-auto rounded-lg shadow-md sm:flex">
                <table className="w-full text-left text-sm text-gray-800">
                    <thead className="bg-slate-600 text-xs uppercase tracking-wider text-gray-200 dark:bg-gray-600">
                        <tr>
                            <th scope="col" className="py-3 px-6" colSpan={2}>
                                Registered Business
                            </th>
                            <th scope="col" className="py-3 px-6 text-center">
                                Interact With AI Agent
                            </th>
                            <th scope="col" className="py-3 px-6 text-center">
                                Edit
                            </th>
                            <th scope="col" className="py-3 px-6 text-center">
                                Delete
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {registeredBusinesses?.map((b, i) => {
                            return (
                                <tr
                                    key={i}
                                    className="border-t border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-500 dark:bg-gray-500/20 dark:hover:bg-gray-600/20"
                                >
                                    <td className="py-4 px-6" colSpan={2}>
                                        <div>
                                            <div className="text-xl dark:text-gray-300 uppercase tracking-wide">
                                                {b.business_name}
                                            </div>
                                            <div className="dark:text-green-300 text-indigo-500">
                                                <a href={b.business_url} target="_blank">
                                                    {b.business_url}
                                                </a>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        {b.crawl_completed && (
                                            <Link
                                                className="btn-clear text-sm"
                                                href={`/contractor/interact/${b.id}`}
                                            >
                                                <ChatBubbleLeftIcon className="inline h-6 fill-current mr-2 text-gray-600" />
                                                <span>Interact with AI Agent</span>
                                            </Link>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button className="btn-clear text-sm" disabled={true}>
                                            Edit
                                        </button>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <button className="btn-clear text-sm" disabled={true}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
