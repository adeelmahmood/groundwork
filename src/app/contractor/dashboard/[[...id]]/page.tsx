"use client";

import { useContext, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { BusinessDataService } from "@/modules/data/business-service";
import { ContractorDashboardContext } from "../layout";

export default function Dashboard({ params }: { params: { id: string } }) {
    const [business, setBusiness] = useContext(ContractorDashboardContext);

    const router = useRouter();

    const supabase = createClientComponentClient();

    const service = new BusinessDataService(supabase);

    async function loadBusiness(id: string) {
        const data = await service.retrieveBusinessById(id);
        setBusiness(data);
    }

    useEffect(() => {
        if (params.id) {
            loadBusiness(params.id);
        }
    }, [supabase, params]);

    if (!business) return;

    return (
        <>
            <div className="container mx-auto p-6">
                <h2 className="max-w-6xl text-5xl font-bold tracking-wider text-white mt-8">
                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                        {business?.business_name} Dashboard
                    </span>
                </h2>
            </div>
        </>
    );
}
