"use client";

import { BusinessDataService } from "@/modules/data/business-service";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useContext, useEffect, useState } from "react";
import { Button } from "flowbite-react";
import ReactTimeAgo from "react-time-ago";
import { formatPhoneNumber } from "@/utils/utils";
import { VIEW_SMS_MESSAGES_SUMMARY } from "@/utils/constants";
import { ContractorDashboardContext } from "../../layout";
import Link from "next/link";

export default function Conversations({ params }: { params: { id: string } }) {
    const [business, setBusiness] = useContext(ContractorDashboardContext);

    const [conversations, setConversations] = useState<any>();

    const supabase = createClientComponentClient();

    const service = new BusinessDataService(supabase);

    async function loadBusiness(id: string) {
        const data = await service.retrieveBusinessById(id);
        setBusiness(data);
    }

    async function loadConversations(phone: string) {
        const { data, error } = await supabase
            .from(VIEW_SMS_MESSAGES_SUMMARY)
            .select()
            .eq("to_phone", phone);
        if (error) {
            console.log("error in retrieving messages summary", error);
        } else {
            setConversations(data);
        }
    }

    useEffect(() => {
        if (params.id) {
            loadBusiness(params.id);
        }
    }, [supabase, params]);

    useEffect(() => {
        if (business?.id) {
            loadConversations(business.registered_phone);
        }
    }, [business]);

    if (!business) return;

    return (
        <div className="container mx-auto p-6 border rounded-md shadow-md">
            <h2 className="max-w-6xl text-2xl lg:text-4xl font-bold tracking-wide text-white mt-2 lg:mt-8">
                <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                    Conversations
                </span>
            </h2>

            <p className="mt-4 text-gray-500 dark:text-gray-400">
                These conversations are still on going and have not been converted to a lead yet
            </p>

            <div className="mt-6">
                {conversations?.map((record: any, i: number) => {
                    return (
                        <div key={i} className="mb-4 border rounded-md overflow-hidden">
                            <div className="flex flex-col items-start space-y-2 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 ">
                                <div className="">
                                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                                        {formatPhoneNumber(record.from_phone)}
                                    </div>
                                    <div className="">
                                        <div className="text-gray-500 dark:text-gray-400">
                                            {record.count} message{record.count > 1 && "s"}
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400 text-sm">
                                            (last message){" "}
                                            <ReactTimeAgo
                                                date={new Date(record.max).getTime()}
                                                locale="en-US"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button>
                                    <Link
                                        href={`/contractor/dashboard/conversation/${
                                            business.id
                                        }?phone=${encodeURIComponent(record.from_phone)}`}
                                    >
                                        View Conversation
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
