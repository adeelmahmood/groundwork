"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TABLE_REG_BUSINESSES } from "@/utils/constants";
import Sidebar from "../sidebar";
import { useRouter } from "next/navigation";

export default function Dashboard({ params }: { params: { id: string } }) {
    const [businesses, setBusinesses] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);

    const router = useRouter();

    const supabase = createClientComponentClient();

    async function loadBusinesses(id: string) {
        const { data, error } = await supabase.from(TABLE_REG_BUSINESSES).select();
        setBusinesses(data);

        if (!id && data?.length) {
            router.replace(`/contractor/dashboard/${data?.at(0)?.id}`);
        } else {
            setBusiness(data?.find((b) => b.id == id));
        }
    }

    useEffect(() => {
        loadBusinesses(params.id);
    }, [supabase, params]);

    return (
        <>
            <div className="flex">
                <Sidebar businesses={businesses} business={business} setBusiness={setBusiness} />

                <div className="container mx-auto p-6">
                    <h2 className="max-w-6xl text-5xl font-bold tracking-wider text-white mt-8">
                        <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                            {business?.business_name} Dashboard
                        </span>
                    </h2>
                </div>
            </div>
        </>
    );
}
