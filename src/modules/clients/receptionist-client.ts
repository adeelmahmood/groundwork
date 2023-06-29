import { SimpleChatMessage } from "@/app/types";

export class AiReceptionistClient {
    private baseUrl: string = process.env.VERCEL_URL
        ? "https://" + process.env.VERCEL_URL
        : "http://localhost:3000";

    private internalCall = false;

    constructor(_internalCall: boolean = false) {
        this.internalCall = _internalCall;
    }

    async reply(
        input: SimpleChatMessage,
        history: SimpleChatMessage[],
        business: any,
        promptConfig: any
    ) {
        const { business_prompts, business_settings, ...b } = business;

        const response = await fetch(
            `${!this.internalCall ? this.baseUrl : ""}/api/ai-receptionist`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input: input.message,
                    history,
                    business: b,
                    promptConfig,
                }),
            }
        );

        const data = await response.json();

        if (response.status !== 200) {
            console.log(`error in calling ai receptionist ${data.error}`);
            throw new Error(`error in calling ai receptionist ${data.error}`);
        }

        // return the AI response
        return data.response;
    }
}
