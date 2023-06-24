"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { TABLE_REG_BUSINESSES } from "../../../../../utils/constants";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import { Answer } from "./Answer";
import { EventStreamContentType, fetchEventSource } from "@microsoft/fetch-event-source";
import Sidebar from "../../sidebar";
import Countdown, { CountdownApi } from "react-countdown";
import { Typing } from "./Typing";

export default function Interact({ params }: { params: { id: string } }) {
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<string[]>([]);
    const [chatRequested, isChatRequested] = useState(false);

    const [summary, setSummary] = useState("");

    const [businesses, setBusinesses] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);

    const [receptionistPromptConfig, setReceptionistPromptConfig] = useState<any>();
    const [summarizerPromptConfig, setSummarizerPromptConfig] = useState<any>();

    const [chatbotDelay, setChatbotDelay] = useState(1);

    const supabase = createClientComponentClient();

    let countdownApi: CountdownApi | null = null;
    const [countdownState, setCountdownState] = useState({ date: Date.now() });
    const setCountdownRef = (countdown: Countdown | null): void => {
        if (countdown) {
            countdownApi = countdown.getApi();
        }
    };

    async function loadBusinesses(id: string) {
        const { data, error } = await supabase
            .from(TABLE_REG_BUSINESSES)
            .select(`*, business_prompts (*), business_settings (*)`);
        setBusinesses(data);
        const bdata = data?.find((b) => b.id == id);
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

    // record a new message from user and start timer
    async function message(keyCode: number) {
        console.log("mes");
        if (chatInput?.trim()) {
            setCountdownState({ date: Date.now() + chatbotDelay * 1000 });
            if (keyCode == 13 && chatInput) {
                setChatHistory((prev) => [...prev, "[User] " + chatInput]);
                setChatInput("");
                isChatRequested(true);
            }
        }
    }

    // invoke ai receptionist
    async function chat() {
        if (!chatRequested) return;

        setIsLoading(true);

        let input = chatHistory[chatHistory.length - 1];
        input = input?.startsWith("[User] ") ? input.split("[User] ")[1] : "";

        const response: string[] = [];
        const chat = await fetchEventSource("/api/ai-receptionist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                input: input.trim(), // last history item
                history: chatHistory.slice(0, chatHistory.length - 1), // history except last item
                business,
                promptConfig: receptionistPromptConfig,
            }),
            async onopen(response) {
                if (
                    response.ok &&
                    response.headers.get("content-type") === EventStreamContentType
                ) {
                    setIsLoading(false);
                    setAnswer("");
                    // setChatInput("");
                    return; // everything's good
                }
            },
            onmessage(ev) {
                setAnswer((prev) => prev + ev.data);
                response.push(ev.data);
            },
            onclose() {
                if (response.length > 0) {
                    setChatHistory((prev) => [...prev, "[Assistant] " + response.join("")]);
                }
            },
            onerror(err) {
                setError("error status in chat response: " + err);
            },
        });

        isChatRequested(false);
    }

    const summarize = async () => {
        setIsLoading(true);
        setSummary("");

        const response = await fetch("/api/ai-agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                history: chatHistory.join("\n"),
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

    return (
        <div className="flex">
            <Sidebar businesses={businesses} business={business} />

            <div className="container mx-auto p-6">
                <h2 className="max-w-6xl text-3xl lg:text-5xl font-bold tracking-wide text-white mt-2 lg:mt-8">
                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                        Interact with AI Receptionist
                    </span>
                </h2>

                <div className="flex flex-col mt-4">
                    {isLoading && <Typing />}
                    {answer && (
                        <div className="relative w-full">
                            <div
                                className={`w-full flex-1 items-center rounded-lg border px-4 py-4 shadow-md ${
                                    isLoading && "hidden"
                                }`}
                            >
                                <Answer text={answer} />
                            </div>
                        </div>
                    )}

                    <div className="relative w-full mt-4">
                        <div className="w-full flex-1 items-center rounded-lg border px-4 py-4 shadow-md min-h-max overflow-y-auto">
                            <div className="flex flex-col gap-6 text-gray-500 dark:text-gray-300">
                                {chatHistory
                                    // .slice(0, chatHistory.length - 1)
                                    // .reverse()
                                    .map((ch, i) => (
                                        <div
                                            className="prose-sm lg:prose-em"
                                            key={i}
                                            dangerouslySetInnerHTML={{ __html: ch }}
                                        />
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center rounded-lg border px-4 py-2 shadow-md mt-2">
                        <ChatBubbleLeftIcon className="inline h-6 fill-current text-teal-700" />
                        <input
                            type="text"
                            value={chatInput}
                            className="ml-2 w-full appearance-none border-0 p-2 text-lg text-gray-600 dark:text-gray-200 focus:outline-none focus:ring-0 md:p-4 md:text-2xl bg-transparent"
                            placeholder="Lets chat!"
                            onChange={(e: any) => setChatInput(e.currentTarget.value)}
                            onKeyUp={(e: any) => {
                                message(e.keyCode);
                            }}
                        />
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <div>
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
                        <button
                            className="btn-primary"
                            disabled={chatHistory.length < 3 || isLoading}
                            onClick={() => summarize()}
                        >
                            Summarize
                        </button>
                    </div>

                    {summary && <div className="mt-4 text-lg">{summary}</div>}
                </div>
            </div>
        </div>
    );
}
