"use client";

import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import DialogComponent from "@/components/ui/DialogComponent";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Dashboard() {
    const [selected, setSelected] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [deleteModal, setDeleteModal] = useState(false);

    const [businesses, setBusinesses] = useState<any>();

    const supabase = createClientComponentClient();

    async function loadBusinesses() {
        setIsLoading(true);
        const { data, error } = await supabase.from("registered_businesses").select();
        setIsLoading(false);
        setBusinesses(data);
    }

    const deleteBusiness = (b: any) => {
        setSelected(b);
        setDeleteModal(true);
    };

    const handleDeleteBusiness = async (b: any) => {
        setIsDeleting(true);
        const response = await fetch(`/api/business?id=${b.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();
        setIsDeleting(false);

        setBusinesses(businesses.filter((bs: any) => bs.id != b.id));
        return true;
    };

    useEffect(() => {
        loadBusinesses();
    }, [supabase]);

    return (
        <>
            <DialogComponent
                isModelOpen={deleteModal}
                modelCloseHandler={() => {
                    setDeleteModal(!deleteModal);
                    // setDeleteError("");
                }}
                heading="Delete Confirmation"
            >
                {/* {deleteError && <p className="mt-4 text-red-500">{deleteError}</p>} */}
                <p className="mt-4">Are you sure you want to delete this proposal?</p>
                <button
                    className="btn-clear mt-4"
                    disabled={isDeleting}
                    onClick={async () => {
                        const deleted = await handleDeleteBusiness(selected);
                        if (deleted) {
                            setDeleteModal(false);
                        }
                    }}
                >
                    Delete
                </button>
            </DialogComponent>

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
                            {businesses?.map((b: any, i: number) => {
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
                                            <button
                                                className="btn-clear text-sm"
                                                onClick={() => deleteBusiness(b)}
                                            >
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
        </>
    );
}
