"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import SidebarComponent from "../sidebar";
import { useRouter } from "next/navigation";
import { BusinessDataService } from "@/modules/data/business-service";

export default function Dashboard({ params }: { params: { id: string } }) {
    const [businesses, setBusinesses] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);

    const router = useRouter();

    const supabase = createClientComponentClient();

    const service = new BusinessDataService(supabase);

    async function loadBusinesses(id: string) {
        const data = await service.retrieveAllBusinesses();
        setBusinesses(data);

        if (!id && data?.length) {
            router.replace(`/contractor/dashboard/${data?.at(0)?.id}`);
        } else {
            setBusiness(data?.find((b: any) => b.id == id));
        }
    }

    useEffect(() => {
        loadBusinesses(params.id);
    }, [supabase, params]);

    if (!business) return;

    return (
        <>
            <div className="flex">
                <SidebarComponent businesses={businesses} business={business} />

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
