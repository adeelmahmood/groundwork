import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function PhoneNumber({ business, setBusiness, handle, ...rest }) {
    const [isCompleted, setIsCompleted] = useState(true);

    const [phone, setPhone] = useState(business.registered_phone);

    useEffect(() => {
        setIsCompleted(phone);
    }, [phone]);

    const handleNext = async () => {
        setBusiness({
            ...business,
            registered_phone: phone,
        });

        handle?.();
    };

    return (
        <>
            <div className="mb-8 w-full px-8" {...rest}>
                <h2 className="max-w-6xl text-4xl font-bold text-white">
                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                        Acquire A Phone Number
                    </span>
                </h2>

                <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Here is the phone number provisioned to your business
                    </label>
                    <div className="text-lg font-bold">{phone}</div>
                    <p className="mt-2 text-sm  text-gray-700 dark:text-gray-200">
                        Your customers can use this number to contact you, inquire about services,
                        and schedule appointments
                    </p>
                </div>

                <div className="mt-10">
                    <button
                        className="btn-secondary w-full"
                        onClick={handleNext}
                        disabled={!isCompleted}
                    >
                        Next <ArrowLongRightIcon className="inline h-6 fill-current text-white" />
                    </button>
                </div>
            </div>
        </>
    );
}
