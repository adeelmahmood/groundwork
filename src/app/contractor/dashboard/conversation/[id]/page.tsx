"use client";

import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import SidebarComponent from "../../sidebar";
import { BusinessDataService } from "@/modules/data/business-service";
import { SmsDataService } from "@/modules/data/sms-service";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SimpleChatMessage } from "@/app/types";
import { formatPhoneNumber } from "@/utils/utils";
import MessageScreen from "@/components/MessageScreen";
import LeadCard from "../../leads/[id]/LeadCard";
import MessageTable from "@/components/MessageTable";
import { Button } from "flowbite-react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { TABLE_LEADS } from "@/utils/constants";
import { AiLeadsClient } from "@/modules/clients/leads-client";
import { ContractorDashboardContext } from "../../layout";

export default function Conversation({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [business, setBusiness] = useContext(ContractorDashboardContext);

    const [phone, setPhone] = useState("");
    const [leadId, setLeadId] = useState("");

    const [chatMessages, setChatMessages] = useState<SimpleChatMessage[]>([]);
    const [lead, setLead] = useState<any>({});

    const supabase = createClientComponentClient();

    const service = new BusinessDataService(supabase);
    const smsService = new SmsDataService(supabase);

    async function loadBusiness(id: string) {
        const data = await service.retrieveBusinessById(id);
        setBusiness(data);
    }

    async function loadConversation() {
        // retrieve all messages for this conversation
        const messages = leadId
            ? await smsService.retrieveLeadMessages(business.registered_phone, phone, leadId)
            : await smsService.retrieveMessages(business.registered_phone, phone);
        setChatMessages(
            messages.map((m: any) => {
                return {
                    message: m.message,
                    speaker: m.speaker,
                    date: m.created_at,
                    status: m.status,
                    statusInfo: m.status_info,
                    messageType: m.message_type,
                } as SimpleChatMessage;
            })
        );

        // load lead
        if (leadId) {
            const { data, error } = await supabase
                .from(TABLE_LEADS)
                .select()
                .eq("id", leadId)
                .single();
            if (error) {
                console.log("error in retrieving lead", error);
            }
            setLead(data);
        }
    }

    async function regenLead() {
        const promptConfig = business.business_prompts?.find(
            (p: any) => p.prompt_type == "summarizer"
        );
        const conversation: SimpleChatMessage[] = chatMessages.map((m: SimpleChatMessage) => {
            return {
                message: m.message,
                speaker: m.speaker,
            } as SimpleChatMessage;
        });
        // call the ai agent
        const client = new AiLeadsClient();
        const response = await client.generate(conversation, promptConfig);
        console.log(response);
    }

    useEffect(() => {
        if (searchParams) {
            setPhone(searchParams.get("phone") || "");
            setLeadId(searchParams.get("lead") || "");
        }
    }, [searchParams]);

    useEffect(() => {
        if (params.id) {
            loadBusiness(params.id);
        }
    }, [supabase, params]);

    useEffect(() => {
        if (business?.registered_phone) {
            loadConversation();
        }
    }, [business]);

    if (!business) return;

    return (
        <div className="container mx-auto p-6 border rounded-md shadow-md">
            <Button onClick={() => router.back()}>
                <ArrowLeftIcon className="inline h-6 fill-current text-white mr-2" />
                Go Back
            </Button>

            <h2 className="max-w-6xl text-2xl lg:text-4xl font-bold tracking-wide text-white mt-2 lg:mt-8">
                <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                    Conversation w/ {formatPhoneNumber(phone)}
                </span>
            </h2>

            <p className="mt-4 text-gray-500 dark:text-gray-400">Conversation History</p>

            <div className="">
                <div className="flex flex-col">
                    <div>
                        <MessageTable chatMessages={chatMessages} />
                    </div>
                    <div className="grid grid-cols-2 mt-12">
                        <div>
                            <h2 className="text-2xl font-semibold tracking-wide text-gray-700 dark:text-gray-300 mb-4 text-center">
                                <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                                    Mobile View
                                </span>
                            </h2>
                            <MessageScreen
                                chatMessages={chatMessages}
                                setChatMessages={setChatMessages}
                                isLoading={false}
                                message={(input: string) => {}}
                                interactiveMode={false}
                            />
                        </div>
                        <div>
                            {lead?.id && (
                                <div className="flex flex-col items-center">
                                    <h2 className="text-2xl font-semibold tracking-wide text-gray-700 dark:text-gray-300 mb-4">
                                        <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                                            Generated Lead
                                        </span>
                                    </h2>
                                    <LeadCard lead={lead} showViewConversation={false} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
