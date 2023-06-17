"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { TABLE_REG_BUSINESSES } from "../../../../utils/constants";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import { Answer } from "./Answer";
import { EventStreamContentType, fetchEventSource } from "@microsoft/fetch-event-source";
import ConfigDialog from "./ConfigDialog";

interface BusinessType {
    business_name: string;
    business_url: string;
}

export default function Interact({ params }: { params: { bid: string } }) {
    const [answer, setAnswer] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [chatInput, setChatInput] = useState("");
    const [chatHistory, setChatHistory] = useState<string[]>([]);

    const [business, setBusiness] = useState<any>(null);
    const [prompt, setPrompt] = useState("");
    const [temperature, setTemperature] = useState(0);
    const [formulateQuestion, setFormulateQuestion] = useState(false);

    const supabase = createClientComponentClient();

    async function loadBusiness() {
        const { data, error } = await supabase
            .from(TABLE_REG_BUSINESSES)
            .select()
            .eq("id", params.bid)
            .single();

        setBusiness(data);

        setAnswer(
            `Welcome to ${data?.business_name}. I am here to help your with any questions you have about our services and I can also help you make an appointment. How may I help you?`
        );

        const { data: config } = await supabase.from("prompts_configuration").select().single();
        setPrompt(config?.config.prompt);
        setTemperature(config?.config.temperature);
        setFormulateQuestion(true);
    }

    async function ask(question: string) {
        setIsLoading(true);

        // if (!chatInput) return;
        if (question) setChatHistory((prev) => [...prev, "[User] " + question]);

        const response: string[] = [];
        const chat = await fetchEventSource("/api/aiagent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                input: question,
                history: chatHistory,
                business,
                prompt,
                temperature,
                formulateQuestion,
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
                    console.log(response.join(""));
                    setChatHistory((prev) => [...prev, "[Assistant] " + response.join("")]);
                }
            },
            onerror(err) {
                setError("error status in chat response: " + err);
            },
        });
    }

    useEffect(() => {
        loadBusiness();
    }, [supabase]);

    return (
        <div className="container mx-auto p-6">
            <h2 className="max-w-6xl text-5xl font-bold tracking-wider text-white mt-8">
                <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                    Interact with AI Agent
                </span>
                <ConfigDialog
                    prompt={prompt}
                    setPrompt={setPrompt}
                    temperature={temperature}
                    setTemperature={setTemperature}
                    formulateQuestion={formulateQuestion}
                    setFormulateQuestion={setFormulateQuestion}
                    closeFnc={() => {}}
                />
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
                        <div className="w-full flex-1 items-center rounded-lg border px-4 py-4 shadow-md max-h-48 min-h-max overflow-y-auto">
                            <div className="flex flex-col gap-6 text-gray-500">
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
                        className="ml-2 w-full appearance-none border-0 p-2 text-lg text-gray-600 focus:outline-none focus:ring-0 md:p-4 md:text-2xl bg-transparent"
                        placeholder="Lets chat!"
                        onChange={(e: any) => setChatInput(e.currentTarget.value)}
                        onKeyUp={(e: any) => {
                            if (e.keyCode == 13) ask(chatInput);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
