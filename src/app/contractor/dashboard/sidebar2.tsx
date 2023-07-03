import {
    BoltIcon,
    ChatBubbleLeftIcon,
    ClipboardDocumentCheckIcon,
    Cog6ToothIcon,
    HomeIcon,
} from "@heroicons/react/24/solid";

import { Sidebar } from "flowbite-react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { ContractorDashboardContext } from "./layout";

interface BusinessType {
    id: string;
    business_name: string;
    business_url: string;
}

export default function SidebarComponent2({ businesses }: { businesses: BusinessType[] }) {
    const router = useRouter();
    const selectedSegment = useSelectedLayoutSegment();

    const [business, setBusiness] = useContext(ContractorDashboardContext);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [businessChanged, setBusinessChanged] = useState(false);

    const selectBusiness = (business: any) => {
        setBusiness(business);
        // trigger business changing updates
        setBusinessChanged(true);
        // close businesses drop down
        setDropdownOpen(false);
    };

    useEffect(() => {
        if (businessChanged && !dropdownOpen) {
            router.push(`/contractor/dashboard/${business?.id}`);
        }
    }, [businessChanged, dropdownOpen]);

    useEffect(() => {
        if (!selectedSegment && businesses && businesses.length && !business) {
            const id = businesses[0].id;
            router.replace(`/contractor/dashboard/${id}`);
        }
    }, [businesses, business, selectedSegment]);

    return (
        <>
            {business && (
                <Sidebar aria-label="Sidebar" className="w-72">
                    <Sidebar.Items>
                        <Sidebar.ItemGroup>
                            {/* <Sidebar.Item>
                            <p>Selected Business</p>
                        </Sidebar.Item> */}
                            <Sidebar.Collapse
                                label={business.business_name}
                                className="font-semibold"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                open={dropdownOpen}
                            >
                                {businesses
                                    .filter((b) => b.id != business.id)
                                    .map((b, i) => (
                                        <Sidebar.Item key={i} as="div">
                                            <button onClick={() => selectBusiness(b)}>
                                                {b.business_name}
                                            </button>
                                        </Sidebar.Item>
                                    ))}
                            </Sidebar.Collapse>
                            <Sidebar.Item icon={HomeIcon} as="div">
                                <Link href={`/contractor/dashboard/${business?.id}`}>Home</Link>
                            </Sidebar.Item>
                            <Sidebar.Item icon={ClipboardDocumentCheckIcon} as="div">
                                <Link href={`/contractor/dashboard/leads/${business?.id}`}>
                                    Leads
                                </Link>
                            </Sidebar.Item>
                            <Sidebar.Item icon={ChatBubbleLeftIcon} as="div">
                                <Link href={`/contractor/dashboard/conversations/${business?.id}`}>
                                    Conversations
                                </Link>
                            </Sidebar.Item>
                            <Sidebar.Item icon={BoltIcon} as="div">
                                <Link href={`/contractor/dashboard/interact/${business?.id}`}>
                                    AI Receptionist
                                </Link>
                            </Sidebar.Item>
                            <Sidebar.Item icon={Cog6ToothIcon} as="div">
                                <Link href={`/contractor/dashboard/settings/${business?.id}`}>
                                    Settings
                                </Link>
                            </Sidebar.Item>
                        </Sidebar.ItemGroup>
                    </Sidebar.Items>
                </Sidebar>
            )}
        </>
    );
}
