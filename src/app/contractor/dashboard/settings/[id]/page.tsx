"use client";

import DialogComponent from "@/components/ui/DialogComponent";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import PromptConfig from "./PromptConfig";
import SettingConfig from "./SettingConfig";
import { BusinessDataService } from "@/modules/data/business-service";
import { Button } from "flowbite-react";
import { ContractorDashboardContext } from "../../layout";

export default function Settings({ params }: { params: { id: string } }) {
    const [loading, isLoading] = useState(false);

    const [business, setBusiness] = useContext(ContractorDashboardContext);

    const [deleteModal, setDeleteModal] = useState(false);

    const supabase = createClientComponentClient();

    const router = useRouter();

    const service = new BusinessDataService(supabase);

    async function loadBusiness(id: string) {
        const bdata = await service.retrieveBusinessById(id);
        setBusiness(bdata);
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
        if (params.id) {
            loadBusiness(params.id);
        }
    }, [supabase, params]);

    if (!business) return;

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

            <div className="container mx-auto p-6 border rounded-md shadow-md">
                <h2 className="max-w-6xl text-5xl font-bold tracking-wider text-white mt-8">
                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                        Settings
                    </span>
                </h2>

                <div className="flex flex-col mt-8">
                    <p>Edit the settings for this business</p>
                    <Button className="w-72 mt-2" href={`/contractor/register?id=${business?.id}`}>
                        Edit Business
                    </Button>
                </div>

                <div className="flex flex-col mt-8">
                    <p>Delete this business</p>
                    <Button
                        className="w-72 mt-2"
                        color="failure"
                        onClick={() => setDeleteModal(true)}
                        disabled={loading}
                    >
                        Delete Business
                    </Button>
                </div>

                <div className="mt-10 flex items-center">
                    <div className="flex-grow border-t border-gray-400 dark:border-gray-200"></div>
                    <span className="mx-4 flex-shrink text-gray-400 dark:text-gray-200">
                        Admin Settings
                    </span>
                    <div className="flex-grow border-t border-gray-400 dark:border-gray-200"></div>
                </div>

                {business?.business_settings?.map((setting: any, i: number) => (
                    <SettingConfig key={i} setting={setting} />
                ))}

                {business?.business_prompts
                    ?.sort((a: any, b: any) => (a.order > b.order ? 1 : -1))
                    .map((prompt: any, i: number) => (
                        <PromptConfig key={i} businessPrompt={prompt} />
                    ))}
            </div>
        </>
    );
}
