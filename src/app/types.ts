export interface Business {
    id: string;
    business_name: string;
    business_url: string;
    contractor_id: string;
    business_description: string;
}

export interface BusinessPrompt {
    id: string;
    prompt: string;
    temperature: number;
    business_id: string;
    prompt_type: string;
}

export interface BusinessSetting {}

export interface SmsMessage {}
