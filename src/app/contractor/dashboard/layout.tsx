"use client";

import { BusinessDataService } from "@/modules/data/business-service";
import { SupabaseClient, createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import SidebarComponent from "./sidebar";
import { Dispatch, SetStateAction, createContext, useEffect, useState } from "react";
import SidebarComponent2 from "./sidebar2";

export const ContractorDashboardContext = createContext<[any, Dispatch<SetStateAction<any>>]>([
    null,
    () => {},
]);

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const supabase = createClientComponentClient();

    const [businesses, setBusinesses] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);

    async function loadBusinesses(supabaseClient: SupabaseClient) {
        const service = new BusinessDataService(supabaseClient);
        const data = await service.retrieveAllBusinesses();
        setBusinesses(data);
    }

    useEffect(() => {
        loadBusinesses(supabase);
    }, [router]);

    return (
        <div className="flex">
            <ContractorDashboardContext.Provider value={[business, setBusiness]}>
                {businesses && <SidebarComponent2 businesses={businesses} />}
                {children}
            </ContractorDashboardContext.Provider>
        </div>
    );
}
