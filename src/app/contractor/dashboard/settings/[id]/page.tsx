"use client";

import DialogComponent from "@/components/ui/DialogComponent";
import { TABLE_REG_BUSINESSES } from "@/utils/constants";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../../sidebar";
import PromptConfig from "./PromptConfig";

export default function Settings({ params }: { params: { id: string } }) {
    const [loading, isLoading] = useState(false);

    const [businesses, setBusinesses] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);

    const [deleteModal, setDeleteModal] = useState(false);

    const supabase = createClientComponentClient();

    const router = useRouter();

    async function loadBusinesses(id: string) {
        const { data, error } = await supabase
            .from(TABLE_REG_BUSINESSES)
            .select(`*,business_prompts (*)`);

        setBusinesses(data);
        const bData = data?.find((b) => b.id == id);
        setBusiness(bData);
    }

    const handleDeleteBusiness = async () => {
        isLoading(true);
        const response = await fetch(`/api/business?id=${business.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        isLoading(false);

        const data = await response.json();
        router.replace("/contractor/dashboard");
    };

    useEffect(() => {
        loadBusinesses(params.id);
    }, [supabase, params]);

    return (
        <>
            <DialogComponent
                isModelOpen={deleteModal}
                modelCloseHandler={() => {
                    setDeleteModal(!deleteModal);
                }}
                heading="Delete Confirmation"
            >
                {/* {deleteError && <p className="mt-4 text-red-500">{deleteError}</p>} */}
                <p className="mt-4">Are you sure you want to delete this business?</p>
                <button
                    className="btn-clear mt-4"
                    disabled={loading}
                    onClick={async () => {
                        const deleted = await handleDeleteBusiness();
                        setDeleteModal(false);
                    }}
                >
                    Delete
                </button>
            </DialogComponent>

            <div className="flex">
                <Sidebar businesses={businesses} business={business} />

                <div className="container mx-auto p-6">
                    <h2 className="max-w-6xl text-5xl font-bold tracking-wider text-white mt-8">
                        <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                            Settings
                        </span>
                    </h2>

                    <div className="flex flex-col mt-8">
                        <p>Edit the settings for this business</p>
                        <Link
                            className="btn-clear w-72 text-center mt-2"
                            href={`/contractor/register?id=${business?.id}`}
                        >
                            Edit Business
                        </Link>
                    </div>

                    <div className="flex flex-col mt-8">
                        <p>Delete this business</p>
                        <button
                            className="btn-clear w-72 text-center mt-2"
                            onClick={() => setDeleteModal(true)}
                            disabled={loading}
                        >
                            Delete Business
                        </button>
                    </div>

                    <div className="mt-10 flex items-center">
                        <div className="flex-grow border-t border-gray-400 dark:border-gray-200"></div>
                        <span className="mx-4 flex-shrink text-gray-400 dark:text-gray-200">
                            Admin Settings
                        </span>
                        <div className="flex-grow border-t border-gray-400 dark:border-gray-200"></div>
                    </div>

                    {business?.business_prompts?.map((prompt: any, i: number) => (
                        <PromptConfig key={i} businessPrompt={prompt} />
                    ))}
                </div>
            </div>
        </>
    );
}
