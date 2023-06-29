import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import { Button, Label, TextInput, Textarea } from "flowbite-react";
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
                    <Label htmlFor="name">What is the name of your business</Label>
                    <TextInput
                        id="name"
                        type="text"
                        value={name}
                        placeholder="Name of your business"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="mt-6">
                    <Label htmlFor="url">Website for your business</Label>
                    <TextInput
                        id="url"
                        type="text"
                        placeholder="Website URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <div className="mt-6">
                    <Label htmlFor="description">Tell us about your business</Label>

                    <Textarea
                        id="description"
                        helperText="We will use this information to answer any questions that the customer may have about the services that you offer. Additionally, including contact information can be helpful in directing customer inquiries"
                        rows={7}
                        placeholder="E.g. Job Roberts Construction specializes in interior renovations, including kitchens, bathrooms and basements. Jim Roberts, the owner, has been in business for over 20 years. Jim will be the individual who conducts the estimate appointment. Jim can be reached at jim@goautopilot.co. Jim Roberts Construction does not perform exterior projects, including roofing, fencing, decking, eavestroughs and siding."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="mt-10">
                    <Button className="w-full" onClick={handleNext} disabled={!isCompleted}>
                        Next <ArrowLongRightIcon className="inline h-6 fill-current text-white" />
                    </Button>
                </div>
            </div>
        </>
    );
}
