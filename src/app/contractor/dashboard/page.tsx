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
            </div>
        </>
    );
}
