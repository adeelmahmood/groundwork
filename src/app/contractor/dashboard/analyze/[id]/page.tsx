"use client";

import {
    SUMMARIZER_PROMPT_TYPE,
    TABLE_BUSINESS_PROMPTS,
    TABLE_REG_BUSINESSES,
} from "@/utils/constants";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../../sidebar";

export default function Analyze({ params }: { params: { id: string } }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [businesses, setBusinesses] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);
    const [promptConfig, setPromptConfig] = useState<any>();

    const [conversation, setConversation] = useState("");
    const [summary, setSummary] = useState("");

    const supabase = createClientComponentClient();

    const router = useRouter();

    async function loadBusinesses(id: string) {
        const { data, error } = await supabase.from(TABLE_REG_BUSINESSES).select();
        setBusinesses(data);
        const bdata = data?.find((b) => b.id == id);
        setBusiness(bdata);

        // retrieve summarizer prompt
        const { data: config, error: promptError } = await supabase
            .from(TABLE_BUSINESS_PROMPTS)
            .select()
            .eq("business_id", bdata?.id)
            .eq("prompt_type", SUMMARIZER_PROMPT_TYPE)
            .single();
        setPromptConfig(config);
    }

    const summarize = async () => {
        setIsLoading(true);
        setSummary("");

        const response = await fetch("/api/ai-summarizer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversation, promptConfig }),
        });
        setIsLoading(false);
        const { text: summ } = await response.json();
        setSummary(summ);
    };

    useEffect(() => {
        loadBusinesses(params.id);
    }, [supabase, params]);

    return (
        <>
            <div className="flex">
                <Sidebar businesses={businesses} business={business} />

                <div className="container mx-auto p-6">
                    <h2 className="max-w-6xl text-5xl font-bold tracking-wider text-white mt-8">
                        <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                            Analyze Conversation
                        </span>
                    </h2>

                    <div className="flex flex-col mt-6">
                        <div>
                            <label>Conversation</label>
                        </div>
                        <div>
                            <textarea
                                className="mt-2 w-full rounded-lg border-gray-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-200 dark:focus:border-teal-500 dark:focus:ring-teal-500 disabled:bg-gray-100"
                                rows={12}
                                placeholder="Paste Conversation Here"
                                value={conversation}
                                onChange={(e) => setConversation(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-x-2">
                            <button
                                className="btn-primary"
                                disabled={!conversation || isLoading}
                                onClick={() => summarize()}
                            >
                                Summarize
                            </button>
                        </div>
                        {summary && <div className="mt-4 text-lg">{summary}</div>}
                    </div>
                </div>
            </div>
        </>
    );
}
