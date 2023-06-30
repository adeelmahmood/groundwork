"use client";

import { formatPhoneNumber } from "@/utils/utils";
import { Button, Card } from "flowbite-react";

export default function LeadCard({
    lead,
    showViewConversation = true,
}: {
    lead: any;
    showViewConversation: boolean;
}) {
    return (
        <>
            <Card className="max-w-sm">
                <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    <p>{lead.job_details}</p>
                </h5>
                <div className="mt-2 font-normal text-gray-700 dark:text-gray-400">
                    <p className="font-semibold">{lead.customer_name}</p>
                    <p>{lead.customer_email}</p>
                    <p>{formatPhoneNumber(lead.customer_phone)}</p>

                    <p className="mt-4 font-semibold">Timing</p>
                    <p>{lead.timing}</p>

                    <p className="mt-4 font-semibold">Address</p>
                    <p>{lead.customer_address}</p>

                    <p className="mt-4 font-semibold">Availability</p>
                    <p>{lead.customer_availability}</p>
                </div>

                {showViewConversation && (
                    <div className="mt-2">
                        <Button
                            href={`/contractor/dashboard/conversation/${
                                lead.business_id
                            }?phone=${encodeURIComponent(
                                lead.customer_phone
                            )}&lead=${encodeURIComponent(lead.id)}`}
                        >
                            View Conversation
                        </Button>
                    </div>
                )}
            </Card>
        </>
    );
}
