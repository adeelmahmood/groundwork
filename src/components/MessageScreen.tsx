import { SimpleChatMessage } from "@/app/types";
import { displayDate, displayDateShort } from "@/utils/utils";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { TextInput } from "flowbite-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export default function MessageScreen({
    chatMessages,
    setChatMessages,
    isLoading,
    message,
    interactiveMode = true,
}: {
    chatMessages: SimpleChatMessage[];
    setChatMessages: Dispatch<SetStateAction<SimpleChatMessage[]>>;
    isLoading: boolean;
    message: (input: string) => void;
    interactiveMode: boolean;
}) {
    const messagesEndRef = useRef<HTMLInputElement>(null);

    const [chatInput, setChatInput] = useState("");

    useEffect(() => {
        if (interactiveMode && (isLoading || chatMessages.length) && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "start",
            });
        }
    }, [chatMessages, isLoading, interactiveMode, messagesEndRef]);

    return (
        <>
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
                                    <>
                                        <div
                                            key={i}
                                            className={`mt-2 group ${
                                                cm.speaker == "User"
                                                    ? "flex items-center justify-end"
                                                    : "flex items-center"
                                            }`}
                                        >
                                            {cm.speaker == "User" && interactiveMode && (
                                                <XMarkIcon
                                                    className="hidden group-hover:block h-3 fill-current text-gray-700 mr-1 cursor-pointer"
                                                    onClick={() => {
                                                        setChatMessages((prev) =>
                                                            prev.filter((_, ind) => ind !== i)
                                                        );
                                                    }}
                                                />
                                            )}
                                            <span
                                                className={`max-w-sm text-white px-3 py-2 rounded-md ${
                                                    cm.speaker == "User"
                                                        ? "bg-blue-600 dark:bg-blue-500 mr-2"
                                                        : "bg-gray-600 dark:bg-gray-500 ml-2"
                                                }`}
                                            >
                                                {cm.message}
                                            </span>
                                            {cm.speaker == "Assistant" && interactiveMode && (
                                                <XMarkIcon
                                                    className="hidden group-hover:block h-3 fill-current text-gray-700 ml-1 cursor-pointer"
                                                    onClick={() => {
                                                        setChatMessages((prev) =>
                                                            prev.filter((_, ind) => ind !== i)
                                                        );
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div
                                            key={i}
                                            className={`mt-2 group ${
                                                cm.speaker == "User"
                                                    ? "flex items-center justify-end"
                                                    : "flex items-center"
                                            }`}
                                        >
                                            <span className="text-xs px-4">
                                                {displayDateShort(cm.date)} ({cm.status})
                                            </span>
                                        </div>
                                    </>
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
                                onKeyUp={async (e: any) => {
                                    if (e.keyCode == 13) {
                                        message(chatInput);
                                        setChatInput("");
                                    }
                                }}
                                disabled={!interactiveMode}
                            ></TextInput>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
