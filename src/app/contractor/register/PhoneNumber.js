import { ArrowLongRightIcon } from "@heroicons/react/24/solid";
import { Button, Label, TextInput } from "flowbite-react";
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
                    <Label htmlFor="phone">
                        Here is the phone number provisioned to your business
                    </Label>
                    <TextInput
                        id="phone"
                        type="text"
                        helperText="Your customers can use this number to contact you, inquire about services, and schedule appointments"
                        value={phone}
                        placeholder="Phone number for your business"
                        onChange={(e) => setPhone(e.target.value)}
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
