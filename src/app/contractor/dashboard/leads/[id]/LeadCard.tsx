"use client";

import { formatPhoneNumber } from "@/utils/utils";
import { Button, Card, Carousel } from "flowbite-react";
import Link from "next/link";

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

                {lead.images?.length > 0 && (
                    <div className="h-44">
                        <Carousel slide={false}>
                            {lead.images.map((image: string, i: number) => {
                                let url = image.substring(image.indexOf("(") + 1);
                                url = url.substring(0, url.length - 1);
                                return <img key={i} alt="..." src={url} />;
                            })}
                        </Carousel>
                    </div>
                )}

                {showViewConversation && (
                    <div className="mt-2">
                        <Button className="w-full">
                            <Link
                                href={`/contractor/dashboard/conversation/${
                                    lead.business_id
                                }?phone=${encodeURIComponent(
                                    lead.customer_phone
                                )}&lead=${encodeURIComponent(lead.id)}`}
                            >
                                View Conversation
                            </Link>
                        </Button>
                    </div>
                )}
            </Card>
        </>
    );
}
