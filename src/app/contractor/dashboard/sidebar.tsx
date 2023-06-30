import {
    ArrowLeftCircleIcon,
    ArrowRightCircleIcon,
    BoltIcon,
    ChatBubbleLeftIcon,
    ClipboardDocumentCheckIcon,
    Cog6ToothIcon,
    HomeIcon,
} from "@heroicons/react/24/solid";

import { Sidebar } from "flowbite-react";
import { useState } from "react";

interface BusinessType {
    id: string;
    business_name: string;
    business_url: string;
}

export default function SidebarComponent({
    businesses,
    business,
}: {
    businesses: BusinessType[];
    business: BusinessType;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <>
            {business && (
                <Sidebar
                    aria-label="Sidebar"
                    className={`${!isCollapsed && "w-72"}`}
                    collapsed={isCollapsed}
                >
                    <Sidebar.Items>
                        <Sidebar.ItemGroup>
                            {/* <Sidebar.Item>
                            <p>Selected Business</p>
                        </Sidebar.Item> */}
                            <Sidebar.Collapse
                                label={business.business_name}
                                className="font-semibold"
                            >
                                {businesses
                                    .filter((b) => b.id != business.id)
                                    .map((b, i) => (
                                        <Sidebar.Item
                                            key={i}
                                            href={`/contractor/dashboard/${b.id}`}
                                        >
                                            {b.business_name}
                                        </Sidebar.Item>
                                    ))}
                            </Sidebar.Collapse>
                            <Sidebar.Item
                                href={`/contractor/dashboard/${business?.id}`}
                                icon={HomeIcon}
                            >
                                <p>Home</p>
                            </Sidebar.Item>
                            <Sidebar.Item
                                href={`/contractor/dashboard/leads/${business?.id}`}
                                icon={ClipboardDocumentCheckIcon}
                            >
                                <p>Leads</p>
                            </Sidebar.Item>
                            <Sidebar.Item
                                href={`/contractor/dashboard/conversations/${business?.id}`}
                                icon={ChatBubbleLeftIcon}
                            >
                                <p>Conversations</p>
                            </Sidebar.Item>
                            <Sidebar.Item
                                href={`/contractor/dashboard/interact/${business?.id}`}
                                icon={BoltIcon}
                            >
                                <p>AI Receptionist</p>
                            </Sidebar.Item>
                            <Sidebar.Item
                                href={`/contractor/dashboard/settings/${business?.id}`}
                                icon={Cog6ToothIcon}
                            >
                                <p>Settings</p>
                            </Sidebar.Item>
                            <Sidebar.Item
                                as="button"
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                icon={isCollapsed ? ArrowRightCircleIcon : ArrowLeftCircleIcon}
                            >
                                {isCollapsed ? <span>Expand</span> : <span>Collapse</span>}
                            </Sidebar.Item>
                        </Sidebar.ItemGroup>
                    </Sidebar.Items>
                </Sidebar>
            )}
        </>
    );
}
