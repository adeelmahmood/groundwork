import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TABLE_BUSINESS_SETTINGS } from "@/utils/constants";

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
            <label className="uppercase">{setting.setting_name}</label>
            <input
                className="my-2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-600 dark:focus:ring-blue-400"
                type="text"
                placeholder=""
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />

            <div className="flex items-center gap-2">
                <button className="btn-primary" onClick={updateSetting} disabled={loading}>
                    Update Setting
                </button>

                {updated && <span className="text-teal-500">Updated Successfully</span>}
            </div>
        </div>
    );
}
