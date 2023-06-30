"use client";

import { BusinessDataService } from "@/modules/data/business-service";
import { SmsDataService } from "@/modules/data/sms-service";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import SidebarComponent from "../../sidebar";
import { Button, Modal } from "flowbite-react";
import ReactTimeAgo from "react-time-ago";
import { formatPhoneNumber } from "@/utils/utils";
import { TABLE_SMS_MESSAGES, VIEW_SMS_MESSAGES_SUMMARY } from "@/utils/constants";
import MessageScreen from "@/components/MessageScreen";
import { SimpleChatMessage } from "@/app/types";

export default function Conversations({ params }: { params: { id: string } }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [businesses, setBusinesses] = useState<any>();
    const [business, setBusiness] = useState<any>();

    const [conversations, setConversations] = useState<any>();
    const [selectedConversation, setSelectedConversation] = useState<any>();
    const [chatMessages, setChatMessages] = useState<SimpleChatMessage[]>([]);

    const [openModal, setOpenModal] = useState<string | undefined>();
    const props = { openModal, setOpenModal };

    const supabase = createClientComponentClient();

    const service = new BusinessDataService(supabase);
    const smsService = new SmsDataService(supabase);

    async function loadBusinesses(id: string) {
        const data = await service.retrieveAllBusinesses();
        setBusinesses(data);
        const bdata = data?.find((b: any) => b.id == id);
        setBusiness(bdata);
    }

    async function loadConversations(phone: string) {
        const { data, error } = await supabase.from(VIEW_SMS_MESSAGES_SUMMARY).select();
        if (error) {
            console.log("error in retrieving messages summary", error);
        } else {
            setConversations(data);
        }
    }

    async function showConversation(record: any) {
        setSelectedConversation(record);
        // retrieve all messages for this conversation
        const messages = await smsService.retrieveMessages(
            business.registered_phone,
            record.from_phone
        );

        setChatMessages(
            messages.map((m: any) => {
                return { message: m.message, speaker: m.speaker } as SimpleChatMessage;
            })
        );

        // open conversation modal
        props.setOpenModal("dismissible");
    }

    useEffect(() => {
        loadBusinesses(params.id);
    }, [supabase, params]);

    useEffect(() => {
        if (business?.id) {
            loadConversations(business.registered_phone);
        }
    }, [business]);

    if (!business) return;

    return (
        <div className="flex">
            <SidebarComponent businesses={businesses} business={business} />

            <Modal
                dismissible
                show={props.openModal === "dismissible"}
                onClose={() => props.setOpenModal(undefined)}
            >
                <Modal.Header>
                    Conversation w/ {formatPhoneNumber(selectedConversation?.from_phone)}
                </Modal.Header>
                <Modal.Body>
                    <div className="">
                        <MessageScreen
                            chatMessages={chatMessages}
                            setChatMessages={setChatMessages}
                            isLoading={false}
                            message={(input: string) => {}}
                            interactiveMode={false}
                        />
                    </div>
                </Modal.Body>
            </Modal>

            <div className="container mx-auto p-6 border rounded-md shadow-md">
                <h2 className="max-w-6xl text-3xl lg:text-5xl font-bold tracking-wide text-white mt-2 lg:mt-8">
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
                                    <Button onClick={() => showConversation(record)}>
                                        View Conversation
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
