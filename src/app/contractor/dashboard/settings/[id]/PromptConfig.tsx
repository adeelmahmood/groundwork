import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PROMPTSCONFIG, TABLE_BUSINESS_PROMPTS } from "@/utils/constants";
import { Button, Label, TextInput, Textarea } from "flowbite-react";

export default function PromptConfig({ businessPrompt }: { businessPrompt: any }) {
    const [loading, isLoading] = useState(false);
    const [updated, setUpdated] = useState(false);

    const [prompt, setPrompt] = useState(businessPrompt?.prompt);
    const [temperature, setTemperature] = useState<number>(businessPrompt?.temperature);

    const supabase = createClientComponentClient();

    const updateSettings = async () => {
        isLoading(true);
        setUpdated(false);

        const { error } = await supabase
            .from(TABLE_BUSINESS_PROMPTS)
            .update({
                prompt,
                temperature,
            })
            .eq("business_id", businessPrompt.business_id)
            .eq("prompt_type", businessPrompt.prompt_type);
        isLoading(false);
        if (error) {
            console.log(error);
        } else {
            setUpdated(true);
        }
    };

    const resetSettings = async () => {
        const config = PROMPTSCONFIG as any;
        setPrompt(config[businessPrompt.prompt_type].prompt);
        setTemperature(config[businessPrompt.prompt_type].temperature);
    };

    return (
        <div className="mt-8 w-full max-w-7xl">
            <Label className="uppercase">{businessPrompt.prompt_type} Prompt</Label>
            <Textarea
                className="mt-2"
                rows={15}
                placeholder="Prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />

            <div className="flex flex-col-reverse gap-y-2 mt-2 lg:flex-row lg:gap-y-0 lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                    <Button color="light" onClick={updateSettings} disabled={loading}>
                        Update Settings
                    </Button>
                    <Button color="light" onClick={resetSettings} disabled={loading}>
                        Reset Settings
                    </Button>
                    {updated && <span className="text-teal-500">Updated Successfully</span>}
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:gap-x-2">
                    <Label>Temp 0 (deterministic) to 1 (creative) </Label>
                    <TextInput
                        type="number"
                        min={0}
                        max={1}
                        step={0.1}
                        className="mt-2 w-24"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
}
