"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useRef, useState } from "react";
import SidebarComponent from "../../sidebar";
import Countdown, { CountdownApi } from "react-countdown";
import { BusinessDataService } from "@/modules/data/business-service";
import { TextInput } from "flowbite-react";
import { AiReceptionistClient } from "@/modules/clients/receptionist-client";

interface ChatMessage {
    message: string;
    speaker: string;
}

export default function Interact({ params }: { params: { id: string } }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [chatInput, setChatInput] = useState("");
    const [chatRequested, isChatRequested] = useState(false);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLInputElement>(null);

    const [summary, setSummary] = useState("");

    const [businesses, setBusinesses] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);

    const [receptionistPromptConfig, setReceptionistPromptConfig] = useState<any>();
    const [summarizerPromptConfig, setSummarizerPromptConfig] = useState<any>();

    const [chatbotDelay, setChatbotDelay] = useState(1);

    const supabase = createClientComponentClient();

    const service = new BusinessDataService(supabase);
    const client = new AiReceptionistClient();

    let countdownApi: CountdownApi | null = null;
    const [countdownState, setCountdownState] = useState({ date: Date.now() });
    const setCountdownRef = (countdown: Countdown | null): void => {
        if (countdown) {
            countdownApi = countdown.getApi();
        }
    };

    async function loadBusinesses(id: string) {
        const data = await service.retrieveAllBusinesses();
        setBusinesses(data);
        const bdata = data?.find((b: any) => b.id == id);
        setBusiness(bdata);

        // set prompts
        setReceptionistPromptConfig(
            bdata?.business_prompts?.find((p: any) => p.prompt_type == "receptionist")
        );
        setSummarizerPromptConfig(
            bdata?.business_prompts?.find((p: any) => p.prompt_type == "summarizer")
        );

        // set settings
        const setting = bdata?.business_settings?.find(
            (p: any) => p.setting_name == "CHATBOT_DELAY"
        );
        if (setting) {
            setChatbotDelay(setting.setting_value);
        }
    }

    const addMessage = (message: string, speaker: string) => {
        setChatMessages((prev) => [...prev, { message: message, speaker: speaker }]);
    };

    const getMessageAt = (index: number) => {
        return index < chatMessages.length
            ? `[${chatMessages[index].speaker}] ${chatMessages[index].message}`
            : null;
    };

    // record a new message from user and start timer
    async function message() {
        if (chatInput?.trim()) {
            setCountdownState({ date: Date.now() + chatbotDelay * 1000 });
            addMessage(chatInput, "User");
            setChatInput("");
            isChatRequested(true);
        }
    }

    // invoke ai receptionist
    async function chat() {
        if (!chatRequested) return;

        setIsLoading(true);

        let input = getMessageAt(chatMessages.length - 1);
        input = input?.startsWith("[User] ") ? input.split("[User] ")[1] : "";

        const response = await client.reply(
            input.trim(),
            chatMessages
                .slice(0, chatMessages.length - 1)
                .map((cm) => `[${cm.speaker}] ${cm.message}`),
            business,
            receptionistPromptConfig
        );

        setIsLoading(false);
        response && addMessage(response, "Assistant");

        isChatRequested(false);
    }

    const generateLead = async () => {
        setIsLoading(true);
        setSummary("");

        const response = await fetch("/api/ai-leads-gen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                // conversation: chatHistory.join("\n"),
                promptConfig: summarizerPromptConfig,
            }),
        });
        setIsLoading(false);
        const { text: summ } = await response.json();
        setSummary(summ);
    };

    // update timer on key strokes in chat input
    useEffect(() => {
        countdownApi &&
            !countdownApi.isStarted() &&
            countdownState.date > Date.now() &&
            countdownApi.start();
    }, [countdownApi, countdownState]);

    useEffect(() => {
        loadBusinesses(params.id);
    }, [supabase, params]);

    useEffect(() => {
        if ((isLoading || chatMessages.length) && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "start",
            });
        }
    }, [chatMessages, isLoading]);

    if (!business) return;

    return (
        <div className="flex">
            <SidebarComponent businesses={businesses} business={business} />

            <div className="container mx-auto p-6 border rounded-md shadow-md">
                <h2 className="max-w-6xl text-3xl lg:text-5xl font-bold tracking-wide text-white mt-2 mb-6">
                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                        AI Receptionist
                    </span>
                </h2>

                <div className="mb-8 relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[454px] max-w-[341px] md:h-[682px] md:max-w-[512px]">
                    <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                    <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                    <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                    <div className="rounded-[2rem] overflow-hidden h-[426px] md:h-[654px] bg-white dark:bg-gray-800">
                        <div className="flex flex-col h-full">
                            <div className="border-2 bg-gray-50 dark:bg-gray-100 rounded-lg mx-3 mt-4 mb-1 flex-1 text-sm overflow-y-auto">
                                <div className="pb-2">
                                    {chatMessages?.map((cm, i) => (
                                        <div
                                            key={i}
                                            className={`mt-2 ${
                                                cm.speaker == "User"
                                                    ? "flex items-center justify-end"
                                                    : "flex items-center"
                                            }`}
                                        >
                                            <span
                                                className={`max-w-sm text-white px-3 py-2 rounded-md ${
                                                    cm.speaker == "User"
                                                        ? "bg-blue-600 dark:bg-blue-500 mr-2"
                                                        : "bg-gray-600 dark:bg-gray-500 ml-2"
                                                }`}
                                            >
                                                {cm.message}
                                            </span>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="animate-pulse text-4xl ml-2 dark:text-gray-900">
                                            ...
                                        </div>
                                    )}
                                </div>
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="mx-3 mb-5 mt-1">
                                <TextInput
                                    sizing="lg"
                                    className="text-sm"
                                    placeholder="Type your message here..."
                                    value={chatInput}
                                    onChange={(e: any) => setChatInput(e.currentTarget.value)}
                                    onKeyUp={(e: any) => {
                                        if (e.keyCode == 13) message();
                                    }}
                                ></TextInput>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-gray-800 dark:text-gray-200">
                    <Countdown
                        autoStart={false}
                        ref={setCountdownRef}
                        date={countdownState.date}
                        renderer={({ hours, minutes, seconds }) => (
                            <>{seconds ? <span>Waiting... {seconds}</span> : ""}</>
                        )}
                        onComplete={() => chat()}
                    />
                </div>
            </div>
        </div>
    );
}
