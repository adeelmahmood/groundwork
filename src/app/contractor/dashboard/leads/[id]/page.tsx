"use client";

import { BusinessDataService } from "@/modules/data/business-service";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import Sidebar from "../../sidebar";
import { TABLE_LEADS } from "@/utils/constants";
import LeadCard from "./LeadCard";

export default function Leads({ params }: { params: { id: string } }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [businesses, setBusinesses] = useState<any>();
    const [business, setBusiness] = useState<any>();

    const [leads, setLeads] = useState<any>();

    const supabase = createClientComponentClient();

    const service = new BusinessDataService(supabase);

    async function loadBusinesses(id: string) {
        const data = await service.retrieveAllBusinesses();
        setBusinesses(data);
        const bdata = data?.find((b) => b.id == id);
        setBusiness(bdata);
    }

    async function loadLeads(id: string) {
        console.log("retrieving leads for ", id);
        const { data, error } = await supabase.from(TABLE_LEADS).select().eq("business_id", id);
        if (error) {
            console.log("error in retrieving leads", error);
        }
        console.log(data);

        setLeads(data);
    }

    useEffect(() => {
        loadBusinesses(params.id);
    }, [supabase, params]);

    useEffect(() => {
        if (business?.id) {
            loadLeads(business.id);
        }
    }, [business]);

    return (
        <div className="flex">
            <Sidebar businesses={businesses} business={business} />

            <div className="container mx-auto p-6">
                <h2 className="max-w-6xl text-3xl lg:text-5xl font-bold tracking-wide text-white mt-2 lg:mt-8">
                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                        Leads
                    </span>
                </h2>

                {leads && (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-y-8 lg:gap-x-8">
                        {leads.map((lead: any, i: number) => (
                            <LeadCard key={i} lead={lead} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}