"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useContext, useEffect, useRef, useState } from "react";
import Countdown, { CountdownApi } from "react-countdown";
import { BusinessDataService } from "@/modules/data/business-service";
import { Button } from "flowbite-react";
import { AiReceptionistClient } from "@/modules/clients/receptionist-client";
import { SimpleChatMessage } from "@/app/types";
import MessageScreen from "@/components/MessageScreen";
import { ContractorDashboardContext } from "../../layout";

export default function Interact({ params }: { params: { id: string } }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [chatMessages, setChatMessages] = useState<SimpleChatMessage[]>([]);

    const [autoChat, setAutoChat] = useState(false);
    const [autoCount, setAutoCount] = useState(0);
    const autoMax = 5;
    const autoDelay = 2000;

    const [summary, setSummary] = useState("");

    const [business, setBusiness] = useContext(ContractorDashboardContext);

    const [receptionistPromptConfig, setReceptionistPromptConfig] = useState<any>();
    const [summarizerPromptConfig, setSummarizerPromptConfig] = useState<any>();

    const [chatbotDelay, setChatbotDelay] = useState(1);

    const supabase = createClientComponentClient();

    const service = new BusinessDataService(supabase);
    const client = new AiReceptionistClient(true);

    let countdownApi: CountdownApi | null = null;
    const [countdownState, setCountdownState] = useState({ date: Date.now() });
    const setCountdownRef = (countdown: Countdown | null): void => {
        if (countdown) {
            countdownApi = countdown.getApi();
        }
    };

    async function loadBusiness(id: string) {
        const bdata = await service.retrieveBusinessById(id);
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

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const talkForMe = async () => {
        const p = {
            temperature: 1,
            prompt: `You are a home owner. Your name is Adam. 
Think of a home improvement project and then communite your needs to the contractor one statement at a time. 
Respond only as the home owner. Start the conversation by introducing yourself. Only answer the questions posed by the contractor in the CONVERSATION HISTORY.

CONVERSATION HISTORY:
[Assistant] Hi, I am a contractor. How can I help you?
{history}

Format your responses only as your answer without any information about the speaker.
`,
        };
        setIsLoading(true);
        const response = await fetch(`/api/ai-agent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                history: chatMessages,
                promptConfig: p,
            }),
        });
        setIsLoading(false);
        const data = await response.json();
        message(data?.text);
    };

    const addMessage = (message: string, speaker: string) => {
        setChatMessages((prev) => [
            ...prev,
            {
                message: message.trim(),
                speaker: speaker,
                date: new Date() + "",
                status: speaker == "User" ? "Received" : "Sent",
                statusInfo: "",
                messageType: "text",
            },
        ]);
    };

    // record a new message from user and start timer
    function message(input: string) {
        if (input?.trim()) {
            setCountdownState({ date: Date.now() + chatbotDelay * 1000 });
            addMessage(input, "User");
        }
    }

    // invoke ai receptionist
    async function chat() {
        setIsLoading(true);

        const response = await client.reply(
            chatMessages[chatMessages.length - 1],
            chatMessages.slice(0, chatMessages.length - 1),
            business,
            receptionistPromptConfig
        );

        setIsLoading(false);
        response && addMessage(response, "Assistant");
        if (autoChat) {
            if (autoCount < autoMax) {
                setAutoCount((prev) => prev + 1);
                await sleep(autoDelay);
                await talkForMe();
            } else {
                setAutoChat(false);
            }
        }
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
        if (params.id) {
            loadBusiness(params.id);
        }
    }, [supabase, params]);

    if (!business) return;

    return (
        <div className="container mx-auto p-6 border rounded-md shadow-md">
            <h2 className="max-w-6xl text-3xl lg:text-5xl font-bold tracking-wide text-white mt-2 mb-6">
                <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                    AI Receptionist
                </span>
            </h2>

            <MessageScreen
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                isLoading={isLoading}
                message={message}
                interactiveMode={!autoChat}
            />

            <div className="flex items-center justify-between">
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
                <div className="flex items-center gap-2">
                    <Button
                        onClick={async () => {
                            setAutoCount(0);
                            if (!autoChat) {
                                setAutoChat(!autoChat);
                                await sleep(1000);
                                talkForMe();
                            } else {
                                setAutoChat(!autoChat);
                            }
                        }}
                    >
                        {autoChat ? "Stop Auto Talk" : "Auto Talk"}
                    </Button>
                    <Button
                        onClick={async () => {
                            window.localStorage.setItem(
                                "chat_history",
                                JSON.stringify(chatMessages)
                            );
                        }}
                        disabled={isLoading}
                    >
                        Save
                    </Button>
                    <Button
                        onClick={async () => {
                            const history = window.localStorage.getItem("chat_history");
                            if (history) setChatMessages(JSON.parse(history));
                        }}
                        disabled={isLoading}
                    >
                        Load
                    </Button>
                    <Button
                        onClick={async () => {
                            window.localStorage.removeItem("chat_history");
                            setChatMessages([]);
                        }}
                        disabled={isLoading}
                    >
                        Reset
                    </Button>
                </div>
            </div>
        </div>
    );
}
