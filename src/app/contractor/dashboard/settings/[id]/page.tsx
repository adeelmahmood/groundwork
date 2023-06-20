"use client";

import DialogComponent from "@/components/ui/DialogComponent";
import {
    RECEPTIONIST_PROMPT,
    RECEPTIONIST_PROMPT_TEMPERATURE,
    RECEPTIONIST_PROMPT_TYPE,
    TABLE_BUSINESS_PROMPTS,
    TABLE_REG_BUSINESSES,
} from "@/utils/constants";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../../sidebar";

export default function Settings({ params }: { params: { id: string } }) {
    const [loading, isLoading] = useState(false);
    const [updated, setUpdated] = useState(false);

    const [businesses, setBusinesses] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);

    const [prompt, setPrompt] = useState("");
    const [temperature, setTemperature] = useState<number>(0);

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

        // set the prompt
        setPrompt(
            bData?.business_prompts?.find((p: any) => p.prompt_type == RECEPTIONIST_PROMPT_TYPE)
                ?.prompt || ""
        );
        setTemperature(
            bData?.business_prompts?.find((p: any) => p.prompt_type == RECEPTIONIST_PROMPT_TYPE)
                ?.temperature || 0
        );
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

    const updateSettings = async () => {
        isLoading(true);
        setUpdated(false);

        const { error } = await supabase
            .from(TABLE_BUSINESS_PROMPTS)
            .update({
                prompt,
                temperature,
            })
            .eq("business_id", business.id);
        isLoading(false);
        if (error) {
            console.log(error);
        } else {
            setUpdated(true);
        }
    };

    const resetSettings = async () => {
        setPrompt(RECEPTIONIST_PROMPT);
        setTemperature(RECEPTIONIST_PROMPT_TEMPERATURE);
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

                    <div className="mt-4 w-full max-w-7xl">
                        <label>Prompt</label>
                        <textarea
                            className="mt-2 w-full rounded-lg border-gray-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-200 dark:focus:border-teal-500 dark:focus:ring-teal-500 disabled:bg-gray-100"
                            rows={15}
                            placeholder="Prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />

                        <div className="flex flex-col-reverse gap-y-2 mt-2 lg:mt-0 lg:flex-row lg:gap-y-0 lg:items-center lg:justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    className="btn-primary"
                                    onClick={updateSettings}
                                    disabled={loading}
                                >
                                    Update Settings
                                </button>
                                <button
                                    className="btn-clear"
                                    onClick={resetSettings}
                                    disabled={loading}
                                >
                                    Reset Settings
                                </button>
                                {updated && (
                                    <span className="text-teal-500">Updated Successfully</span>
                                )}
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-x-2">
                                <label>Temp 0 (deterministic) to 1 (creative) </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    className="mt-2 w-24 rounded-lg border-gray-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-200 dark:focus:border-teal-500 dark:focus:ring-teal-500 disabled:bg-gray-100"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
