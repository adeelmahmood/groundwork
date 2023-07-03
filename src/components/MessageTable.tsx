import { SimpleChatMessage } from "@/app/types";
import { displayDate } from "@/utils/utils";

export default function MessageTable({ chatMessages }: { chatMessages: SimpleChatMessage[] }) {
    const MediaMessageComp = ({ message }: { message: SimpleChatMessage }) => {
        return (
            <div className="max-w-sm flex items-center">
                {message.message.split("\n").map((m: string, i) => {
                    let url = m.substring(m.indexOf("(") + 1);
                    url = url.endsWith(")") ? url.substring(0, url.length - 1) : url;
                    return (
                        <div key={i} className="mr-2">
                            <a href={url} target="_blank">
                                <img
                                    className="rounded-md h-32 w-32 object-cover object-center"
                                    src={url}
                                />
                            </a>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            {chatMessages && (
                <div className="mt-4 w-full overflow-x-auto rounded-lg shadow-md sm:flex dark:bg-slate-700">
                    <table className="w-full text-left text-sm text-gray-800">
                        <thead className="bg-slate-600 text-xs uppercase tracking-wider text-gray-200 dark:bg-gray-600">
                            <tr>
                                <th scope="col" className="py-3 px-6">
                                    Speaker
                                </th>
                                <th scope="col" className="py-3 px-6">
                                    Message
                                </th>
                                <th scope="col" className="py-3 px-6">
                                    Timestamp
                                </th>
                                <th scope="col" className="py-3 px-6">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {chatMessages?.map((cm, i) => (
                                <tr
                                    key={i}
                                    className="border-t border-gray-300 bg-white hover:bg-gray-50 dark:border-gray-500 dark:bg-gray-500/20 dark:hover:bg-gray-600/20"
                                >
                                    <td className="py-4 px-6 dark:text-gray-200">{cm.speaker}</td>
                                    <td className="py-4 px-6 dark:text-gray-200">
                                        {cm.messageType == "image" ? (
                                            <MediaMessageComp message={cm} />
                                        ) : (
                                            <p className=" max-w-sm">{cm.message}</p>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 dark:text-gray-200">
                                        {displayDate(cm.date)}
                                    </td>
                                    <td className="py-4 px-6 dark:text-gray-200">{cm.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
