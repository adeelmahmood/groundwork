"use client";

import GetStarted from "./GetStarted";
import Information from "./Information";
import RegisterComp from "./Register";
import { useEffect, useState } from "react";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TABLE_REG_BUSINESSES } from "@/utils/constants";
import { BusinessDataService } from "@/modules/data/business-service";

export default function Register() {
    const searchParams = useSearchParams();

    const supabase = createClientComponentClient();

    const service = new BusinessDataService(supabase);

    const [stage, setStage] = useState("GetStarted");
    const [stages, setStages] = useState([
        {
            href: "GetStarted",
            title: "Get Started",
            completed: false,
            component: GetStarted,
        },
        {
            href: "BusinessInformation",
            title: "Information",
            completed: false,
            component: Information,
        },
        {
            href: "Register",
            title: "Register",
            completed: false,
            component: RegisterComp,
        },
    ]);

    const [business, setBusiness] = useState({
        business_name: "",
        business_url: "",
        business_description: "",
    });

    const prevStage = () => {
        const current = stages.find((s) => s.href == stage);
        const previous = stages[stages.findIndex((s) => s.href == stage) - 1];
        setStage(previous.href);
    };

    const stageCompleted = () => {
        const current = stages.find((s) => s.href == stage);
        const next = stages[stages.findIndex((s) => s.href == stage) + 1];
        current!.completed = true;
        setStage(next.href);
    };

    const handleNav = (e: any) => {
        e.preventDefault();
        let href = e.target.href;
        href = href.indexOf("/") != -1 ? href.substring(href.lastIndexOf("/") + 1) : href;
        const targetStage = stages.find((s) => s.href == href);
        // if (targetStage?.completed) {
        setStage(targetStage!.href);
        // }
    };

    async function loadBusiness(id: string) {
        const data = await service.retrieveBusinessById(id);
        if (data) {
            setBusiness({
                ...business,
                ...data,
            });
        }
    }

    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            loadBusiness(id);
        }
    }, [searchParams]);

    return (
        <>
            <div className="container mx-auto p-6">
                <div className="flex">
                    <div className="hidden w-64 md:block">
                        <div className="mt-10 flex flex-col space-y-6 px-6">
                            {stages.map((s, index) => {
                                return (
                                    <div className="flex items-start" key={index}>
                                        <a
                                            key={index}
                                            href={s.href}
                                            className={`${
                                                stage == s.href
                                                    ? "font-semibold text-indigo-800 dark:text-gray-200"
                                                    : s.completed
                                                    ? "font-normal text-indigo-500 dark:text-gray-400"
                                                    : "font-normal text-indigo-800 dark:text-gray-300"
                                            }`}
                                            onClick={handleNav}
                                        >
                                            {s.title}
                                        </a>
                                        {s.completed && (
                                            <CheckIcon className="ml-1 inline h-5 fill-current text-indigo-500 dark:text-gray-200" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-md dark:bg-slate-800">
                        <div className="mt-8 flex flex-col">
                            {stages.map((s, index) => {
                                if (!s.component) {
                                    return <div>Component for {s.href} not defined</div>;
                                }
                                const Comp = s.component;
                                if (Comp && s.href == stage) {
                                    return (
                                        <Comp
                                            key={index}
                                            business={business}
                                            setBusiness={setBusiness}
                                            handle={stageCompleted}
                                        />
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
