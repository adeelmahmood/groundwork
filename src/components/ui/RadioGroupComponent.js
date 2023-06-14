import { RadioGroup } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function RadioGroupComponent({ value, setValue, label, options }) {
    return (
        <>
            <RadioGroup value={value} onChange={setValue}>
                <RadioGroup.Label className="mt-8 mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {label}
                </RadioGroup.Label>
                <div className="space-y-4">
                    {options?.map((opt, i) => (
                        <RadioGroup.Option
                            key={i}
                            value={opt.key}
                            className={({ active, checked }) =>
                                `relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none 
                        ${
                            checked
                                ? "bg-indigo-700 bg-opacity-75 dark:bg-green-600"
                                : "bg-gray-50 dark:bg-slate-700"
                        }`
                            }
                        >
                            {({ active, checked }) => (
                                <>
                                    <div className="flex w-full items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="text-sm">
                                                <RadioGroup.Label
                                                    as="p"
                                                    className={`font-medium ${
                                                        checked
                                                            ? "text-white"
                                                            : "text-gray-900 dark:text-gray-200"
                                                    }`}
                                                >
                                                    {opt.label}
                                                </RadioGroup.Label>
                                                <RadioGroup.Description
                                                    as="span"
                                                    className={`inline ${
                                                        checked
                                                            ? "text-sky-100"
                                                            : "text-gray-500 dark:text-gray-400"
                                                    }`}
                                                >
                                                    <span>{opt.info}</span>
                                                </RadioGroup.Description>
                                            </div>
                                        </div>
                                        {checked && (
                                            <div className="shrink-0 text-white">
                                                <CheckIcon className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </RadioGroup.Option>
                    ))}
                </div>
            </RadioGroup>
        </>
    );
}
