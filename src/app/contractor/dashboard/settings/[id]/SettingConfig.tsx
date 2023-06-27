import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TABLE_BUSINESS_SETTINGS } from "@/utils/constants";
import { Button, Label, TextInput } from "flowbite-react";

export default function SettingConfig({ setting }: { setting: any }) {
    const [loading, isLoading] = useState(false);
    const [updated, setUpdated] = useState(false);

    const [value, setValue] = useState(setting.setting_value);

    const supabase = createClientComponentClient();

    const updateSetting = async () => {
        isLoading(true);
        setUpdated(false);

        const { error } = await supabase
            .from(TABLE_BUSINESS_SETTINGS)
            .update({
                setting_value: value,
            })
            .eq("business_id", setting.business_id)
            .eq("setting_name", setting.setting_name);
        isLoading(false);
        if (error) {
            console.log(error);
        } else {
            setUpdated(true);
        }
    };

    return (
        <div className="mt-8 flex flex-col max-w-md">
            <Label className="uppercase">{setting.setting_name}</Label>
            <TextInput
                className="my-2"
                type="text"
                placeholder={setting.setting_name}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />

            <div className="flex items-center gap-2">
                <Button color="light" onClick={updateSetting} disabled={loading}>
                    Update Setting
                </Button>

                {updated && <span className="text-teal-500">Updated Successfully</span>}
            </div>
        </div>
    );
}
