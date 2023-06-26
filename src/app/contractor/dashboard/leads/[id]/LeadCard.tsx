"use client";

export default function LeadCard({ lead }: { lead: any }) {
    return (
        <>
            <div className="w-full p-4 rounded-2xl shadow-lg dark:bg-slate-700 bg-gray-50">
                <div className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    <div className="mb-2 text-xl font-bold">{lead.job_details}</div>
                    <div className="mb-2 text-lg font-bold">{lead.customer_name}</div>
                    <div className="mb-2 text-lg">{lead.customer_email}</div>
                    <div className="mt-6">
                        <div className="font-bold">Timing:</div>
                        <div className="text-lg">{lead.timing}</div>
                    </div>
                    <div className="mt-4">
                        <div className="font-bold">Address:</div>
                        <div className="text-lg">{lead.customer_address}</div>
                    </div>
                    <div className="mt-4">
                        <div className="font-semibold">Availability:</div>
                        <div className="text-lg">{lead.customer_availability}</div>
                    </div>

                    <div className="mt-6">
                        <button className="btn-primary" disabled={true}>
                            View Conversation
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
