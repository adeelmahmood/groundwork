"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { TABLE_REG_BUSINESSES } from "../../../../../utils/constants";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import { Answer } from "./Answer";
import { EventStreamContentType, fetchEventSource } from "@microsoft/fetch-event-source";
import { useRouter } from "next/navigation";
import Sidebar from "../../sidebar";

export default function Interact({ params }: { params: { id: string } }) {
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<string[]>([]);
    const [chatStarted, isChatStarted] = useState(false);

    const [summary, setSummary] = useState("");

    const [businesses, setBusinesses] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);

    const [receptionistPromptConfig, setReceptionistPromptConfig] = useState<any>();
    const [summarizerPromptConfig, setSummarizerPromptConfig] = useState<any>();

    const supabase = createClientComponentClient();

    const router = useRouter();

    async function loadBusinesses(id: string) {
        const { data, error } = await supabase
            .from(TABLE_REG_BUSINESSES)
            .select(`*,business_prompts (*)`);
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
    }

    async function chat(starting: boolean = false) {
        setIsLoading(true);

        if (!starting && chatInput) setChatHistory((prev) => [...prev, "[User] " + chatInput]);

        const response: string[] = [];
        const chat = await fetchEventSource("/api/ai-receptionist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                input: chatInput,
                history: starting ? [] : chatHistory,
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
                    setChatInput("");
                    return; // everything's good
                }
            },
            onmessage(ev) {
                setAnswer((prev) => prev + ev.data);
                response.push(ev.data);
            },
            onclose() {
                if (response.length > 0) {
                    // console.log(response.join(""));
                    setChatHistory((prev) => [...prev, "[Assistant] " + response.join("")]);
                    // setCanSearchForScholarship(
                    //     response.join("").trim().includes('<span class="hidden"') ||
                    //         response.join("").trim().includes("<span class='hidden'")
                    // );
                }
            },
            onerror(err) {
                setError("error status in chat response: " + err);
            },
        });
    }

    const summarize = async () => {
        setIsLoading(true);
        setSummary("");

        const response = await fetch("/api/ai-agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                history: chatHistory.join(" "),
                promptConfig: summarizerPromptConfig,
            }),
        });
        setIsLoading(false);
        const { text: summ } = await response.json();
        setSummary(summ);
    };

    useEffect(() => {
        // start chat
        if (business && receptionistPromptConfig && !chatStarted) {
            isChatStarted(true);
            chat(true);
        }
    }, [chatStarted, business, receptionistPromptConfig]);

    useEffect(() => {
        loadBusinesses(params.id);
    }, [supabase, params]);

    return (
        <div className="flex">
            <Sidebar businesses={businesses} business={business} />

            <div className="container mx-auto p-6">
                <h2 className="max-w-6xl text-5xl font-bold tracking-wider text-white mt-8">
                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                        Interact with AI Agent
                    </span>
                </h2>

                <div className="flex flex-col mt-4">
                    {answer && (
                        <div className="relative w-full">
                            <div
                                className={`w-full flex-1 items-center rounded-lg border px-4 py-4 shadow-md ${
                                    isLoading && "opacity-25"
                                }`}
                            >
                                <Answer text={answer} />
                            </div>
                        </div>
                    )}

                    {chatHistory.length > 1 && (
                        <div className="relative w-full mt-2">
                            <div className="w-full flex-1 items-center rounded-lg border px-4 py-4 shadow-md min-h-max overflow-y-auto">
                                <div className="flex flex-col gap-6 text-gray-500 dark:text-gray-300">
                                    {chatHistory
                                        .slice(0, chatHistory.length - 1)
                                        .reverse()
                                        .map((ch, i) => (
                                            <div
                                                className="prose-em"
                                                key={i}
                                                dangerouslySetInnerHTML={{ __html: ch }}
                                            />
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center rounded-lg border px-4 py-2 shadow-md mt-2">
                        <ChatBubbleLeftIcon className="inline h-6 fill-current text-teal-700" />
                        <input
                            type="text"
                            value={chatInput}
                            className="ml-2 w-full appearance-none border-0 p-2 text-lg text-gray-600 dark:text-gray-200 focus:outline-none focus:ring-0 md:p-4 md:text-2xl bg-transparent"
                            placeholder="Lets chat!"
                            onChange={(e: any) => setChatInput(e.currentTarget.value)}
                            onKeyUp={(e: any) => {
                                if (e.keyCode == 13) chat();
                            }}
                        />
                    </div>

                    <div className="mt-2 text-end">
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
