import DialogComponent from "@/components/ui/DialogComponent";
import { AdjustmentsVerticalIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export default function ConfigDialog({
    prompt,
    setPrompt,
    temperature,
    setTemperature,
    formulateQuestion,
    setFormulateQuestion,
    closeFnc,
}: {
    prompt: string;
    setPrompt: any;
    temperature: number;
    setTemperature: any;
    formulateQuestion: boolean;
    setFormulateQuestion: any;
    closeFnc: any;
}) {
    let [modalOpen, setModalOpen] = useState<boolean>();

    function closeModal() {
        setModalOpen(false);
        closeFnc?.();
    }

    return (
        <>
            <button onClick={() => setModalOpen(true)}>
                <AdjustmentsVerticalIcon className="inline h-10 fill-current text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" />
            </button>
            <DialogComponent
                heading="AI Agent Configuration"
                isModelOpen={modalOpen}
                modelCloseHandler={closeModal}
                width="max-w-7xl"
            >
                <div>
                    {/* <div className="mt-4 w-full max-w-7xl">
                        <ListBoxComponent
                            value={selectedConfig}
                            setValue={setSelectecConfig}
                            valueDisplay={(c: any) => c?.name}
                            options={configs}
                        />
                    </div> */}
                    <div className="mt-4 w-full max-w-7xl">
                        <label>Prompt</label>
                        <textarea
                            className="mt-2 w-full rounded-lg border-gray-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-200 dark:focus:border-teal-500 dark:focus:ring-teal-500 disabled:bg-gray-100"
                            rows={15}
                            placeholder="Prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    <div className="w-full flex flex-col-reverse gap-y-2 mt-2 lg:mt-0 lg:flex-row lg:gap-y-0 lg:items-center lg:justify-between">
                        <button className="btn-clear" onClick={() => closeModal()}>
                            Use this configuration
                        </button>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-x-2">
                            <label>Temp 0 (deterministic) to 1 (creative) </label>
                            <input
                                type="number"
                                min={0}
                                max={1}
                                step={0.1}
                                className="mt-2 w-14 rounded-lg border-gray-300 text-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-200 dark:focus:border-teal-500 dark:focus:ring-teal-500 disabled:bg-gray-100"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-x-2">
                            <label>Formulate Question (from history)</label>
                            <input
                                className="mt-2"
                                type="checkbox"
                                checked={formulateQuestion}
                                onChange={() => setFormulateQuestion(!formulateQuestion)}
                            />
                        </div>
                    </div>
                </div>
            </DialogComponent>
        </>
    );
}
