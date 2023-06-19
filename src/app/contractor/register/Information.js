import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function GetStarted({ business, setBusiness, handle, ...rest }) {
    const [isCompleted, setIsCompleted] = useState(true);

    const [name, setName] = useState(business.business_name);
    const [url, setUrl] = useState(business.business_url);
    const [description, setDescription] = useState(business.business_description);

    useEffect(() => {
        setIsCompleted(name && url);
    }, [name, url]);

    const handleNext = async () => {
        setBusiness({
            ...business,
            business_name: name,
            business_url: url,
            business_description: description,
        });

        handle?.();
    };

    return (
        <>
            <div className="mb-8 w-full px-8" {...rest}>
                <h2 className="max-w-6xl text-4xl font-bold text-white">
                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                        Tell Us About Your Business
                    </span>
                </h2>

                <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        What is the name of your business
                    </label>
                    <input
                        className="mb-3 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-600 dark:focus:ring-blue-400"
                        type="text"
                        value={name}
                        placeholder="Name of your business"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Website for your business
                    </label>
                    <input
                        className="mb-3 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-600 dark:focus:ring-blue-400"
                        type="text"
                        placeholder="Website URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Tell us about your business
                    </label>

                    <textarea
                        className="mt-2 w-full rounded-lg border-gray-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-200 dark:focus:border-teal-500 dark:focus:ring-teal-500 disabled:bg-gray-100"
                        rows={7}
                        placeholder="E.g. Job Roberts Construction specializes in interior renovations, including kitchens, bathrooms and basements. Jim Roberts, the owner, has been in business for over 20 years. Jim will be the individual who conducts the estimate appointment. Jim can be reached at jim@goautopilot.co. Jim Roberts Construction does not perform exterior projects, including roofing, fencing, decking, eavestroughs and siding."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <p className="text-sm  text-gray-700 dark:text-gray-200">
                        We will use this information to answer any questions that the customer may
                        have about the services that you offer. Additionally, including contact
                        information can be helpful in directing customer inquiries
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
