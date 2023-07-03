"use client";

import { BusinessDataService } from "@/modules/data/business-service";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useContext, useEffect, useState } from "react";
import { TABLE_LEADS } from "@/utils/constants";
import LeadCard from "./LeadCard";
import { ContractorDashboardContext } from "../../layout";
import { SmsDataService } from "@/modules/data/sms-service";

export default function Leads({ params }: { params: { id: string } }) {
    const [business, setBusiness] = useContext(ContractorDashboardContext);

    const [leads, setLeads] = useState<any>();

    const supabase = createClientComponentClient();

    const service = new BusinessDataService(supabase);
    const smsService = new SmsDataService(supabase);

    async function loadBusiness(id: string) {
        const data = await service.retrieveBusinessById(id);
        setBusiness(data);
    }

    async function loadLeads(id: string) {
        const { data, error } = await supabase.from(TABLE_LEADS).select().eq("business_id", id);

        if (error) {
            console.log("error in retrieving leads", error);
        }

        if (!data) {
            console.error("No leads data found.");
            return;
        }

        const leadsWithImages = await Promise.all(
            data.map(async (lead: any) => {
                const images: string[] = await smsService.retrieveLeadImages(lead.id);
                return { ...lead, images };
            })
        );

        setLeads(leadsWithImages);
    }

    useEffect(() => {
        if (params.id) {
            loadBusiness(params.id);
        }
    }, [supabase, params]);

    useEffect(() => {
        if (business?.id) {
            loadLeads(business.id);
        }
    }, [business]);

    if (!business) return;

    return (
        <div className="container mx-auto p-6 border rounded-md shadow-md">
            <h2 className="max-w-6xl text-3xl lg:text-5xl font-bold tracking-wide text-white mt-2 lg:mt-8">
                <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                    Leads
                </span>
            </h2>

            {leads && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 lg:gap-x-8 items-start">
                    {leads.map((lead: any, i: number) => (
                        <LeadCard key={i} lead={lead} showViewConversation={true} />
                    ))}
                </div>
            )}
        </div>
    );
}
