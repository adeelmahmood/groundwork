import { Button } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterComp({ business, setBusiness, handle, ...rest }) {
    const [isCompleted, setIsCompleted] = useState(true);
    const router = useRouter();

    const handleNext = async () => {
        console.log(JSON.stringify(business));
        const response = await fetch("/api/business", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ business }),
        });
        const data = await response.json();

        // redirect to contractor dashboard
        router.push(`/contractor/dashboard/${data?.id}`);
    };

    return (
        <>
            <div className="mb-8 w-full px-8" {...rest}>
                <h2 className="max-w-6xl text-4xl font-bold text-white">
                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                        Complete Registration
                    </span>
                </h2>

                <p className="mt-6 mb-8 max-w-2xl text-left leading-8 text-gray-600 dark:text-gray-400">
                    We will notify you by email once your AI bot is ready
                </p>

                <div className="mt-6">
                    <Button className="w-full" onClick={handleNext} disabled={!isCompleted}>
                        Complete
                    </Button>
                </div>
            </div>
        </>
    );
}
