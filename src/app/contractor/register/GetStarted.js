import { Button } from "flowbite-react";
import { useState } from "react";

export default function GetStarted({ business, setBusiness, handle, ...rest }) {
    const [isCompleted, setIsCompleted] = useState(true);

    return (
        <>
            <div className="mb-8 w-full px-8" {...rest}>
                <h2 className="max-w-6xl text-4xl font-bold text-white">
                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                        Register Your Business
                    </span>
                </h2>

                <p className="mt-6 mb-8 max-w-2xl text-left leading-8 text-gray-600 dark:text-gray-400">
                    We will guide you through the process of registering your business. This will
                    enable you to utilize the features offered by our platform and help grow your
                    customer base.
                </p>

                <div className="mt-4">
                    <Button className="w-full" onClick={handle} disabled={!isCompleted}>
                        Lets Get Started
                    </Button>
                </div>
            </div>
        </>
    );
}
